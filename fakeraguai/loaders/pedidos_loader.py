# loaders/pedido_loader.py
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import pandas as pd

from ..generators.pedidos_gen import generate_pedidos
from ..utils._utils import transactional
from ..models import SC5300, SC6300, SC900
from ..schemas.sc5_schema import make_SC5_schema
from ..schemas.sc6_schema import make_SC6_schema


def load_pedidos(
    session: Session,
    start_date: date | datetime,
    days: int = 5,
    n_pedidos: int = 20,
    *,
    validate: bool = True,
    autocommit: bool = True,
):
    with transactional(session, autocommit=False):  # commit manual tras validar
        generate_pedidos(session, start_date=start_date, days=days, n_pedidos=n_pedidos)
        session.flush()  # asegurar que ORM materialice filas para contarlas/leerlas

        if validate:
            # Construir DataFrames desde la sesión (rápido y simple)
            sc5 = session.query(SC5300).order_by(SC5300.C5_NUM).all()
            sc6 = session.query(SC6300).order_by(SC6300.C6_NUM, SC6300.C6_ITEM).all()

            df_sc5 = pd.DataFrame(
                [
                    {
                        "C5_NUM": r.C5_NUM,
                        "C5_CLIENTE": r.C5_CLIENTE,
                        "C5_LOJACLI": r.C5_LOJACLI,
                        "C5_EMISSAO": r.C5_EMISSAO,
                        "C5_XTIPO": r.C5_XTIPO,
                        "C5_MOEDA": r.C5_MOEDA,
                    }
                    for r in sc5
                ]
            )

            df_sc6 = pd.DataFrame(
                [
                    {
                        "C6_NUM": r.C6_NUM,
                        "C6_ITEM": r.C6_ITEM,
                        "C6_PRODUTO": r.C6_PRODUTO,
                        "C6_UM": r.C6_UM,
                        "C6_QTDVEN": r.C6_QTDVEN,
                        "C6_PRCVEN": r.C6_PRCVEN,
                        "C6_VALOR": getattr(
                            r, "C6_VALOR", (r.C6_QTDVEN or 0) * (r.C6_PRCVEN or 0)
                        ),
                        "C6_LOCAL": r.C6_LOCAL,
                        "C6_LOCDEST": r.C6_LOCDEST,
                        "C6_CLI": r.C6_CLI,
                        "C6_LOJA": r.C6_LOJA,
                    }
                    for r in sc6
                ]
            )

            # Catálogos dinámicos
            valid_clientes = {r.C5_CLIENTE for r in sc5}
            valid_lojas = {r.C5_LOJACLI for r in sc5}
            valid_pedidos = {r.C5_NUM for r in sc5}
            valid_prod = {r.C6_PRODUTO for r in sc6}
            valid_ums = {r.C6_UM for r in sc6}
            valid_alms = {
                *(x for x in df_sc6["C6_LOCAL"].dropna().unique()),
                *(x for x in df_sc6["C6_LOCDEST"].dropna().unique()),
            }

            c5_schema = make_SC5_schema(
                valid_clientes=valid_clientes, valid_lojas=valid_lojas
            )
            c6_schema = make_SC6_schema(
                valid_pedidos=valid_pedidos,
                valid_clientes=valid_clientes,
                valid_lojas=valid_lojas,
                valid_productos=valid_prod,
                valid_ums=valid_ums,
                valid_almacenes=valid_alms,
                enforce_dest_rules=True,
            )
            c5_schema.validate(df_sc5, lazy=True)
            c6_schema.validate(df_sc6, lazy=True)

        if autocommit:
            session.commit()

    return {
        "SC5_pedidos": session.query(SC5300).count(),
        "SC6_items": session.query(SC6300).count(),
        "SC9_aprob": session.query(SC900).count(),
    }
