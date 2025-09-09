
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import ORACLE

engine = create_engine(
    ORACLE.sqlalchemy_url(),
    max_identifier_length=128,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_session():
    return SessionLocal()
