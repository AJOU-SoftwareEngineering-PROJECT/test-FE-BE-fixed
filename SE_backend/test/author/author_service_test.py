import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from author.repository import PostgresqlAuthorRepository
from author.service import AuthorService
from db.database import Base
from db.model import User, Gender


@pytest.fixture()
def session():
    """Each test function receives its own isolated in-memory DB session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def repository(session):
    """Concrete repository using the test session."""
    return PostgresqlAuthorRepository(session)


@pytest.fixture()
def service(repository):
    """Instantiate the service layer with the repository."""
    return AuthorService(repository)


def test_register_author_persists_and_returns_author(service, session):
    author_data = {
        "name": "Park",
        "gender": Gender.FEMALE,
        "age": 34,
        "intro": "Science fiction author",
        "email": "park@example.com",
    }

    created = service.register_author(author_data)

    assert created.id is not None
    assert created.name == author_data["name"]
    assert created.gender == author_data["gender"]
    assert created.email == author_data["email"]

    stored = session.get(User, created.id)
    assert stored is not None
    assert stored.intro == author_data["intro"]
    assert stored.age == author_data["age"]
