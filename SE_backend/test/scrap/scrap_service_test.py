import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlite3 import Connection as SQLite3Connection

from db.database import Base, get_db
from db.model import User, Book, Sentence, Scrap, Gender
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
        connect_args={"check_same_thread": False},  # ✨ 스레드 충돌 방지
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
    app.router.on_startup.clear()  # ✨ 진짜 DB(도커) 연결 시도 무력화

    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture()
def setup_data(session):
    """Create temporary Users, Book, and Sentences for testing."""
    # User 1 (테스트 주 사용자)
    user1 = User(
        id=1, 
        name="Test User 1",
        gender=Gender.MALE,
        age=25,
        intro="Test intro 1",
        email="test1@example.com"
    )
    session.add(user1)
    session.commit()
    session.refresh(user1)

    # User 2 (다른 사용자 - 권한 검증용)
    user2 = User(
        id=2, 
        name="Test User 2",
        gender=Gender.FEMALE,
        age=30,
        intro="Test intro 2",
        email="test2@example.com"
    )
    session.add(user2)
    session.commit()
    session.refresh(user2)

    book = Book(id=1, name="Test Book", author_id=user1.id)
    session.add(book)
    session.commit()
    session.refresh(book)

    sentence = Sentence(id=1, chapter=1, book_id=book.id, content="Test sentence")
    session.add(sentence)
    session.commit()
    session.refresh(sentence)

    return {"user1": user1, "user2": user2, "book": book, "sentence": sentence}

def test_create_scrap_success(client, setup_data, session):
    """
    시나리오 A: 유효한 문장을 스크랩 -> 201 Created, DB 저장 검증.
    
    유효한 문장의 sentence_id를 전달하면:
    - HTTP 201 Created 응답
    - 응답 데이터에 id, sentence_id, sentence_content, book_name, chapter 포함
    - DB에 Scrap 레코드 생성됨
    """
    sentence_id = setup_data["sentence"].id
    scrap_data = {"sentence_id": sentence_id}

    response = client.post("/scraps", json=scrap_data)

    assert response.status_code == 201
    data = response.json()
    assert data["sentence_id"] == sentence_id
    assert data["sentence_content"] == setup_data["sentence"].content
    assert data["book_name"] == setup_data["book"].name
    assert data["chapter"] == setup_data["sentence"].chapter
    assert "id" in data

    # Verify in DB
    scrap = session.get(Scrap, data["id"])
    assert scrap is not None
    assert scrap.user_id == 1  # Hardcoded in controller
    assert scrap.sentence_id == sentence_id

def test_create_duplicate_scrap_fails(client, setup_data, session):
    """
    시나리오 B (NFR_02 관련): 같은 문장을 2번 스크랩 시도 -> 400 Bad Request, 중복 금지.
    
    같은 user가 같은 sentence를 2번 스크랩하려고 하면:
    - 첫 번째: 201 Created 성공
    - 두 번째: 400 Bad Request (이미 스크랩한 문장입니다.)
    """
    sentence_id = setup_data["sentence"].id
    scrap_data = {"sentence_id": sentence_id}

    # 첫 번째 스크랩 - 성공
    response1 = client.post("/scraps", json=scrap_data)
    assert response1.status_code == 201

    # 두 번째 스크랩 시도 - 실패 (중복)
    response2 = client.post("/scraps", json=scrap_data)
    assert response2.status_code == 400
    data = response2.json()
    assert "이미 스크랩한 문장입니다" in data["detail"]

def test_delete_others_scrap_fails(client, setup_data, session):
    """
    시나리오 C: 다른 사용자의 스크랩을 삭제하려고 할 때 권한 에러 -> 403 Forbidden.
    
    User 1이 스크랩을 생성하고, User 1이 아닌 다른 사용자가 삭제하려고 하면:
    - 403 Forbidden (본인의 스크랩만 삭제할 수 있습니다.)
    
    주의: 현재는 get_current_user()가 항상 user_id=1을 반환하므로,
    이 테스트는 향후 JWT 도입 후 get_current_user()를 mock하여 user_id=2로 변경할 때
    실제로 작동합니다.
    """
    sentence_id = setup_data["sentence"].id
    scrap_data = {"sentence_id": sentence_id}

    # User 1이 스크랩 생성
    response = client.post("/scraps", json=scrap_data)
    assert response.status_code == 201
    scrap_id = response.json()["id"]

    # 현재: get_current_user()가 항상 1을 반환하므로 실제 권한 검증은 불가능
    # TODO: JWT 도입 후 get_current_user() mock 추가
    # 예시: 
    # def mock_get_current_user() -> int:
    #     return 2  # User 2로 변경
    # app.dependency_overrides[get_current_user] = mock_get_current_user
    
    # 현재 상황에서는 아래 테스트 코드로 비즈니스 로직 검증만 가능:
    # - service.delete_scrap() 직접 호출로 권한 검증 테스트
    from scrap.service import ScrapService
    from scrap.repository import PostgresqlScrapRepository
    
    repository = PostgresqlScrapRepository(session)
    service = ScrapService(repository)
    
    # User 2가 User 1의 스크랩을 삭제하려고 시도 -> 403 Forbidden
    from fastapi import HTTPException, status
    
    with pytest.raises(HTTPException) as exc_info:
        service.delete_scrap(scrap_id, user_id=2)
    
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "본인의 스크랩만 삭제할 수 있습니다" in exc_info.value.detail
