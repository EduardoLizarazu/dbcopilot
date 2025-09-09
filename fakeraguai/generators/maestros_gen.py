import random
from faker import Faker
from sqlalchemy.orm import Session

from fakeraguai.models.maestros import NNR300
from ..models import SZG300, SZH300, SB1300, SA1300

fake = Faker("es_ES")


def seed_maestros(session: Session, n_clientes: int = 20):
    tipos = [
        ("01", "MERCADO"),
        ("02", "MAYORISTA"),
        ("03", "PROVINCIA"),
        ("04", "INDUSTRIA"),
        ("06", "INTERIOR"),
        ("08", "EXPORTACION"),
        ("20", "INSTITUCIONES"),
        ("26", "INTERESES"),
    ]
    for c, d in tipos:
        session.merge(SZG300(ZG_CODIGO=c, ZG_DESC=d, D_E_L_E_T_=" "))

    # segs = [
    #     ("100", "Mercado"),
    #     ("200", "Mayorista"),
    #     ("300", "Exportación"),
    #     ("400", "Industrial"),
    # ]
    # for c, d in segs:
    #     session.merge(CTT300(CTT_CUSTO=c, CTT_DESC01=d))

    alms = [
        ("20", "Santa Cruz - Av. Cristo Redentor"),
        ("29", "Santa Cruz - Parque Industrial"),
        ("55", "Cochabamba - Av. Blanco Galindo"),
        ("63", "Cochabamba - La Cancha"),
        ("74", "La Paz - El Alto"),
        ("90", "La Paz - Zona Sur"),
        ("91", "Santa Cruz - Barrio Equipetrol"),
    ]
    for c, d in alms:
        session.merge(NNR300(NNR_COD=c, NNR_DESCRI=d))

    moviles = [
        ("20", "Movil1"),
        ("29", "Movil2"),
        ("55", "Movil3"),
        ("63", "Movil4"),
        ("74", "Movil5"),
        ("90", "Movil6"),
        ("91", "Movil7"),
    ]
    for c, d in moviles:
        session.merge(SZH300(ZH_ALM=c, ZH_DESC=d))

    prods = [
        ("PA010001", "ALCOHOL HIDRATADO", "LT"),
        ("PA020121", "AZUCAR 1KG", "BL"),
        ("PA020211", "AZUCAR 50KG", "BL"),
        ("PA030001", "BAGAZO", "KG"),
    ]
    for cod, desc, um in prods:
        session.merge(SB1300(B1_COD=cod, B1_DESC=desc, B1_UM=um, D_E_L_E_T_=" "))

    for _ in range(n_clientes):
        cod = f"{random.randint(1,999999):06d}"
        loja = f"{random.randint(1,2):02d}"
        tipo = random.choice(tipos)[0]
        session.merge(
            SA1300(
                A1_COD=cod,
                A1_LOJA=loja,
                A1_NOME=fake.company(),
                A1_CGC=str(random.randint(1_000_000, 99_999_999)),
                A1_UTPCLI=tipo,
                D_E_L_E_T_=" ",
            )
        )
