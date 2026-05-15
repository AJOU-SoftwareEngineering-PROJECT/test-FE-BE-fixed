from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.security import get_current_user
from alarm.repository import AlarmRepository, PostgresqlAlarmRepository
from alarm.service import AlarmService
from db.database import get_db

router = APIRouter(prefix="/alarms", tags=["alarms"])


class AlarmController:
    """Controller handling alarm related endpoints."""

    def __init__(self, service: AlarmService):
        self.service = service

    def get_unread_alarms(self, user_id: int):
        return self.service.get_unread_alarms(user_id)

    def mark_all_as_read(self, user_id: int):
        self.service.mark_all_alarms_as_read(user_id)
        return {"message": "모든 알림을 읽음 처리했습니다."}


def get_alarm_repository(db: Session = Depends(get_db)) -> AlarmRepository:
    return PostgresqlAlarmRepository(db)


def get_alarm_service(
    repository: AlarmRepository = Depends(get_alarm_repository),
) -> AlarmService:
    return AlarmService(repository)


def get_alarm_controller(
    service: AlarmService = Depends(get_alarm_service),
) -> AlarmController:
    return AlarmController(service)


@router.get("/unread", status_code=status.HTTP_200_OK)
def get_unread_alarms(
    controller: AlarmController = Depends(get_alarm_controller),
    user_id: int = Depends(get_current_user),
):
    return controller.get_unread_alarms(user_id)


@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_as_read(
    controller: AlarmController = Depends(get_alarm_controller),
    user_id: int = Depends(get_current_user),
):
    return controller.mark_all_as_read(user_id)
