import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlite3 import Connection as SQLite3Connection

from db.database import Base, get_db
from db.model import User, Book, Sentence, Comment, Gender
from main import app

# ✨ SQLite가 PostgreSQL처럼 외래키 제약조건을 엄격하게 검사하도록 강제하는 코드
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

@pytest.fixture()
def session():
    """Each test function receives its own isolated in-memory DB session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}, # ✨ 스레드 충돌 방지
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client(session):
    """TestClient with overridden database dependency."""
    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    app.router.on_startup.clear() # ✨ 진짜 DB(도커) 연결 시도 무력화

    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture()
def setup_data(session):
    """Create temporary User, Book, and Sentence for testing."""
    user = User(
        id=1, 
        name="Test User",
        gender=Gender.MALE,
        age=25,
        intro="Test intro",
        email="test@example.com"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    book = Book(id=1, name="Test Book", author_id=user.id)
    session.add(book)
    session.commit()
    session.refresh(book)

    sentence = Sentence(id=1, chapter=1, book_id=book.id, content="Test sentence")
    session.add(sentence)
    session.commit()
    session.refresh(sentence)

    return {"user": user, "book": book, "sentence": sentence}

def test_create_comment_success(client, setup_data, session):
    """시나리오 A: 정상적인 내용(1~500자) -> 201 Created, DB 저장 검증."""
    sentence_id = setup_data["sentence"].id
    comment_data = {"content": "This is a valid comment."}

    response = client.post(f"/sentences/{sentence_id}/comments", json=comment_data)

    assert response.status_code == 201
    data = response.json()
    assert data["content"] == comment_data["content"]
    assert data["user_id"] == 1  # Hardcoded in controller
    assert data["sentence_id"] == sentence_id
    assert "id" in data

    # Verify in DB
    comment = session.get(Comment, data["id"])
    assert comment is not None
    assert comment.content == comment_data["content"]

def test_get_comments_order(client, setup_data):
    """시나리오 B: 댓글 2개 작성 후 GET -> 200 OK, 나중에 쓴 댓글이 먼저(내림차순)."""
    sentence_id = setup_data["sentence"].id

    comment1_data = {"content": "First comment"}
    response1 = client.post(f"/sentences/{sentence_id}/comments", json=comment1_data)
    assert response1.status_code == 201
    comment1_id = response1.json()["id"]

    comment2_data = {"content": "Second comment"}
    response2 = client.post(f"/sentences/{sentence_id}/comments", json=comment2_data)
    assert response2.status_code == 201
    comment2_id = response2.json()["id"]

    response = client.get(f"/sentences/{sentence_id}/comments")
    assert response.status_code == 200
    comments = response.json()

    assert len(comments) == 2
    assert comments[0]["id"] == comment2_id
    assert comments[0]["content"] == comment2_data["content"]
    assert comments[1]["id"] == comment1_id
    assert comments[1]["content"] == comment1_data["content"]

def test_create_comment_validation_error(client, setup_data):
    """시나리오 C: content 빈 문자열 또는 500자 초과 -> 422 Unprocessable Entity."""
    sentence_id = setup_data["sentence"].id

    response = client.post(f"/sentences/{sentence_id}/comments", json={"content": ""})
    assert response.status_code == 422

    long_content = "a" * 501
    response = client.post(f"/sentences/{sentence_id}/comments", json={"content": long_content})
    assert response.status_code == 422

def test_create_comment_nonexistent_sentence(client, setup_data):
    """시나리오 D: 존재하지 않는 sentence_id -> 404 Not Found."""
    nonexistent_sentence_id = 9999
    comment_data = {"content": "This should fail"}

    response = client.post(f"/sentences/{nonexistent_sentence_id}/comments", json=comment_data)

    assert response.status_code == 404

def test_create_subcomment_success(client, setup_data):
    """시나리오 E: 존재하는 댓글에 대댓글 작성 -> 201 Created 검증"""
    sentence_id = setup_data["sentence"].id
    
    res_comment = client.post(f"/sentences/{sentence_id}/comments", json={"content": "부모 댓글입니다."})
    comment_id = res_comment.json()["id"]

    subcomment_data = {"content": "대댓글입니다."}
    res_sub = client.post(f"/comments/{comment_id}/subcomments", json=subcomment_data)
    
    assert res_sub.status_code == 201
    assert res_sub.json()["content"] == subcomment_data["content"]
    assert res_sub.json()["comment_id"] == comment_id

def test_toggle_like_success(client, setup_data):
    """시나리오 F: 좋아요 누르기/취소 토글 및 댓글 조회 시 like_count 반영 검증"""
    sentence_id = setup_data["sentence"].id
    
    res_comment = client.post(f"/sentences/{sentence_id}/comments", json={"content": "좋아요 테스트 댓글"})
    comment_id = res_comment.json()["id"]

    res_like1 = client.post(f"/comments/{comment_id}/likes")
    assert res_like1.status_code == 200
    assert res_like1.json()["liked"] is True

    res_list1 = client.get(f"/sentences/{sentence_id}/comments")
    assert res_list1.json()[0]["like_count"] == 1

    res_like2 = client.post(f"/comments/{comment_id}/likes")
    assert res_like2.status_code == 200
    assert res_like2.json()["liked"] is False

    res_list2 = client.get(f"/sentences/{sentence_id}/comments")
    assert res_list2.json()[0]["like_count"] == 0

def test_subcomment_not_found(client, setup_data):
    """시나리오 G: 존재하지 않는 댓글에 대댓글 작성 -> 404 Not Found 검증"""
    nonexistent_comment_id = 9999
    subcomment_data = {"content": "실패해야 하는 대댓글"}
    
    response = client.post(f"/comments/{nonexistent_comment_id}/subcomments", json=subcomment_data)
    assert response.status_code == 404