# sd2_schema.py
import pandera as pa
from pandera import Column, Check
from datetime import datetime, date
from typing import Iterable, Mapping, Optional, Tuple, Set


def _is_yyyymmdd(s) -> bool:
    try:
        ok = s.astype(str).str.fullmatch(r"\d{8}$").all()
        return bool(ok)
    except Exception:
        return False


def make_SD2_schema(
    # Catálogos (opcionalmente pásalos; si son None, no se valida ese catálogo)
    valid_productos: Optional[Iterable[str]] = None,
    product_um_map: Optional[Mapping[str, str]] = None,  # B1_COD -> B1_UM
    valid_ums: Optional[Iterable[str]] = None,
    valid_clientes: Optional[Iterable[str]] = None,
    valid_lojas: Optional[Iterable[str]] = None,
    valid_filiais: Optional[Iterable[str]] = None,
    valid_almacenes: Optional[Iterable[str]] = None,
    valid_tes: Optional[Iterable[str]] = None,  # ej. {"501","510","540"}
    # FKs
    sc6_keys: Optional[
        Set[Tuple[str, str, int]]
    ] = None,  # (C6_NUM, C6_FILIAL, C6_ITEM)
    sc6_prod_map: Optional[
        Mapping[Tuple[str, str, int], str]
    ] = None,  # (num, filial, item) -> C6_PRODUTO
    sc6_um_map: Optional[
        Mapping[Tuple[str, str, int], str]
    ] = None,  # (num, filial, item) -> C6_UM
    pb7_keys: Optional[
        Set[Tuple[str, str, int, int]]
    ] = None,  # (PEDIDO, FILIAL, SEQUEN, ITEMPV)
    # Reglas adicionales
    min_date: Optional[date] = None,
    max_date: Optional[date] = None,
    enforce_not_deleted: bool = False,  # exigir D_E_L_E_T_ = ' '
) -> pa.DataFrameSchema:

    # ---- Checks a nivel DataFrame ----
    def _unique_pk(df):
        # PK lógica: (D2_DOC, D2_SERIE, D2_FILIAL, D2_SEQUEN)
        return ~df.duplicated(
            subset=["D2_DOC", "D2_SERIE", "D2_FILIAL", "D2_SEQUEN"]
        ).any()

    def _total_consistente(df):
        # tolerancia = max(0.5, 1% del esperado)
        esperado = (df["D2_QUANT"].fillna(0) * df["D2_PRCVEN"].fillna(0)).abs()
        tol = esperado * 0.01
        tol = tol.where(tol > 0.5, 0.5)
        dif = (df["D2_TOTAL"].fillna(0) - esperado).abs()
        return dif.le(tol).all()

    def _fechas_validas(df):
        # formato
        if not _is_yyyymmdd(df["D2_EMISSAO"]) or not _is_yyyymmdd(df["D2_DTDIGIT"]):
            return False
        # rango si se provee
        if min_date and max_date:

            def in_range(s):
                d = datetime.strptime(str(s), "%Y%m%d").date()
                return min_date <= d <= max_date

            ok_emis = df["D2_EMISSAO"].astype(str).map(in_range).all()
            ok_dig = df["D2_DTDIGIT"].astype(str).map(in_range).all()
            if not (ok_emis and ok_dig):
                return False
        # digitación >= emisión (común en ERPs)
        emis = (
            df["D2_EMISSAO"].astype(str).map(lambda x: datetime.strptime(x, "%Y%m%d"))
        )
        digi = (
            df["D2_DTDIGIT"].astype(str).map(lambda x: datetime.strptime(x, "%Y%m%d"))
        )
        return (digi >= emis).all()

    def _fk_sc6(df):
        if sc6_keys is None:
            return True
        # (PEDIDO, FILIAL, ITEMPV) debe existir en SC6
        keys = list(
            zip(
                df["D2_PEDIDO"].astype(str),
                df["D2_FILIAL"].astype(str),
                df["D2_ITEMPV"].astype(int),
            )
        )
        base_ok = all(tuple(k) in sc6_keys for k in keys)
        if not base_ok:
            return False
        # producto/UM coherentes con SC6 si nos pasaron mapas
        if sc6_prod_map is not None:
            for _, r in df.iterrows():
                key = (str(r["D2_PEDIDO"]), str(r["D2_FILIAL"]), int(r["D2_ITEMPV"]))
                prod_sc6 = sc6_prod_map.get(key)
                if prod_sc6 and str(prod_sc6) != str(r["D2_COD"]):
                    return False
        if sc6_um_map is not None:
            for _, r in df.iterrows():
                key = (str(r["D2_PEDIDO"]), str(r["D2_FILIAL"]), int(r["D2_ITEMPV"]))
                um_sc6 = sc6_um_map.get(key)
                if um_sc6 and str(um_sc6) != str(r["D2_UM"]):
                    return False
        return True

    def _fk_pb7(df):
        if pb7_keys is None:
            return True
        # (PEDIDO, FILIAL, SEQUEN, ITEMPV) debe existir en PB7
        keys = list(
            zip(
                df["D2_PEDIDO"].astype(str),
                df["D2_FILIAL"].astype(str),
                df["D2_SEQUEN"].astype(int),
                df["D2_ITEMPV"].astype(int),
            )
        )
        return all(tuple(k) in pb7_keys for k in keys)

    def _um_vs_producto(df):
        if product_um_map is None:
            return True
        for _, r in df.iterrows():
            um_ref = product_um_map.get(str(r["D2_COD"]))
            if um_ref and str(um_ref) != str(r["D2_UM"]):
                return False
        return True

    def _remito_ok(df):
        # remito/serie obligatorios y no vacíos
        return (
            df["D2_REMITO"].astype(str).str.len().gt(0).all()
            and df["D2_SERIREM"].astype(str).str.len().gt(0).all()
        )

    def _no_deleted(df):
        if "D_E_L_E_T_" not in df.columns or not enforce_not_deleted:
            return True
        return (df["D_E_L_E_T_"].fillna(" ") == " ").all()

    checks_df = [
        Check(
            _unique_pk,
            error="PK lógica duplicada: (D2_DOC, D2_SERIE, D2_FILIAL, D2_SEQUEN).",
        ),
        Check(
            _total_consistente,
            error="D2_TOTAL no coincide con D2_QUANT*D2_PRCVEN (±1% o 0.5).",
        ),
        Check(
            _fechas_validas,
            error="Fechas inválidas (formato YYYYMMDD, rango o D2_DTDIGIT < D2_EMISSAO).",
        ),
        Check(
            _fk_sc6,
            error="No existe correspondencia con SC6 (o producto/UM no coinciden).",
        ),
        Check(
            _fk_pb7,
            error="No existe correspondencia con PB7 (PEDIDO,FILIAL,SEQUEN,ITEMPV).",
        ),
        Check(_um_vs_producto, error="UM no coincide con la UM del producto (SB1)."),
        Check(_remito_ok, error="D2_REMITO / D2_SERIREM vacíos."),
        Check(_no_deleted, error="Registros marcados como eliminados."),
    ]

    cols = {
        "D2_DOC": Column(str),
        "D2_SERIE": Column(str),
        "D2_FILIAL": Column(
            str, Check.isin(list(valid_filiais)) if valid_filiais else None
        ),
        "D2_PEDIDO": Column(str),
        "D2_SEQUEN": Column(int, Check.ge(1)),
        "D2_ITEMPV": Column(int, Check.ge(1)),
        "D2_COD": Column(
            str, Check.isin(list(valid_productos)) if valid_productos else None
        ),
        "D2_QUANT": Column(float, Check.gt(0)),
        "D2_QTSEGUM": Column(float, Check.ge(0), nullable=True),
        "D2_UM": Column(str, Check.isin(list(valid_ums)) if valid_ums else None),
        "D2_EMISSAO": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "D2_LOCAL": Column(
            str, Check.isin(list(valid_almacenes)) if valid_almacenes else None
        ),
        "D2_TIPODOC": Column(str, Check.eq("50")),  # Remito
        "D2_TES": Column(str, Check.isin(list(valid_tes)) if valid_tes else None),
        "D2_PRCVEN": Column(float, Check.ge(0)),
        "D2_TOTAL": Column(float, Check.ge(0)),
        "D2_CLIENTE": Column(
            str, Check.isin(list(valid_clientes)) if valid_clientes else None
        ),
        "D2_LOJA": Column(str, Check.isin(list(valid_lojas)) if valid_lojas else None),
        "D2_CCUSTO": Column(str, nullable=True),
        "D2_CONTA": Column(str, nullable=True),
        "D2_GRUPO": Column(str, nullable=True),
        "D2_REMITO": Column(str),
        "D2_SERIREM": Column(str),
        "D2_DTDIGIT": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "D_E_L_E_T_": Column(str, Check.isin([" ", "*"]), nullable=True),
    }

    return pa.DataFrameSchema(cols, checks=checks_df, strict=True, coerce=True)


