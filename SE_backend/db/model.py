from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, Boolean, func
from sqlalchemy.orm import relationship
from db.database import Base
from enum import Enum as PyEnum


BIGINT = BigInteger().with_variant(Integer, "sqlite")

class Timestamp(Base):
    __abstract__=True

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Gender(PyEnum):
    MALE = "male"
    FEMALE = "female"

class AlarmType(PyEnum):
    LIKE = "like"
    COMMENT = "comment"
    NEW_CHAPTER = "new_chapter"

class User(Timestamp):
    __tablename__ = "users"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    name = Column(String(10), nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    age = Column(Integer, nullable=False)
    intro = Column(Text, nullable=False)
    email = Column(String(50), nullable=False)
    scraps = relationship("Scrap", back_populates="user", cascade="all, delete-orphan")
    alarms = relationship("Alarm", back_populates="user", cascade="all, delete-orphan")


class Book(Timestamp):
    __tablename__ = "books"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    intro = Column(String, nullable=False)

    author_id = Column(BIGINT, ForeignKey("users.id"))
    sentences = relationship(
        "Sentence",
        back_populates="book",
        cascade="all, delete-orphan",
    )

class Sentence(Timestamp):
    __tablename__ = "sentences"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    chapter = Column(Integer, nullable=False)
    content = Column(String, nullable=False)

    after_id = Column(BIGINT, ForeignKey("sentences.id"))
    book_id = Column(BIGINT, ForeignKey("books.id"))
    
    after_sentence = relationship(
        "Sentence",
        foreign_keys=[after_id],
        remote_side=[id],
        uselist=False
    )
    book = relationship("Book", back_populates="sentences")
    scraps = relationship("Scrap", back_populates="sentence", cascade="all, delete-orphan")

class Scrap(Timestamp):
    __tablename__ = "scraps"

    id = Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BIGINT, ForeignKey("users.id"), nullable=False)
    sentence_id = Column(BIGINT, ForeignKey("sentences.id"), nullable=False)

    user = relationship("User", back_populates="scraps")
    sentence = relationship("Sentence", back_populates="scraps")

    __table_args__ = (
        UniqueConstraint("user_id", "sentence_id", name="uq_scrap_user_sentence"),
    )

class SentenceLikeUserMapping(Timestamp):
    __tablename__ = "sentence_likes_user_mappings"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)

    user_id = Column(BIGINT, ForeignKey("users.id"))
    sentence_id = Column(BIGINT, ForeignKey("sentences.id"))

class Comment(Timestamp):
    __tablename__ = "comments"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    content = Column(String, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)

    user_id = Column(BIGINT, ForeignKey("users.id"))
    sentence_id = Column(BIGINT, ForeignKey("sentences.id"))


class SubComment(Timestamp):
    __tablename__ = "subcomments"

    id= Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    content = Column(String, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)


    user_id = Column(BIGINT, ForeignKey("users.id"))
    comment_id = Column(BIGINT, ForeignKey("comments.id"))

class CommentLikeUserMap(Timestamp):
    __tablename__ = "comment_like_user_mappings"

    comment_id = Column(BIGINT, ForeignKey("comments.id"), primary_key=True)
    user_id = Column(BIGINT, ForeignKey("users.id"), primary_key=True)

class Alarm(Timestamp):
    __tablename__ = "alarms"

    id = Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BIGINT, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(AlarmType), nullable=False)
    content = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    target_url = Column(String, nullable=True)

    user = relationship("User", back_populates="alarms")






    
