from typing import List

from db.model import Alarm, AlarmType
from alarm.repository import AlarmRepository


class AlarmService:
    """Service layer for alarm related operations."""

    def __init__(self, repository: AlarmRepository):
        self.repository = repository

    def create_alarm(
        self,
        user_id: int,
        alarm_type: AlarmType,
        content: str,
        target_url: str = None,
        sender_name: str = None,
    ) -> Alarm:
        """
        Create a single alarm for a user.
        
        Args:
            user_id: ID of the user who receives the alarm
            alarm_type: Type of alarm (LIKE, COMMENT, NEW_CHAPTER)
            content: Alarm message content
            target_url: URL to navigate to when clicked (optional)
        
        Returns:
            Created Alarm entity
        """
        formatted_content = self._build_content(content, sender_name)
        alarm_data = {
            "user_id": user_id,
            "type": alarm_type,
            "content": formatted_content,
            "target_url": target_url,
            "is_read": False,
        }
        return self.repository.create(alarm_data)

    def _build_content(self, content: str, sender_name: str | None) -> str:
        if sender_name:
            return f"{sender_name}님이 {content}"
        return content

    def create_alarms_bulk(
        self,
        user_ids: List[int],
        alarm_type: AlarmType,
        content: str,
        target_url: str = None
    ) -> int:
        """
        Create multiple alarms efficiently for multiple users.
        Optimized for NFR_01 (performance requirement).
        
        Args:
            user_ids: List of user IDs to receive alarms
            alarm_type: Type of alarm (LIKE, COMMENT, NEW_CHAPTER)
            content: Alarm message content
            target_url: URL to navigate to when clicked (optional)
        
        Returns:
            Count of alarms created
        """
        alarm_list = [
            {
                "user_id": user_id,
                "type": alarm_type,
                "content": content,
                "target_url": target_url,
                "is_read": False,
            }
            for user_id in user_ids
        ]
        return self.repository.bulk_create(alarm_list)

    def get_unread_alarms(self, user_id: int) -> List[Alarm]:
        """
        Get all unread alarms for a user.
        Ordered by most recent first (created_at DESC).
        """
        return self.repository.get_unread_alarms(user_id)

    def mark_all_alarms_as_read(self, user_id: int) -> None:
        """
        Mark all unread alarms for a user as read.
        Uses efficient bulk update (NFR_01).
        """
        self.repository.mark_all_as_read(user_id)