# from sd2_schema import make_SD2_schema

# Construí catálogos y claves desde tus DataFrames / ORM
# valid_productos = {p.B1_COD for p in productos}
# product_um_map = {p.B1_COD: p.B1_UM for p in productos}
# valid_ums = {p.B1_UM for p in productos}
# valid_clientes = {c.A1_COD for c in clientes}
# valid_lojas = {c.A1_LOJA for c in clientes}
# valid_filiais = {"0001", "0002"}
# valid_almacenes = {a.ZH_ALM for a in almacenes}
# valid_tes = {"501", "510", "540"}

# # SC6/PB7 claves y mapas
# sc6_keys = {(r.C6_NUM, r.C6_FILIAL, r.C6_ITEM) for r in sc6_df.itertuples()}
# sc6_prod_map = {
#     (r.C6_NUM, r.C6_FILIAL, r.C6_ITEM): r.C6_PRODUTO for r in sc6_df.itertuples()
# }
# sc6_um_map = {(r.C6_NUM, r.C6_FILIAL, r.C6_ITEM): r.C6_UM for r in sc6_df.itertuples()}
# pb7_keys = {
#     (r.PB7_PEDIDO, r.PB7_FILIAL, r.PB7_SEQUEN, r.PB7_ITEMPV)
#     for r in pb7_df.itertuples()
# }

# schema = make_SD2_schema(
#     valid_productos=valid_productos,
#     product_um_map=product_um_map,
#     valid_ums=valid_ums,
#     valid_clientes=valid_clientes,
#     valid_lojas=valid_lojas,
#     valid_filiais=valid_filiais,
#     valid_almacenes=valid_almacenes,
#     valid_tes=valid_tes,
#     sc6_keys=sc6_keys,
#     sc6_prod_map=sc6_prod_map,
#     sc6_um_map=sc6_um_map,
#     pb7_keys=pb7_keys,
#     min_date=date(2025, 1, 1),
#     max_date=date(2025, 12, 31),
#     enforce_not_deleted=True,  # si tu dataset usa soft-delete
# )

# schema.validate(df_sd2, lazy=True)
