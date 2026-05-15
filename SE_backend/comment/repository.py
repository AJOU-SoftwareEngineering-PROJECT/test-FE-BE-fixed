from abc import ABC, abstractmethod
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from db.model import Comment, SubComment, CommentLikeUserMap

class CommentRepository(ABC):
    """Repository interface describing comment persistence behavior."""

    @abstractmethod
    def find(self, comment_id: int) -> Comment:
        "id로 comment를 조회한다."

    @abstractmethod
    def create(self, comment_data: dict) -> Comment:
        """Persist a new comment and return the stored entity."""

    @abstractmethod
    def get_by_sentence(self, sentence_id: int) -> List[Comment]:
        """Return comments for a specific sentence, most recent first."""

    @abstractmethod
    def create_subcomment(self, subcomment_data: dict) -> SubComment:
        """Persist a new subcomment and return the stored entity."""

    @abstractmethod
    def get_subcomments_by_comment(self, comment_id: int) -> List[SubComment]:
        """Return subcomments for a given comment, ordered oldest first."""

    @abstractmethod
    def toggle_like(self, comment_id: int, user_id: int) -> bool:
        """Toggle like status for a user on a comment."""

    @abstractmethod
    def count_likes(self, comment_id: int) -> int:
        """Count likes for a comment."""


class PostgresqlCommentRepository(CommentRepository):
    """SQLAlchemy-backed implementation of the CommentRepository."""

    def __init__(self, session: Session):
        self.session = session

    def find(self, comment_id: int):
        return self.session.get(Comment, comment_id)

    def create(self, comment_data: dict) -> Comment:
        comment = Comment(**comment_data)
        self.session.add(comment)
        try:
            self.session.commit()
            self.session.refresh(comment)
            return comment
        # ✨ 핵심 포인트: DB에서 외래키(문장)를 찾을 수 없을 때 404 에러로 우아하게 변환!
        except IntegrityError: 
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="해당 문장을 찾을 수 없습니다."
            )

    def get_by_sentence(self, sentence_id: int) -> List[Comment]:
        return (
            self.session.query(Comment)
            .filter(Comment.sentence_id == sentence_id)
            .order_by(Comment.like_count.desc())
            .all()
        )

    def create_subcomment(self, subcomment_data: dict) -> SubComment:
        subcomment = SubComment(**subcomment_data)
        self.session.add(subcomment)

        try:
            self.session.commit()
            self.session.refresh(subcomment)
            return subcomment
        except IntegrityError:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 댓글을 찾을 수 없습니다."
            )

    def get_subcomments_by_comment(self, comment_id: int) -> List[SubComment]:
        return (
            self.session.query(SubComment)
            .filter(SubComment.comment_id == comment_id)
            .order_by(SubComment.created_at.asc())
            .all()
        )

    def toggle_like(self, comment_id: int, user_id: int) -> bool:
        mapping = (
            self.session.query(CommentLikeUserMap)
            .filter(
                CommentLikeUserMap.comment_id == comment_id,
                CommentLikeUserMap.user_id == user_id,
            )
            .one_or_none()
        )

        if mapping is not None:
            self.session.delete(mapping)
            self.session.commit()
            return False
        
        comment = self.find(comment_id)
        comment.like_count = comment.like_count + 1
        self.session.add(comment)

        new_mapping = CommentLikeUserMap(comment_id=comment_id, user_id=user_id)
        self.session.add(new_mapping)

        try:
            self.session.commit()
            return True
        except IntegrityError:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 댓글을 찾을 수 없습니다."
            )

    def count_likes(self, comment_id: int) -> int:
        return self.find(comment_id).like_count