# movimientos_gen.py  — SOLO TRASLADO INTERNO
import numpy as np
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session

from ..models import SB1300, NNR300, SD3300, PB7300

fake = Faker("es_ES")


# -------------------- Helpers --------------------
def _yyyymmdd(d: date) -> str:
    return d.strftime("%Y%m%d")


def _pick_qty(um: str) -> float:
    # Rango por UM (ajusta si querés otros)
    if um == "LT":
        return float(np.random.uniform(5_000, 150_000))
    elif um in ("BL", "QQ"):
        return float(np.random.uniform(50, 1_200))
    return float(np.random.uniform(50, 5_000))


# -------------------- Generación --------------------
def generate_internal_transfers(
    session: Session,
    start_date: date,
    end_date: date,
    transfers_per_day: int = 6,
    filiales=("AG", "SC", "LP"),
    usuario: str = "ztransfer",
    link_xdesp_to_xnrotra: bool = True,
):
    """
    Genera traslados internos (SD3300 TM='008') con dos líneas por traslado
    (salida negativa en almacén origen y entrada positiva en almacén destino)
    y un único PB7300 que representa el despacho físico.

    Relaciones operativas:
      - Par SD3300 comparte (D3_DOC, D3_XNROTRA), misma fecha y producto/UM.
      - PB7_FILIAL = filial de la salida (negativa)
      - PB7_PRODUT = D3_COD
      - PB7_QTDE   = ABS(D3_QUANT de la salida)
      - PB7_DATA   = D3_EMISSAO
      - PB7_LOCENT = almacén destino (línea positiva)
      - (opcional) PB7_XDESP = D3_XNROTRA
    """
    # Catálogos
    prods = session.query(SB1300).filter(SB1300.D_E_L_E_T_ == " ").all()
    if not prods:
        raise ValueError("No hay productos activos en SB1300 (D_E_L_E_T_=' ').")

    alm_list = [a.NNR_COD for a in session.query(NNR300).all()]
    if len(alm_list) < 2:
        raise ValueError("Se requieren al menos 2 almacenes en NNR300.")

    curr = start_date
    while curr <= end_date:
        for _ in range(transfers_per_day):
            prod = np.random.choice(prods)
            um = prod.B1_UM
            qty = _pick_qty(um)  # POSITIVA base

            # Origen/destino (distintos)
            alm_origen = np.random.choice(alm_list)
            alm_dest = np.random.choice([a for a in alm_list if a != alm_origen])

            # Filiales (pueden ser iguales o distintas)
            fil_origen = np.random.choice(filiales)
            fil_dest = np.random.choice(
                [f for f in filiales if f != fil_origen] + [fil_origen]
            )

            # Documento y serie de traslado
            d3_doc = f"TR{np.random.randint(100000, 999999)}"
            d3_serie = f"TR-{fil_origen}-{_yyyymmdd(curr)}"

            # --- SD3300: salida (negativa) ---
            session.add(
                SD3300(
                    D3_FILIAL=fil_origen,
                    D3_DOC=d3_doc,
                    D3_XNROTRA=d3_serie,
                    D3_COD=prod.B1_COD,
                    D3_UM=um,
                    D3_QUANT=-qty,  # salida
                    D3_QTSEGUM=None,
                    D3_CUSTO1=None,
                    D3_LOCAL=alm_origen,  # almacén origen
                    D3_EMISSAO=curr,  # Date: tu modelo usa Date
                    D3_TM="008",  # traslado interno
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )

            # --- SD3300: entrada (positiva) ---
            session.add(
                SD3300(
                    D3_FILIAL=fil_dest,
                    D3_DOC=d3_doc,
                    D3_XNROTRA=d3_serie,
                    D3_COD=prod.B1_COD,
                    D3_UM=um,
                    D3_QUANT=qty,  # entrada
                    D3_QTSEGUM=None,
                    D3_CUSTO1=None,
                    D3_LOCAL=alm_dest,  # almacén destino
                    D3_EMISSAO=curr,  # misma fecha
                    D3_TM="008",
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )

            # --- PB7300: despacho en balanza (Sucursal ORIGEN) ---
            bruto = qty + (
                np.random.uniform(50, 500)
                if um in ("LT", "KG")
                else np.random.uniform(0, 10)
            )
            tara = np.random.uniform(0, 5)
            session.add(
                PB7300(
                    PB7_FILIAL=fil_origen,
                    PB7_DATA=curr,
                    PB7_DSAIDA=curr,
                    PB7_PEDIDO=None,
                    PB7_SEQUEN=None,
                    PB7_ITEMPV=None,  # sin pedido
                    PB7_PRODUT=prod.B1_COD,
                    PB7_QTDE=qty,  # positivo
                    PB7_STATUS="S",  # Salida
                    PB7_PBRUTO=float(bruto),
                    PB7_PTARA=float(tara),
                    PB7_PLACA=f"ABC-{np.random.randint(100,999)}",
                    PB7_CHOFER=fake.name(),
                    PB7_TELEFO=fake.phone_number(),
                    PB7_DOCUME=str(np.random.randint(1_000_000, 9_999_999)),
                    PB7_XDESP=d3_serie if link_xdesp_to_xnrotra else None,
                    PB7_LOCENT=alm_dest,  # destino
                    PB7_XZAFRA=str(curr.year),
                    PB7_XOBS=None,
                    PB7_OBSERV="Traslado interno",
                )
            )
        curr += timedelta(days=1)


# -------------------- Validación liviana --------------------
def validate_internal_transfers(session: Session) -> dict:
    """
    Valida que:
      - Cada (D3_DOC, D3_XNROTRA) de TM='008' tenga EXACTAMENTE 2 líneas.
      - Mismo producto/UM/fecha, almacenes distintos, cantidades opuestas con mismo valor absoluto.
      - Exista PB7300 que matchee por:
          PB7_FILIAL = filial de la salida (negativa)
          PB7_PRODUT = producto
          PB7_QTDE   = abs(cantidad salida)
          PB7_DATA   = fecha
          PB7_LOCENT = almacén destino (línea positiva)
    Lanza ValueError con el detalle si encuentra inconsistencias.
    """
    from sqlalchemy import and_

    # Traer SD3 008
    sd3_rows = session.query(SD3300).filter(SD3300.D3_TM == "008").all()
    if not sd3_rows:
        return {"sd3_pairs": 0, "pb7_matches": 0}

    # Index PB7 para matching rápido
    pb7_rows = session.query(PB7300).all()
    idx_pb7 = {}
    for r in pb7_rows:
        k = (r.PB7_FILIAL, r.PB7_PRODUT, float(r.PB7_QTDE), r.PB7_DATA, r.PB7_LOCENT)
        idx_pb7.setdefault(k, 0)
        idx_pb7[k] += 1

    # Agrupar SD3 por (doc, serie)
    from collections import defaultdict

    grp = defaultdict(list)
    for r in sd3_rows:
        grp[(r.D3_DOC, r.D3_XNROTRA)].append(r)

    errors = []
    ok_pairs = 0
    ok_pb7 = 0

    for key, rows in grp.items():
        doc, serie = key
        if len(rows) != 2:
            errors.append(f"{doc}/{serie}: se esperaban 2 líneas 008, hay {len(rows)}")
            continue
        a, b = rows[0], rows[1]

        # una negativa y otra positiva
        if not (
            (a.D3_QUANT < 0 and b.D3_QUANT > 0) or (a.D3_QUANT > 0 and b.D3_QUANT < 0)
        ):
            errors.append(f"{doc}/{serie}: cantidades no tienen signos opuestos.")
            continue

        # normalizar (salida, entrada)
        salida, entrada = (a, b) if a.D3_QUANT < 0 else (b, a)

        # misma fecha/producto/UM, almacenes distintos, magnitud igual
        if salida.D3_COD != entrada.D3_COD or salida.D3_UM != entrada.D3_UM:
            errors.append(f"{doc}/{serie}: producto/UM difieren entre líneas.")
            continue
        if salida.D3_EMISSAO != entrada.D3_EMISSAO:
            errors.append(
                f"{doc}/{serie}: fechas difieren (salida {salida.D3_EMISSAO} vs entrada {entrada.D3_EMISSAO})."
            )
            continue
        if salida.D3_LOCAL == entrada.D3_LOCAL:
            errors.append(
                f"{doc}/{serie}: almacén origen y destino son iguales ({salida.D3_LOCAL})."
            )
            continue
        if round(abs(float(salida.D3_QUANT)), 3) != round(float(entrada.D3_QUANT), 3):
            errors.append(f"{doc}/{serie}: cantidades no coinciden en valor absoluto.")
            continue

        ok_pairs += 1

        # match PB7
        k = (
            salida.D3_FILIAL,
            salida.D3_COD,
            round(abs(float(salida.D3_QUANT)), 3),
            salida.D3_EMISSAO,
            entrada.D3_LOCAL,
        )
        # redondeo de QTDE al mismo criterio
        matched = any(
            (
                pf == salida.D3_FILIAL
                and pp == salida.D3_COD
                and round(float(pq), 3) == round(abs(float(salida.D3_QUANT)), 3)
                and pd == salida.D3_EMISSAO
                and pl == entrada.D3_LOCAL
            )
            for (pf, pp, pq, pd, pl) in idx_pb7.keys()
        )
        if not matched:
            errors.append(
                f"{doc}/{serie}: no hay PB7 que matchee (FILIAL={salida.D3_FILIAL}, PROD={salida.D3_COD}, "
                f"QTD={abs(float(salida.D3_QUANT))}, FECHA={salida.D3_EMISSAO}, DEST={entrada.D3_LOCAL})."
            )
        else:
            ok_pb7 += 1

    if errors:
        raise ValueError(
            "Inconsistencias en traslados internos:\n- " + "\n- ".join(errors)
        )

    return {"sd3_pairs": ok_pairs, "pb7_matches": ok_pb7}
