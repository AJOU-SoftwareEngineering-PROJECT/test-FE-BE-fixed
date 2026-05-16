import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text, DateTime, UniqueConstraint, func, Boolean
from sqlalchemy.orm import relationship, foreign

from db.database import Base


class Gender(enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class AlarmType(enum.Enum):
    LIKE = "LIKE"
    COMMENT = "COMMENT"
    NEW_CHAPTER = "NEW_CHAPTER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    gender = Column(Enum(Gender), nullable=False, default=Gender.MALE)
    age = Column(Integer, nullable=False, default=20)
    intro = Column(Text, nullable=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=True)

    books = relationship("Book", back_populates="author")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    intro = Column(Text, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship("User", back_populates="books")


class Sentence(Base):
    __tablename__ = "sentences"

    id = Column(Integer, primary_key=True, index=True)
    chapter = Column(Integer, nullable=False, default=1)
    content = Column(Text, nullable=False)
    after_id = Column(Integer, nullable=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)

    book = relationship("Book", back_populates="sentences")


class SentenceLikeUserMapping(Base):
    __tablename__ = "sentence_like_user_mappings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sentence_id = Column(Integer, ForeignKey("sentences.id"), nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "sentence_id", name="uq_sentence_user_like"),)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sentence_id = Column(Integer, ForeignKey("sentences.id"), nullable=False)
    like_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())

    subcomments = relationship("SubComment", back_populates="comment", cascade="all, delete-orphan")
    likes = relationship("CommentLikeUserMap", back_populates="comment", cascade="all, delete-orphan")


class SubComment(Base):
    __tablename__ = "subcomments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    comment = relationship("Comment", back_populates="subcomments")


class CommentLikeUserMap(Base):
    __tablename__ = "comment_like_user_map"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    __table_args__ = (UniqueConstraint("comment_id", "user_id", name="uq_comment_user_like"),)

    comment = relationship("Comment", back_populates="likes")


class Scrap(Base):
    __tablename__ = "scraps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sentence_id = Column(Integer, ForeignKey("sentences.id"), nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "sentence_id", name="uq_scrap_user_sentence"),)


class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(AlarmType), nullable=False)
    content = Column(Text, nullable=False)
    target_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())


# Annotate the Book->Sentence relationship when the Sentence.book_id column
# should be treated as the foreign side even in environments where the DB
# does not enforce foreign key constraints. This allows creating Sentence
# rows with arbitrary book_id values during tests while preserving ORM
# relationship behavior.
Book.sentences = relationship(
    "Sentence",
    primaryjoin=foreign(Sentence.book_id) == Book.id,
    back_populates="book",
)