# schemas/sd3_schema.py
import pandera as pa
from pandera import Column, Check
import pandas as pd
from typing import Iterable, Optional


def _to_yyyymmdd(s: pd.Series) -> pd.Series:
    # acepta Date/datetime/string y normaliza a 'YYYYMMDD' para comparar
    s = pd.to_datetime(s, errors="coerce")
    return s.dt.strftime("%Y%m%d")


def make_SD3_transfer_schema(
    valid_almacenes: Optional[Iterable[str]] = None,
    allow_tm=("001", "008"),
):
    """
    Valida:
      - D3_TM en allow_tm (usamos principalmente '008' para traslado interno)
      - Por (D3_DOC, D3_XNROTRA):
          * exactas 2 líneas con TM='008'
          * misma fecha, producto y UM
          * cantidades opuestas (una negativa, otra positiva) y mismo |qty|
          * almacenes origen != destino
    """

    def _parejas_traslado(df: pd.DataFrame) -> bool:
        x = df.copy()
        x["D3_EMISSAO"] = _to_yyyymmdd(x["D3_EMISSAO"])
        ok_all = True

        # sólo traslados
        grp = x[x["D3_TM"] == "008"].groupby(["D3_DOC", "D3_XNROTRA"], dropna=False)
        for (doc, serie), g in grp:
            if len(g) != 2:
                return False
            a, b = g.iloc[0], g.iloc[1]
            # misma fecha, producto y UM
            if not (
                a.D3_EMISSAO == b.D3_EMISSAO
                and a.D3_COD == b.D3_COD
                and a.D3_UM == b.D3_UM
            ):
                return False
            # origen/destino distintos
            if a.D3_LOCAL == b.D3_LOCAL:
                return False
            # una negativa, otra positiva, mismo absoluto
            if not (
                (a.D3_QUANT < 0 and b.D3_QUANT > 0)
                or (a.D3_QUANT > 0 and b.D3_QUANT < 0)
            ):
                return False
            if round(abs(float(a.D3_QUANT)), 3) != round(abs(float(b.D3_QUANT)), 3):
                return False
        return ok_all

    cols = {
        "D3_ID": Column(int, nullable=True),
        "D3_FILIAL": Column(str, nullable=True),
        "D3_DOC": Column(str, nullable=True),
        "D3_XNROTRA": Column(str, nullable=True),
        "D3_COD": Column(str),
        "D3_UM": Column(str),
        "D3_QUANT": Column(float),
        "D3_QTSEGUM": Column(float, nullable=True),
        "D3_CUSTO1": Column(float, nullable=True),
        "D3_LOCAL": Column(str),
        "D3_EMISSAO": Column(
            object
        ),  # admitimos Date/datetime; normalizamos dentro del check
        "D3_TM": Column(str, Check.isin(list(allow_tm))),
        "D3_USUARIO": Column(str, nullable=True),
        "D3_ESTORNO": Column(str, nullable=True),
        "D_E_L_E_T_": Column(str, nullable=True),
    }
    if valid_almacenes:
        cols["D3_LOCAL"] = Column(str, Check.isin(list(valid_almacenes)))
    return pa.DataFrameSchema(
        cols,
        checks=[
            Check(
                _parejas_traslado,
                error="Traslado 008 debe tener 2 líneas opuestas por (D3_DOC,D3_XNROTRA).",
            )
        ],
        strict=True,
        coerce=True,
    )


def validate_SD3_vs_PB7(df_sd3: pd.DataFrame, df_pb7: pd.DataFrame) -> None:
    """
    Cruce operativo:
      Para cada traslado 008 (par por (DOC,XNROTRA)):
        existe PB7 con:
          PB7_FILIAL = FILIAL de la línea de SALIDA (qty negativa)
          PB7_PRODUT = D3_COD
          PB7_QTDE   = abs(D3_QUANT)
          PB7_DATA   = D3_EMISSAO
          PB7_LOCENT = LOCAL de la línea de ENTRADA (qty positiva)
        (opcional) PB7_XDESP == D3_XNROTRA
    Lanza ValueError con detalles si algún par no matchea.
    """
    s3 = df_sd3.copy()
    p7 = df_pb7.copy()

    s3["D3_EMISSAO"] = _to_yyyymmdd(s3["D3_EMISSAO"])
    p7["PB7_DATA"] = _to_yyyymmdd(p7["PB7_DATA"])

    errores = []
    grp = s3[s3["D3_TM"] == "008"].groupby(["D3_DOC", "D3_XNROTRA"], dropna=False)
    for (doc, serie), g in grp:
        if len(g) != 2:
            errores.append(f"{doc}/{serie}: se esperaban 2 líneas 008, hay {len(g)}")
            continue
        # identificar salida (negativa) y entrada (positiva)
        salida = g.loc[g["D3_QUANT"] < 0].iloc[0] if (g["D3_QUANT"] < 0).any() else None
        entrada = (
            g.loc[g["D3_QUANT"] > 0].iloc[0] if (g["D3_QUANT"] > 0).any() else None
        )
        if salida is None or entrada is None:
            errores.append(f"{doc}/{serie}: faltan salida o entrada (signos).")
            continue

        cond = (
            (p7["PB7_FILIAL"] == salida["D3_FILIAL"])
            & (p7["PB7_PRODUT"] == salida["D3_COD"])
            & (
                p7["PB7_QTDE"].astype(float).round(3)
                == abs(float(salida["D3_QUANT"])).__round__(3)
            )
            & (p7["PB7_DATA"] == salida["D3_EMISSAO"])
            & (p7["PB7_LOCENT"] == entrada["D3_LOCAL"])
        )
        # opcional: si querés exigir XDESP == XNROTRA, descomenta
        # cond = cond & (p7["PB7_XDESP"].fillna("") == (serie or ""))

        if not cond.any():
            errores.append(
                f"{doc}/{serie}: no hay PB7 que matchee "
                f"(FILIAL={salida['D3_FILIAL']}, PROD={salida['D3_COD']}, QTD={abs(float(salida['D3_QUANT']))}, "
                f"FECHA={salida['D3_EMISSAO']}, DEST={entrada['D3_LOCAL']})"
            )

    if errores:
        raise ValueError("SD3↔PB7 inconsistencias:\n- " + "\n- ".join(errores))
