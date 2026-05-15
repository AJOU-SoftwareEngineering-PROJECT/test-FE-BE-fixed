import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.model import Book, Gender, Sentence, SentenceLikeUserMapping, User
from post.repository import PostgresqlBookRepository, PostgresqlSentenceRepository
from post.schemas import (
    AddSentenceRequest,
    BookCreate,
    DeleteSentenceRequest,
    ModifySentenceRequest,
    PostChapterCreate,
)
from post.service import PostService


@pytest.fixture()
def session():
    """Create an isolated in-memory DB session for each test."""
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
def sentence_repository(session):
    return PostgresqlSentenceRepository(session)


@pytest.fixture()
def book_repository(session):
    return PostgresqlBookRepository(session)


@pytest.fixture()
def service(sentence_repository, book_repository):
    return PostService(sentence_repository, book_repository)


def make_post_chapter_dto(content: str) -> PostChapterCreate:
    return PostChapterCreate(
        userId=1,
        content=content,
        bookId=42,
        chapter=3,
    )


def make_modify_sentence_dto(sentence_id: int, content: str) -> ModifySentenceRequest:
    return ModifySentenceRequest(
        sentenceId=sentence_id,
        content=content,
    )


def make_add_sentence_dto(before_id: int, after_id: int, book_id: int, content: str) -> AddSentenceRequest:
    return AddSentenceRequest(
        beforeId=before_id,
        afterId=after_id,
        bookId=book_id,
        content=content,
    )


def make_delete_sentence_dto(before_id: int, sentence_id: int) -> DeleteSentenceRequest:
    return DeleteSentenceRequest(
        beforeId=before_id,
        sentenceId=sentence_id,
    )


def test_post_sentences_persists_each_sentence(service, session):
    dto = make_post_chapter_dto("첫 문장. 두 번째 문장? 마지막 문장.")

    created = service.post_sentences(dto)

    assert len(created) == 3
    assert [s.content for s in created] == [
        "첫 문장",
        "두 번째 문장",
        "마지막 문장",
    ]
    assert all(sentence.book_id == dto.bookId for sentence in created)
    assert all(sentence.chapter == dto.chapter for sentence in created)

    stored = session.query(Sentence).order_by(Sentence.id).all()
    assert len(stored) == 3


def test_post_sentences_links_after_ids(service, session):
    dto = make_post_chapter_dto("A.  B?C.")

    service.post_sentences(dto)

    stored = session.query(Sentence).order_by(Sentence.id).all()

    assert stored[0].after_id == stored[1].id
    assert stored[1].after_id == stored[2].id
    assert stored[2].after_id is None


def test_modify_sentence_updates_content(service, session):
    sentence = Sentence(chapter=1, content="original", book_id=5)
    session.add(sentence)
    session.commit()

    dto = make_modify_sentence_dto(sentence.id, "updated sentence")

    updated = service.modify_sentence(dto)

    assert updated.id == sentence.id
    assert updated.content == "updated sentence"

    refreshed = session.get(Sentence, sentence.id)
    assert refreshed.content == "updated sentence"


def test_add_sentence_creates_new_sentence_and_updates_links(service, session):
    user = User(name="Kim", gender=Gender.MALE, age=30, intro="intro", email="kim@example.com")
    session.add(user)
    session.commit()

    book = Book(name="Book 1", author_id=user.id)
    session.add(book)
    session.commit()

    before = Sentence(chapter=1, content="before", book_id=book.id, after_id=None)
    after = Sentence(chapter=1, content="after", book_id=book.id, after_id=None)
    session.add_all([before, after])
    session.commit()

    dto = make_add_sentence_dto(before.id, after.id, book.id, "inserted")

    created = service.add_sentence(dto)

    assert created.content == "inserted"
    assert created.after_id == after.id
    assert created.book_id == book.id

    reloaded_before = session.get(Sentence, before.id)
    assert reloaded_before.after_id == created.id


