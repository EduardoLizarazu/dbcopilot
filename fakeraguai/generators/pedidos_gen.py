import random
from datetime import datetime, timedelta, date
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models import SA1300, SB1300, SC5300, SC6300, SC900, SZH300  # ← añadí SZH300
from ..schemas.sc5_schema import make_SC5_schema
from ..schemas.sc6_schema import make_SC6_schema

EXCLUDED_DEST = {
    "14",
    "19",
    "20",
}  # para favorecer que luego el SD3300(008) no caiga en excluidos


def _yyyymmdd(d: date | datetime) -> str:
    if isinstance(d, datetime):
        d = d.date()
    return d.strftime("%Y%m%d")


def generate_pedidos(
    session: Session,
    start_date: datetime | date,
    days: int = 5,
    n_pedidos: int = 20,
    prefer_pa0_ratio: float = 0.7,  # ↑ prob de productos PA0%
):
    # Catálogos
    clientes = session.query(SA1300).all()
    productos = session.query(SB1300).all()
    prod_pa0 = [p for p in productos if (p.B1_COD or "").startswith("PA0")]
    prod_otros = [
        p for p in productos if (p.B1_COD or "") and not p.B1_COD.startswith("PA0")
    ]

    # Almacenes válidos desde SZH300 (si hay); si no, fallback razonable
    zh = session.query(SZH300).all()
    almacenes = (
        sorted({z.ZH_ALM for z in zh})
        if zh
        else ["20", "29", "55", "63", "74", "90", "91"]
    )
    if not almacenes:
        almacenes = ["20", "29", "55", "63", "74", "90", "91"]

    pedidos, detalles, aprob = [], [], []

    # Asegurar que start sea date
    if isinstance(start_date, datetime):
        base_day = start_date.date()
    else:
        base_day = start_date

    for n in range(n_pedidos):
        cte = random.choice(clientes)

        # Número único de pedido
        num = f"{10500 + n:06d}"

        # Emisión dentro de la ventana
        emis = base_day + timedelta(days=random.randint(0, max(days, 0)))
        c5 = dict(
            C5_NUM=num,
            C5_CLIENTE=cte.A1_COD,
            C5_LOJACLI=cte.A1_LOJA,
            C5_EMISSAO=_yyyymmdd(emis),  # ← YYYYMMDD
            C5_XTIPO=random.choice(list("158")),  # según tu dominio
            C5_MOEDA=random.choice(["BOB", "USD"]),
            # "D_E_L_E_T_": " ",                  # ← descomenta si tu modelo lo tiene
        )
        pedidos.append(c5)

        # Número de ítems: inclusivo (1..N)
        n_items = random.randint(1, 4)
        for item in range(1, n_items + 1):
            # Elegir producto, favoreciendo PA0%
            if prod_pa0 and (random.random() < prefer_pa0_ratio):
                prod = random.choice(prod_pa0)
            else:
                prod = random.choice(prod_pa0 or prod_otros or productos)

            # Cantidades por UM
            if prod.B1_UM == "LT":
                qty = float(random.uniform(1_000.0, 80_000.0))
            else:
                qty = float(random.uniform(1.0, 50.0))

            prc = round(random.uniform(0.5, 250.0), 2)
            val = round(qty * prc, 2)

            # Almacenes: origen y destino válidos y distintos
            local = random.choice(almacenes)
            # candidatos destino: distinto de origen y no excluido
            candidatos_dest = [
                a for a in almacenes if a != local and a not in EXCLUDED_DEST
            ] or almacenes
            locdest = random.choice(candidatos_dest)

            # Filial razonable
            filial = "0001"

            detalles.append(
                dict(
                    C6_NUM=num,
                    C6_ITEM=item,
                    C6_PRODUTO=prod.B1_COD,
                    C6_UM=prod.B1_UM,
                    C6_QTDVEN=qty,
                    C6_QTDENT=0.0,  # ← útil para PB7/SD2 luego
                    C6_PRCVEN=prc,
                    C6_VALOR=val,
                    C6_LOCAL=local,
                    C6_LOCDEST=locdest,
                    C6_CLI=cte.A1_COD,
                    C6_LOJA=cte.A1_LOJA,
                    C6_FILIAL=filial,
                    # "D_E_L_E_T_": " ",      # ← descomenta si tu modelo lo tiene
                )
            )

            # Aprobaciones SC900
            aprob.append(
                dict(
                    C9_NUM=num,
                    C9_ITEM=item,
                    C9_STATUS=random.choice(["A", "A", "P"]),
                    C9_QUANT=qty,
                    C9_PRECO=prc,
                    C9_USR="aprobador",
                    C9_DATA=_yyyymmdd(emis),  # mantener formato con resto del sistema
                    # "D_E_L_E_T_": " ",      # opcional
                )
            )

    # DataFrames para validación
    df_sc5 = pd.DataFrame(pedidos)
    df_sc6 = pd.DataFrame(detalles)
    df_sc9 = pd.DataFrame(aprob)

    # Validación con tus esquemas
    sc5_schema = make_SC5_schema()
    sc6_schema = make_SC6_schema()
    sc5_schema.validate(df_sc5)
    sc6_schema.validate(df_sc6)
    # (si tenés schema para SC9, validalo también)

    # Bulk insert
    for r in df_sc5.to_dict(orient="records"):
        session.add(SC5300(**r))
    for r in df_sc6.to_dict(orient="records"):
        session.add(SC6300(**r))
    for r in df_sc9.to_dict(orient="records"):
        session.add(SC900(**r))
