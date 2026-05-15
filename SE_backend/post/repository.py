from abc import ABC, abstractmethod

from sqlalchemy import delete, func
from sqlalchemy.orm import Session

from db.model import Book, Sentence, User, SentenceLikeUserMapping


class SentenceRepository(ABC):
    """Repository interface describing author persistence behavior."""

    @abstractmethod
    def find(self, id: int) -> Sentence:
        "해당 ID의 엔티티를 찾는 함수"

    @abstractmethod
    def create(self, post_data: dict) -> Sentence:
        """Persist a new author and return the stored entity."""

    @abstractmethod
    def update(self, sentence: Sentence) -> Sentence:
        """해당 엔티티를 업데이트하는 함수"""

    @abstractmethod
    def delete(self, sentence: Sentence):
        """해당 엔티티를 삭제하는 함수"""
    
class BookRepository(ABC):
    @abstractmethod
    def find(self, id: int) -> Book:
        "해당 ID의 엔티티를 찾는 함수"

    @abstractmethod
    def create(self, book_data: dict) -> Book:
        "Persist a new book and return the stored entity."

    @abstractmethod
    def delete(self, book: Book):
        "Delete the specified book from persistence."

    @abstractmethod
    def find_all(self) -> list[dict]:
        "Find all books with author metadata."

    @abstractmethod
    def get_users_who_like_book(self, book_id: int) -> list[int]:
        "해당 작품을 좋아하는 사용자 ID 목록을 조회합니다."

    @abstractmethod
    def get_author_name(self, author_id: int) -> str:
        "Resolve an author's display name by ID."

    @abstractmethod
    def search_books(self, query: str) -> list[dict]:
        "작품명 또는 작가명으로 책을 검색합니다."

    @abstractmethod
    def get_ranked_books(self) -> list[dict]:
        "좋아요 순으로 정렬된 책 목록을 반환합니다."

class PostgresqlSentenceRepository(SentenceRepository):
    """SQLAlchemy-backed implementation of the AuthorRepository."""

    def __init__(self, session: Session):
        self.session = session

    def find(self, id: int) -> Sentence:
        return self.session.get(Sentence, id)

    def create(self, post_data: dict) -> Sentence:
        sentence = Sentence(**post_data)
        self.session.add(sentence)
        self.session.commit()
        self.session.refresh(sentence)
        return sentence
    
    def update(self, sentence: Sentence) -> Sentence:
        self.session.add(sentence)
        self.session.commit()
        self.session.refresh(sentence)
        return sentence
    
    def delete(self, sentence: Sentence):
        self.session.delete(sentence)
        self.session.commit()

class PostgresqlBookRepository(BookRepository):
    def __init__(self, session: Session):
        self.session = session

    def find(self, id: int) -> Book:
        return self.session.get(Book, id)

    def create(self, book_data: dict) -> Book:
        book = Book(**book_data)
        self.session.add(book)
        self.session.commit()
        self.session.refresh(book)
        return book

    def delete(self, book: Book):
        self.session.delete(book)
        self.session.commit()

    def find_all(self) -> list[dict]:
        books = (
            self.session.query(Book, User.name.label("author_name"))
            .join(User, Book.author_id == User.id)
            .order_by(Book.name.asc())
            .all()
        )

        return [
            {
                "id": book.id,
                "name": book.name,
                "author_name": author_name,
                "like_count": 0,
            }
            for book, author_name in books
        ]

    def get_users_who_like_book(self, book_id: int) -> list[int]:
        rows = (
            self.session.query(SentenceLikeUserMapping.user_id)
            .join(Sentence, SentenceLikeUserMapping.sentence_id == Sentence.id)
            .filter(Sentence.book_id == book_id)
            .distinct()
            .all()
        )
        return [row[0] for row in rows]

    def get_author_name(self, author_id: int) -> str:
        author = self.session.get(User, author_id)
        return author.name if author else ""

    def search_books(self, query: str) -> list[dict]:
        search_pattern = f"%{query}%"
        books = (
            self.session.query(Book, User.name.label("author_name"))
            .join(User, Book.author_id == User.id)
            .filter(
                Book.name.ilike(search_pattern) |
                User.name.ilike(search_pattern)
            )
            .order_by(Book.name.asc())
            .all()
        )

        return [
            {
                "id": book.id,
                "name": book.name,
                "author_name": author_name,
                "like_count": 0,
            }
            for book, author_name in books
        ]

    def get_ranked_books(self) -> list[dict]:
        ranked = (
            self.session.query(
                Book.id,
                Book.name,
                User.name.label("author_name"),
                func.count(SentenceLikeUserMapping.user_id).label("like_count")
            )
            .join(User, Book.author_id == User.id)
            .outerjoin(Sentence, Sentence.book_id == Book.id)
            .outerjoin(SentenceLikeUserMapping, SentenceLikeUserMapping.sentence_id == Sentence.id)
            .group_by(Book.id, User.name)
            .order_by(func.count(SentenceLikeUserMapping.user_id).desc())
            .all()
        )

        return [
            {
                "id": book_id,
                "name": book_name,
                "author_name": author_name,
                "like_count": like_count,
            }
            for book_id, book_name, author_name, like_count in ranked
        ]
