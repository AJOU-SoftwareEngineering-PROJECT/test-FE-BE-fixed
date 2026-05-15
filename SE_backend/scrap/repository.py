from abc import ABC, abstractmethod
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from db.model import Scrap, Sentence, Book


class ScrapRepository(ABC):
    """Repository interface describing scrap persistence behavior."""

    @abstractmethod
    def create(self, scrap_data: dict) -> Scrap:
        """Persist a new scrap and return the stored entity."""

    @abstractmethod
    def delete(self, scrap_id: int) -> None:
        """Delete a scrap by id."""

    @abstractmethod
    def find(self, scrap_id: int) -> Scrap:
        """Find a scrap by id."""

    @abstractmethod
    def find_by_user(self, user_id: int) -> List[dict]:
        """Return all scraps for a user with sentence and book details."""

    @abstractmethod
    def find_scrap_with_details(self, scrap_id: int) -> dict:
        """Get a scrap by id with sentence and book details."""


class PostgresqlScrapRepository(ScrapRepository):
    """SQLAlchemy-backed implementation of the ScrapRepository."""

    def __init__(self, session: Session):
        self.session = session

    def create(self, scrap_data: dict) -> Scrap:
        scrap = Scrap(**scrap_data)
        self.session.add(scrap)
        try:
            self.session.commit()
            self.session.refresh(scrap)
            return scrap
        except IntegrityError as e:
            self.session.rollback()
            # 중복 제약 조건 위반 (user_id + sentence_id)
            if "uq_scrap_user_sentence" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="이미 스크랩한 문장입니다."
                )
            # 외래키 제약 조건 위반 (sentence_id가 존재하지 않음)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 문장을 찾을 수 없습니다."
            )

    def delete(self, scrap_id: int) -> None:
        scrap = self.session.get(Scrap, scrap_id)
        if scrap:
            self.session.delete(scrap)
            self.session.commit()

    def find(self, scrap_id: int) -> Scrap:
        return self.session.get(Scrap, scrap_id)

    def find_existing_scrap(self, user_id: int, sentence_id: int) -> Scrap:
        """Check if a user has already scrapped a sentence."""
        return (
            self.session.query(Scrap)
            .filter(Scrap.user_id == user_id, Scrap.sentence_id == sentence_id)
            .first()
        )

    def find_by_user(self, user_id: int) -> List[dict]:
        """
        Return all scraps for a user with sentence and book details.
        Includes: id, sentence_id, sentence_content, book_name, chapter
        Ordered by created_at ASC (oldest first, newest last).
        """
        scraps = (
            self.session.query(
                Scrap.id,
                Scrap.sentence_id,
                Sentence.content.label("sentence_content"),
                Book.name.label("book_name"),
                Sentence.chapter
            )
            .join(Sentence, Scrap.sentence_id == Sentence.id)
            .join(Book, Sentence.book_id == Book.id)
            .filter(Scrap.user_id == user_id)
            .order_by(Scrap.created_at.asc())
            .all()
        )

        return [
            {
                "id": scrap.id,
                "sentence_id": scrap.sentence_id,
                "sentence_content": scrap.sentence_content,
                "book_name": scrap.book_name,
                "chapter": scrap.chapter,
            }
            for scrap in scraps
        ]

    def find_scrap_with_details(self, scrap_id: int) -> dict:
        """
        Get a scrap by id with sentence and book details.
        Returns: {id, sentence_id, sentence_content, book_name, chapter}
        """
        scrap = (
            self.session.query(
                Scrap.id,
                Scrap.sentence_id,
                Sentence.content.label("sentence_content"),
                Book.name.label("book_name"),
                Sentence.chapter
            )
            .join(Sentence, Scrap.sentence_id == Sentence.id)
            .join(Book, Sentence.book_id == Book.id)
            .filter(Scrap.id == scrap_id)
            .first()
        )

        if not scrap:
            return None

        return {
            "id": scrap.id,
            "sentence_id": scrap.sentence_id,
            "sentence_content": scrap.sentence_content,
            "book_name": scrap.book_name,
            "chapter": scrap.chapter,
        }
