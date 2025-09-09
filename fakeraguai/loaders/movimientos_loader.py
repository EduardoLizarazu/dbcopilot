# loaders/movimientos_loader.py
from datetime import date
from sqlalchemy.orm import Session
import pandas as pd

from ..utils._utils import transactional
from ..models import SD3300, PB7300
from ..generators.movimientos_gen import generate_internal_transfers
from ..schemas.sd3_schema import make_SD3_transfer_schema, validate_SD3_vs_PB7


def load_internal_transfers(
    session: Session,
    start: date,
    end: date,
    transfers_per_day: int = 8,
    *,
    validate: bool = True,
    autocommit: bool = True,
    link_xdesp_to_xnrotra: bool = True,
):
    """
    Genera SOLO traslados internos:
      - SD3300: dos líneas TM='008' por documento (salida negativa + entrada positiva).
      - PB7300: 1 registro por traslado (STATUS='S'), vinculable por (filial, producto, qty, fecha, destino).

    Validaciones:
      1) SD3: pareja 008/008 consistente por (D3_DOC, D3_XNROTRA).
      2) SD3 ↔ PB7: match por (FILIAL salida, PROD, |QTY salida|, FECHA, DESTINO).
    """
    with transactional(session, autocommit=False):
        # 1) Generar traslados internos (SD3 + PB7)
        generate_internal_transfers(
            session,
            start_date=start,
            end_date=end,
            transfers_per_day=transfers_per_day,
            usuario="ztransfer",
            link_xdesp_to_xnrotra=link_xdesp_to_xnrotra,
        )
        session.flush()

        if validate:
            # 2) SD3 en DataFrame
            sd3 = session.query(SD3300).all()
            df_sd3 = pd.DataFrame(
                [
                    {
                        "D3_ID": r.D3_ID,
                        "D3_FILIAL": r.D3_FILIAL,
                        "D3_DOC": r.D3_DOC,
                        "D3_XNROTRA": r.D3_XNROTRA,
                        "D3_COD": r.D3_COD,
                        "D3_UM": r.D3_UM,
                        "D3_QUANT": float(r.D3_QUANT),
                        "D3_QTSEGUM": (
                            float(r.D3_QTSEGUM) if r.D3_QTSEGUM is not None else None
                        ),
                        "D3_CUSTO1": (
                            float(r.D3_CUSTO1) if r.D3_CUSTO1 is not None else None
                        ),
                        "D3_LOCAL": r.D3_LOCAL,
                        "D3_EMISSAO": r.D3_EMISSAO,  # Date: el schema normaliza internamente
                        "D3_TM": r.D3_TM,
                        "D3_USUARIO": r.D3_USUARIO,
                        "D3_ESTORNO": r.D3_ESTORNO,
                        "D_E_L_E_T_": r.D_E_L_E_T_,
                    }
                    for r in sd3
                ]
            )

            # 3) PB7 en DataFrame (para cruce)
            pb7 = session.query(PB7300).all()
            df_pb7 = pd.DataFrame(
                [
                    {
                        "PB7_FILIAL": r.PB7_FILIAL,
                        "PB7_DATA": r.PB7_DATA,  # Date
                        "PB7_QTDE": float(r.PB7_QTDE),
                        "PB7_PRODUT": r.PB7_PRODUT,
                        "PB7_LOCENT": r.PB7_LOCENT,
                        "PB7_XDESP": r.PB7_XDESP,
                        "PB7_STATUS": r.PB7_STATUS,
                    }
                    for r in pb7
                ]
            )

            # 4) Validación SD3 (parejas 008/008)
            valid_alm = set(df_sd3["D3_LOCAL"].dropna().unique())
            sd3_schema = make_SD3_transfer_schema(
                valid_almacenes=valid_alm, allow_tm=("008",)
            )
            sd3_schema.validate(df_sd3, lazy=True)

            # 5) Cruce SD3 ↔ PB7
            validate_SD3_vs_PB7(df_sd3, df_pb7)

        if autocommit:
            session.commit()

    sd3_count = session.query(SD3300).count()
    pb7_count = session.query(PB7300).count()
    # cada traslado genera 2 líneas SD3
    return {
        "SD3_rows": sd3_count,
        "SD3_pairs": sd3_count // 2,
        "PB7_rows": pb7_count,
    }
