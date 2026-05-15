from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Session

from db.database import Base, engine, get_db
from db.model import Book, Sentence, User, Gender


router = APIRouter(prefix="/api", tags=["frontend-api"])


# =========================
# Extra frontend tables
# =========================

class FrontComment(Base):
    __tablename__ = "frontend_comments"

    id = Column(Integer, primary_key=True, index=True)
    sentence_id = Column(Integer, ForeignKey("sentences.id"), nullable=False)
    content = Column(Text, nullable=False)
    user_name = Column(String(100), nullable=False, default="Guest User")
    like_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class FrontScrap(Base):
    __tablename__ = "frontend_scraps"

    id = Column(Integer, primary_key=True, index=True)
    sentence_id = Column(Integer, ForeignKey("sentences.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    sentence_content = Column(Text, nullable=False)
    book_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


def create_frontend_tables():
    Base.metadata.create_all(bind=engine)


# =========================
# Schemas
# =========================

class FrontBookCreate(BaseModel):
    name: str
    intro: Optional[str] = ""
    author_name: str
    author_email: Optional[str] = None
    sentences: list[str] = Field(default_factory=list)


class FrontBookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    intro: Optional[str] = None
    author_id: Optional[int] = None
    author_name: str
    like_count: int = 0


class FrontAuthorCreate(BaseModel):
    name: str
    gender: str = "MALE"
    age: int = 20
    intro: Optional[str] = ""
    email: str


class FrontAuthorUpdate(BaseModel):
    name: str
    gender: str = "MALE"
    age: int = 20
    intro: Optional[str] = ""
    email: str


class FrontAuthorResponse(BaseModel):
    id: int
    name: str
    gender: str
    age: int
    intro: Optional[str] = None
    email: str
    book_count: int = 0


class FrontAuthorDetailResponse(BaseModel):
    id: int
    name: str
    gender: str
    age: int
    intro: Optional[str] = None
    email: str
    books: list[FrontBookResponse] = Field(default_factory=list)


class FrontSentenceCreate(BaseModel):
    chapter: int = 1
    content: str
    after_id: Optional[int] = None


class FrontSentenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chapter: int
    content: str
    after_id: Optional[int] = None
    book_id: int


class FrontCommentCreate(BaseModel):
    content: str
    user_name: str = "Guest User"


class FrontCommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sentence_id: int
    content: str
    user_name: str
    like_count: int
    created_at: datetime


class FrontScrapCreate(BaseModel):
    sentence_id: int


class FrontScrapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sentence_id: int
    book_id: int
    sentence_content: str
    book_name: str
    created_at: datetime


class DashboardStat(BaseModel):
    label: str
    value: int
    description: str


class DashboardOverviewItem(BaseModel):
    month: str
    value: int


class DashboardActivity(BaseModel):
    type: str
    title: str
    time: str


class DashboardResponse(BaseModel):
    stats: list[DashboardStat]
    readingOverview: list[DashboardOverviewItem]
    recentActivities: list[DashboardActivity]


class FrontMyPageUpdate(BaseModel):
    name: str
    gender: str = "MALE"
    age: int = 20
    intro: Optional[str] = ""
    email: str


class FrontMyPageProfile(BaseModel):
    id: int
    name: str
    gender: str
    age: int
    intro: Optional[str] = None
    email: str
    book_count: int = 0
    comment_count: int = 0
    scrap_count: int = 0


class FrontMyPageActivity(BaseModel):
    type: str
    title: str
    description: str
    time: str


class FrontMyPageResponse(BaseModel):
    profile: FrontMyPageProfile
    activities: list[FrontMyPageActivity]
    books: list[FrontBookResponse]
    scraps: list[FrontScrapResponse]
    comments: list[FrontCommentResponse]


# =========================
# Helpers
# =========================

def gender_to_string(gender):
    if hasattr(gender, "value"):
        return gender.value
    return str(gender)


def parse_gender(value: str):
    if value and value.upper() == "FEMALE":
        return Gender.FEMALE
    return Gender.MALE


def get_current_front_user(db: Session):
    user = db.query(User).order_by(User.id.asc()).first()

    if not user:
        user = User(
            name="Guest User",
            gender=Gender.MALE,
            age=20,
            intro="This is a default user profile.",
            email="guest@frontend.local",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def make_author_response(author: User, db: Session):
    book_count = db.query(Book).filter(Book.author_id == author.id).count()

    return {
        "id": author.id,
        "name": author.name,
        "gender": gender_to_string(author.gender),
        "age": author.age,
        "intro": author.intro,
        "email": author.email,
        "book_count": book_count,
    }


def make_book_response(book: Book, author_name: str = "Unknown Author"):
    return {
        "id": book.id,
        "name": book.name,
        "intro": getattr(book, "intro", None),
        "author_id": getattr(book, "author_id", None),
        "author_name": author_name or "Unknown Author",
        "like_count": 0,
    }


# =========================
# My Page
# =========================

@router.get("/me", response_model=FrontMyPageResponse)
def get_my_page(db: Session = Depends(get_db)):
    user = get_current_front_user(db)

    books = (
        db.query(Book)
        .filter(Book.author_id == user.id)
        .order_by(Book.id.desc())
        .all()
    )

    comments = (
        db.query(FrontComment)
        .filter(FrontComment.user_name == user.name)
        .order_by(FrontComment.created_at.desc())
        .limit(20)
        .all()
    )

    scraps = (
        db.query(FrontScrap)
        .order_by(FrontScrap.created_at.desc())
        .limit(20)
        .all()
    )

    book_items = [
        make_book_response(book, user.name)
        for book in books
    ]

    activities = []

    for book in books[:3]:
        activities.append(
            {
                "type": "book",
                "title": "Book created",
                "description": book.name,
                "time": "Recently",
            }
        )

    for comment in comments[:3]:
        preview = comment.content[:70] + "..." if len(comment.content) > 70 else comment.content

        activities.append(
            {
                "type": "comment",
                "title": "Comment written",
                "description": preview,
                "time": "Recently",
            }
        )

    for scrap in scraps[:3]:
        preview = scrap.sentence_content[:70] + "..." if len(scrap.sentence_content) > 70 else scrap.sentence_content

        activities.append(
            {
                "type": "scrap",
                "title": f"Sentence saved from {scrap.book_name}",
                "description": preview,
                "time": "Recently",
            }
        )

    if not activities:
        activities.append(
            {
                "type": "system",
                "title": "No activity yet",
                "description": "Start reading, commenting, or bookmarking sentences.",
                "time": "Now",
            }
        )

    return {
        "profile": {
            "id": user.id,
            "name": user.name,
            "gender": gender_to_string(user.gender),
            "age": user.age,
            "intro": user.intro,
            "email": user.email,
            "book_count": len(books),
            "comment_count": len(comments),
            "scrap_count": len(scraps),
        },
        "activities": activities[:8],
        "books": book_items,
        "scraps": scraps,
        "comments": comments,
    }


@router.put("/me", response_model=FrontMyPageProfile)
def update_my_page(dto: FrontMyPageUpdate, db: Session = Depends(get_db)):
    user = get_current_front_user(db)

    name = dto.name.strip()
    email = dto.email.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    existing = (
        db.query(User)
        .filter(User.email == email, User.id != user.id)
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    old_name = user.name

    user.name = name
    user.email = email
    user.gender = parse_gender(dto.gender)
    user.age = dto.age
    user.intro = dto.intro or ""

    db.query(FrontComment).filter(FrontComment.user_name == old_name).update(
        {"user_name": name}
    )

    db.commit()
    db.refresh(user)

    book_count = db.query(Book).filter(Book.author_id == user.id).count()
    comment_count = db.query(FrontComment).filter(FrontComment.user_name == user.name).count()
    scrap_count = db.query(FrontScrap).count()

    return {
        "id": user.id,
        "name": user.name,
        "gender": gender_to_string(user.gender),
        "age": user.age,
        "intro": user.intro,
        "email": user.email,
        "book_count": book_count,
        "comment_count": comment_count,
        "scrap_count": scrap_count,
    }


# =========================
# Authors
# =========================

@router.get("/authors", response_model=list[FrontAuthorResponse])
def get_authors(db: Session = Depends(get_db)):
    authors = db.query(User).order_by(User.id.desc()).all()
    return [make_author_response(author, db) for author in authors]


@router.post("/authors", response_model=FrontAuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(dto: FrontAuthorCreate, db: Session = Depends(get_db)):
    name = dto.name.strip()
    email = dto.email.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Author name is required")

    if not email:
        raise HTTPException(status_code=400, detail="Author email is required")

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Author email already exists")

    author = User(
        name=name,
        gender=parse_gender(dto.gender),
        age=dto.age,
        intro=dto.intro or "",
        email=email,
    )

    db.add(author)
    db.commit()
    db.refresh(author)

    return make_author_response(author, db)


@router.get("/authors/{author_id}", response_model=FrontAuthorDetailResponse)
def get_author_detail(author_id: int, db: Session = Depends(get_db)):
    author = db.query(User).filter(User.id == author_id).first()

    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    books = (
        db.query(Book)
        .filter(Book.author_id == author_id)
        .order_by(Book.id.desc())
        .all()
    )

    book_items = [
        make_book_response(book, author.name)
        for book in books
    ]

    return {
        "id": author.id,
        "name": author.name,
        "gender": gender_to_string(author.gender),
        "age": author.age,
        "intro": author.intro,
        "email": author.email,
        "books": book_items,
    }


@router.put("/authors/{author_id}", response_model=FrontAuthorResponse)
def update_author(author_id: int, dto: FrontAuthorUpdate, db: Session = Depends(get_db)):
    author = db.query(User).filter(User.id == author_id).first()

    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    name = dto.name.strip()
    email = dto.email.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Author name is required")

    if not email:
        raise HTTPException(status_code=400, detail="Author email is required")

    existing = (
        db.query(User)
        .filter(User.email == email, User.id != author_id)
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Author email already exists")

    author.name = name
    author.email = email
    author.gender = parse_gender(dto.gender)
    author.age = dto.age
    author.intro = dto.intro or ""

    db.commit()
    db.refresh(author)

    return make_author_response(author, db)


@router.delete("/authors/{author_id}")
def delete_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(User).filter(User.id == author_id).first()

    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    book_count = db.query(Book).filter(Book.author_id == author_id).count()

    if book_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete author because this author has books",
        )

    db.delete(author)
    db.commit()

    return {"message": "Author deleted"}


# =========================
# Books
# =========================

@router.post("/books", response_model=FrontBookResponse, status_code=status.HTTP_201_CREATED)
def create_book(dto: FrontBookCreate, db: Session = Depends(get_db)):
    book_name = dto.name.strip()
    author_name = dto.author_name.strip()

    if not book_name:
        raise HTTPException(status_code=400, detail="Book name is required")

    if not author_name:
        raise HTTPException(status_code=400, detail="Author name is required")

    email = dto.author_email or f"{author_name.lower().replace(' ', '.')}@frontend.local"

    author = db.query(User).filter(User.email == email).first()

    if not author:
        author = User(
            name=author_name,
            gender=Gender.MALE,
            age=20,
            intro=f"{author_name} is a frontend-created author.",
            email=email,
        )

        db.add(author)
        db.commit()
        db.refresh(author)

    book = Book(
        name=book_name,
        intro=dto.intro or "",
        author_id=author.id,
    )

    db.add(book)
    db.commit()
    db.refresh(book)

    for content in dto.sentences:
        clean_content = content.strip()

        if clean_content:
            sentence = Sentence(
                chapter=1,
                content=clean_content,
                after_id=None,
                book_id=book.id,
            )

            db.add(sentence)

    db.commit()

    return make_book_response(book, author.name)


@router.get("/books", response_model=list[FrontBookResponse])
def get_books(db: Session = Depends(get_db)):
    rows = (
        db.query(Book, User.name.label("author_name"))
        .join(User, Book.author_id == User.id, isouter=True)
        .order_by(Book.id.asc())
        .all()
    )

    return [
        make_book_response(book, author_name)
        for book, author_name in rows
    ]


@router.get("/books/{book_id}", response_model=FrontBookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    row = (
        db.query(Book, User.name.label("author_name"))
        .join(User, Book.author_id == User.id, isouter=True)
        .filter(Book.id == book_id)
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    book, author_name = row

    return make_book_response(book, author_name)


# =========================
# Sentences
# =========================

@router.get("/books/{book_id}/sentences", response_model=list[FrontSentenceResponse])
def get_book_sentences(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return (
        db.query(Sentence)
        .filter(Sentence.book_id == book_id)
        .order_by(Sentence.chapter.asc(), Sentence.id.asc())
        .all()
    )


@router.post(
    "/books/{book_id}/sentences",
    response_model=FrontSentenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_book_sentence(
    book_id: int,
    dto: FrontSentenceCreate,
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if not dto.content.strip():
        raise HTTPException(status_code=400, detail="Sentence content is required")

    sentence = Sentence(
        chapter=dto.chapter,
        content=dto.content.strip(),
        after_id=dto.after_id,
        book_id=book_id,
    )

    db.add(sentence)
    db.commit()
    db.refresh(sentence)

    return sentence


# =========================
# Comments
# =========================

@router.get("/sentences/{sentence_id}/comments", response_model=list[FrontCommentResponse])
def get_sentence_comments(sentence_id: int, db: Session = Depends(get_db)):
    sentence = db.query(Sentence).filter(Sentence.id == sentence_id).first()

    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    return (
        db.query(FrontComment)
        .filter(FrontComment.sentence_id == sentence_id)
        .order_by(FrontComment.created_at.asc())
        .all()
    )


@router.post(
    "/sentences/{sentence_id}/comments",
    response_model=FrontCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sentence_comment(
    sentence_id: int,
    dto: FrontCommentCreate,
    db: Session = Depends(get_db),
):
    sentence = db.query(Sentence).filter(Sentence.id == sentence_id).first()

    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    if not dto.content.strip():
        raise HTTPException(status_code=400, detail="Comment content is required")

    comment = FrontComment(
        sentence_id=sentence_id,
        content=dto.content.strip(),
        user_name=dto.user_name or "Guest User",
        like_count=0,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


@router.post("/comments/{comment_id}/like", response_model=FrontCommentResponse)
def like_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(FrontComment).filter(FrontComment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.like_count += 1

    db.commit()
    db.refresh(comment)

    return comment


# =========================
# Scraps
# =========================

@router.get("/scraps", response_model=list[FrontScrapResponse])
def get_scraps(db: Session = Depends(get_db)):
    return (
        db.query(FrontScrap)
        .order_by(FrontScrap.created_at.desc())
        .all()
    )


@router.post("/scraps", response_model=FrontScrapResponse, status_code=status.HTTP_201_CREATED)
def create_scrap(dto: FrontScrapCreate, db: Session = Depends(get_db)):
    sentence = db.query(Sentence).filter(Sentence.id == dto.sentence_id).first()

    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    book = db.query(Book).filter(Book.id == sentence.book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing = (
        db.query(FrontScrap)
        .filter(FrontScrap.sentence_id == sentence.id)
        .first()
    )

    if existing:
        return existing

    scrap = FrontScrap(
        sentence_id=sentence.id,
        book_id=book.id,
        sentence_content=sentence.content,
        book_name=book.name,
    )

    db.add(scrap)
    db.commit()
    db.refresh(scrap)

    return scrap


@router.delete("/scraps/{scrap_id}")
def delete_scrap(scrap_id: int, db: Session = Depends(get_db)):
    scrap = db.query(FrontScrap).filter(FrontScrap.id == scrap_id).first()

    if not scrap:
        raise HTTPException(status_code=404, detail="Scrap not found")

    db.delete(scrap)
    db.commit()

    return {"message": "Scrap deleted"}


# =========================
# Dashboard
# =========================

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    books_count = db.query(Book).count()
    readers_count = db.query(User).count()
    comments_count = db.query(FrontComment).count()
    scraps_count = db.query(FrontScrap).count()

    chapters_count = (
        db.query(Sentence.book_id, Sentence.chapter)
        .distinct()
        .count()
    )

    stats = [
        {"label": "Books", "value": books_count, "description": "등록된 도서"},
        {"label": "Chapters", "value": chapters_count, "description": "전체 챕터"},
        {"label": "Comments", "value": comments_count, "description": "문장별 댓글"},
        {"label": "Completed", "value": scraps_count, "description": "저장된 문장"},
        {"label": "Readers", "value": readers_count, "description": "전체 사용자"},
        {"label": "Playlists", "value": 0, "description": "음악 API 준비 중"},
    ]

    chapter_rows = (
        db.query(
            Sentence.chapter.label("chapter"),
            func.count(Sentence.id).label("count"),
        )
        .group_by(Sentence.chapter)
        .order_by(Sentence.chapter.asc())
        .limit(6)
        .all()
    )

    reading_overview = [
        {"month": f"Ch {row.chapter}", "value": int(row.count)}
        for row in chapter_rows
    ]

    if not reading_overview:
        reading_overview = [
            {"month": "Ch 1", "value": 0},
            {"month": "Ch 2", "value": 0},
            {"month": "Ch 3", "value": 0},
            {"month": "Ch 4", "value": 0},
            {"month": "Ch 5", "value": 0},
            {"month": "Ch 6", "value": 0},
        ]

    recent_activities = []

    latest_comments = (
        db.query(FrontComment)
        .order_by(FrontComment.created_at.desc())
        .limit(3)
        .all()
    )

    for comment in latest_comments:
        preview = comment.content[:50] + "..." if len(comment.content) > 50 else comment.content
        recent_activities.append(
            {
                "type": "comment",
                "title": f"New comment: {preview}",
                "time": "Recently",
            }
        )

    latest_scraps = (
        db.query(FrontScrap)
        .order_by(FrontScrap.created_at.desc())
        .limit(2)
        .all()
    )

    for scrap in latest_scraps:
        recent_activities.append(
            {
                "type": "scrap",
                "title": f"Sentence bookmarked from {scrap.book_name}",
                "time": "Recently",
            }
        )

    latest_books = db.query(Book).order_by(Book.id.desc()).limit(2).all()

    for book in latest_books:
        recent_activities.append(
            {
                "type": "book",
                "title": f"Book available: {book.name}",
                "time": "Recently",
            }
        )

    if not recent_activities:
        recent_activities = [
            {
                "type": "system",
                "title": "No activity yet. Start reading and commenting.",
                "time": "Now",
            }
        ]

    return {
        "stats": stats,
        "readingOverview": reading_overview,
        "recentActivities": recent_activities[:6],
    }


# Create frontend extra tables automatically
create_frontend_tables()