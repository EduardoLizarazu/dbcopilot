# loaders/maestros_loader.py
from sqlalchemy.orm import Session
from ..generators.maestros_gen import seed_maestros
from ..utils._utils import transactional, count_rows
from ..models import SA1300, SB1300, SZG300  # ajusta a tus modelos reales


def load_maestros(session: Session, n_clientes: int = 20, autocommit: bool = True):
    with transactional(session, autocommit=autocommit):
        seed_maestros(session, n_clientes=n_clientes)
    return {
        "SA1300": count_rows(session, SA1300),
        "SB1300": count_rows(session, SB1300),
        "SZG300": count_rows(session, SZG300),
    }
