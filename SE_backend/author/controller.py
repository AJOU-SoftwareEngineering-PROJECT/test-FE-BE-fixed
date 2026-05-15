from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from author.repository import AuthorRepository, PostgresqlAuthorRepository
from author.schemas import AuthorCreate, AuthorResponse
from author.service import AuthorService
from db.database import SessionLocal, get_db


router = APIRouter(prefix="/authors", tags=["authors"])


class AuthorController:
    """Controller handling author related endpoints."""

    def __init__(self, service: AuthorService):
        self.service = service

    def register_author(self, author: AuthorCreate) -> AuthorResponse:
        """Register a new author via the service."""
        created = self.service.register_author(author.model_dump())
        return AuthorResponse.model_validate(created)


def get_author_repository(db: Session = Depends(get_db)) -> AuthorRepository:
    """Provide a repository wired with the active DB session."""
    return PostgresqlAuthorRepository(db)


def get_author_service(
    repository: AuthorRepository = Depends(get_author_repository),
) -> AuthorService:
    """Provide an AuthorService using the repository abstraction."""
    return AuthorService(repository)


def get_author_controller(
    service: AuthorService = Depends(get_author_service),
) -> AuthorController:
    """Provide an AuthorController wired with dependencies."""
    return AuthorController(service)


@router.post("", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
def register_author(
    author: AuthorCreate, controller: AuthorController = Depends(get_author_controller)
):
    """REST endpoint for author registration via the controller."""
    return controller.register_author(author)
