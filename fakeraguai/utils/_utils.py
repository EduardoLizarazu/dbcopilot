# loaders/_utils.py
from contextlib import contextmanager
from sqlalchemy.orm import Session


@contextmanager
def transactional(session: Session, autocommit: bool = True):
    try:
        yield
        if autocommit:
            session.commit()
    except Exception:
        session.rollback()
        raise


def count_rows(session: Session, model) -> int:
    return session.query(model).count()
