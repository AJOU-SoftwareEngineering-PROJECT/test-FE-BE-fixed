from abc import ABC, abstractmethod
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from db.model import Alarm


class AlarmRepository(ABC):
    """Repository interface describing alarm persistence behavior."""

    @abstractmethod
    def create(self, alarm_data: dict) -> Alarm:
        """Persist a new alarm and return the stored entity."""

    @abstractmethod
    def get_unread_alarms(self, user_id: int) -> List[Alarm]:
        """Get all unread alarms for a user, ordered by most recent first."""

    @abstractmethod
    def mark_all_as_read(self, user_id: int) -> None:
        """Mark all alarms for a user as read."""

    @abstractmethod
    def bulk_create(self, alarm_list: List[dict]) -> int:
        """Create multiple alarms efficiently (for NFR_01 performance)."""


class PostgresqlAlarmRepository(AlarmRepository):
    """SQLAlchemy-backed implementation of the AlarmRepository."""

    def __init__(self, session: Session):
        self.session = session

    def create(self, alarm_data: dict) -> Alarm:
        """Create a single alarm."""
        alarm = Alarm(**alarm_data)
        self.session.add(alarm)
        try:
            self.session.commit()
            self.session.refresh(alarm)
            return alarm
        except IntegrityError:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 사용자를 찾을 수 없습니다."
            )

    def get_unread_alarms(self, user_id: int) -> List[Alarm]:
        """
        Get all unread alarms for a user.
        Ordered by created_at DESC (most recent first).
        """
        return (
            self.session.query(Alarm)
            .filter(Alarm.user_id == user_id, Alarm.is_read == False)
            .order_by(Alarm.created_at.desc())
            .all()
        )

    def mark_all_as_read(self, user_id: int) -> None:
        """
        Mark all alarms for a user as read (is_read = True).
        Uses bulk update for efficiency (NFR_01).
        """
        self.session.query(Alarm).filter(
            Alarm.user_id == user_id,
            Alarm.is_read == False
        ).update({Alarm.is_read: True})
        self.session.commit()

    def bulk_create(self, alarm_list: List[dict]) -> int:
        """
        Create multiple alarms efficiently using bulk insert.
        Returns the count of alarms created.
        Optimized for NFR_01 (performance requirement).
        """
        if not alarm_list:
            return 0

        try:
            self.session.bulk_insert_mappings(Alarm, alarm_list)
            self.session.commit()
            return len(alarm_list)
        except IntegrityError:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="일부 사용자를 찾을 수 없어 알림 생성에 실패했습니다."
            )
