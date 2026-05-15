from typing import List

from db.model import Comment, SubComment, AlarmType
from comment.repository import CommentRepository
from alarm.service import AlarmService


class CommentService:
    """Service layer for comment related operations."""

    def __init__(self, repository: CommentRepository, alarm_service: AlarmService = None):
        self.repository = repository
        self.alarm_service = alarm_service

    def create_comment(self, comment_data: dict) -> Comment:
        """Persist a new comment into DB."""
        return self.repository.create(comment_data)

    def get_comments_by_sentence(self, sentence_id: int) -> List[Comment]:
        """Fetch comments for a sentence in descending order (newest first)."""
        return self.repository.get_by_sentence(sentence_id)

    def create_subcomment(self, subcomment_data: dict) -> SubComment:
        """
        Persist a new subcomment into DB and send alarm to parent comment author.
        
        Sends a COMMENT type alarm to the parent comment author when a new subcomment is created.
        """
        subcomment = self.repository.create_subcomment(subcomment_data)
        
        # Send alarm to parent comment author
        if self.alarm_service:
            parent_comment = self.repository.find(subcomment_data["comment_id"])
            if parent_comment and parent_comment.user_id:
                # Don't send alarm to yourself
                if parent_comment.user_id != subcomment_data["user_id"]:
                    self.alarm_service.create_alarm(
                        user_id=parent_comment.user_id,
                        alarm_type=AlarmType.COMMENT,
                        content="대댓글이 달렸습니다.",
                        target_url=f"/sentences/{parent_comment.sentence_id}/comments/{parent_comment.id}/subcomments"
                    )
        
        return subcomment

    def get_subcomments_by_comment(self, comment_id: int) -> List[SubComment]:
        """Fetch subcomments for a comment ordered by oldest first."""
        return self.repository.get_subcomments_by_comment(comment_id)

    def toggle_like(self, comment_id: int, user_id: int) -> bool:
        """
        Toggle like by user for a given comment and return new state.
        Sends a LIKE alarm to the comment author when a like is added (returns True).
        """
        liked = self.repository.toggle_like(comment_id, user_id)
        
        # Send alarm to comment author only when a new like is added
        if liked and self.alarm_service:
            comment = self.repository.find(comment_id)
            if comment and comment.user_id:
                # Don't send alarm to yourself
                if comment.user_id != user_id:
                    self.alarm_service.create_alarm(
                        user_id=comment.user_id,
                        alarm_type=AlarmType.LIKE,
                        content="댓글에 좋아요가 추가되었습니다.",
                        target_url=f"/sentences/{comment.sentence_id}/comments/{comment.id}"
                    )
        
        return liked

    def count_likes(self, comment_id: int) -> int:
        """Return total like count for a comment."""
        return self.repository.count_likes(comment_id)
