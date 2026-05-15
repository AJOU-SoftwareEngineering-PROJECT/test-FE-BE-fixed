from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use psycopg2 driver to avoid requiring the separate psycopg package.
DATABASE_URL = "postgresql+psycopg2://postgres:1234@localhost:5432/ajou_se_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create database tables if they do not exist."""
    import db.model  # noqa: F401  # ensures models are registered with Base

    Base.metadata.create_all(bind=engine)
