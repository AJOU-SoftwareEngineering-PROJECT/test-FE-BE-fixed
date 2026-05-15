from db.model import User
from author.repository import AuthorRepository

class AuthorService:
    """Service layer for author related operations."""

    def __init__(self, repository: AuthorRepository):
        self.repository = repository

    def register_author(self, author_data: dict) -> User:
        """Persist a new author using the provided data."""
        return self.repository.create(author_data)