def test_delete_sentence_unlinks_before_and_removes_sentence(service, session):
    user = User(name="Han", gender=Gender.FEMALE, age=28, intro="intro", email="han@example.com")
    session.add(user)
    session.commit()

    book = Book(name="Mystery", author_id=user.id)
    session.add(book)
    session.commit()

    before = Sentence(chapter=1, content="before", book_id=book.id)
    target = Sentence(chapter=1, content="delete me", book_id=book.id)
    after = Sentence(chapter=1, content="after", book_id=book.id)
    session.add_all([before, target, after])
    session.commit()

    before.after_id = target.id
    target.after_id = after.id
    session.add_all([before, target])
    session.commit()

    dto = make_delete_sentence_dto(before.id, target.id)

    service.delete_sentence(dto)

    refreshed_before = session.get(Sentence, before.id)
    assert refreshed_before.after_id == after.id

    assert session.get(Sentence, target.id) is None


def make_book_create_dto(name: str, intro: str, author_id: int) -> BookCreate:
    return BookCreate(name=name, intro=intro, author_id=author_id)


def test_create_book_persists_new_book(service, session):
    user = User(name="Kim", gender=Gender.MALE, age=30, intro="intro", email="kim@example.com")
    session.add(user)
    session.commit()

    dto = make_book_create_dto("New Work", "A new book introduction.", user.id)

    created = service.create_book(dto)

    assert created.id is not None
    assert created.name == dto.name
    assert created.author_name == user.name
    assert created.like_count == 0

    stored = session.get(Book, created.id)
    assert stored is not None
    assert stored.name == dto.name
    assert stored.intro == dto.intro
    assert stored.author_id == dto.author_id


def test_list_books_returns_all_books(service, session):
    user = User(name="Jane", gender=Gender.FEMALE, age=27, intro="intro", email="jane@example.com")
    session.add(user)
    session.commit()

    books = [
        Book(name="First Book", intro="Intro 1", author_id=user.id),
        Book(name="Second Book", intro="Intro 2", author_id=user.id),
    ]
    session.add_all(books)
    session.commit()

    results = service.list_books()

    assert len(results) == 2
    assert {book.name for book in results} == {"First Book", "Second Book"}
    assert all(book.author_name == user.name for book in results)


def test_search_books_filters_by_keyword(service, session):
    user = User(name="Joon", gender=Gender.MALE, age=29, intro="intro", email="joon@example.com")
    session.add(user)
    session.commit()

    books = [
        Book(name="Python Guide", intro="Intro A", author_id=user.id),
        Book(name="Advanced Python", intro="Intro B", author_id=user.id),
        Book(name="Java Basics", intro="Intro C", author_id=user.id),
    ]
    session.add_all(books)
    session.commit()

    results = service.search_books("Python")

    assert len(results) == 2
    assert {book.name for book in results} == {"Python Guide", "Advanced Python"}
    assert all("Python" in book.name for book in results)


def test_get_ranked_books_orders_by_like_count(service, session):
    author = User(name="Hye", gender=Gender.FEMALE, age=31, intro="intro", email="hye@example.com")
    liker1 = User(name="Lee", gender=Gender.MALE, age=25, intro="intro", email="lee@example.com")
    liker2 = User(name="Park", gender=Gender.FEMALE, age=24, intro="intro", email="park@example.com")
    session.add_all([author, liker1, liker2])
    session.commit()

    book_a = Book(name="Popular Book", intro="More likes", author_id=author.id)
    book_b = Book(name="Less Popular Book", intro="Fewer likes", author_id=author.id)
    session.add_all([book_a, book_b])
    session.commit()

    sentence_a = Sentence(chapter=1, content="A sentence", book_id=book_a.id)
    sentence_b = Sentence(chapter=1, content="B sentence", book_id=book_b.id)
    session.add_all([sentence_a, sentence_b])
    session.commit()

    likes = [
        SentenceLikeUserMapping(user_id=liker1.id, sentence_id=sentence_a.id),
        SentenceLikeUserMapping(user_id=liker2.id, sentence_id=sentence_a.id),
        SentenceLikeUserMapping(user_id=liker1.id, sentence_id=sentence_b.id),
    ]
    session.add_all(likes)
    session.commit()

    results = service.get_ranked_books()

    assert len(results) == 2
    assert results[0].name == book_a.name
    assert results[0].like_count == 2
    assert results[1].name == book_b.name
    assert results[1].like_count == 1


def test_delete_book_removes_book(service, session):
    user = User(name="Park", gender=Gender.MALE, age=35, intro="intro", email="park@example.com")
    session.add(user)
    session.commit()

    book = Book(name="Delete Me", intro="To be removed", author_id=user.id)
    session.add(book)
    session.commit()

    service.delete_book(book.id)

    assert session.get(Book, book.id) is None
