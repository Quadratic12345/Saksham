from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(get_settings().database_url, pool_pre_ping=True)
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a session, always closes it after the request."""
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates tables if they don't exist yet. Fine for this project's scale —
    move to Alembic migrations if the schema needs versioned changes later."""
    Base.metadata.create_all(bind=get_engine())
