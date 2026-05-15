from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.security import get_current_user
from scrap.repository import ScrapRepository, PostgresqlScrapRepository
from scrap.schemas import ScrapCreate, ScrapResponse
from scrap.service import ScrapService
from db.database import get_db

router = APIRouter(prefix="/scraps", tags=["scraps"])
user_router = APIRouter(prefix="/users", tags=["users"])


class ScrapController:
    """Controller handling scrap related endpoints."""

    def __init__(self, service: ScrapService):
        self.service = service

    def create_scrap(self, scrap: ScrapCreate, user_id: int) -> ScrapResponse:
        """Create a new scrap for a user."""
        scrap_data = {
            "user_id": user_id,
            "sentence_id": scrap.sentence_id,
        }
        return self.service.create_scrap(scrap_data)

    def delete_scrap(self, scrap_id: int, user_id: int) -> dict:
        """Delete a scrap by id (only if user owns it)."""
        self.service.delete_scrap(scrap_id, user_id)
        return {"message": "스크랩이 취소되었습니다."}

    def get_user_scraps(self, user_id: int) -> list[ScrapResponse]:
        """Get all scraps for the current user."""
        return self.service.get_scraps_by_user(user_id)


def get_scrap_repository(db: Session = Depends(get_db)) -> ScrapRepository:
    """Provide a repository wired with the active DB session."""
    return PostgresqlScrapRepository(db)


def get_scrap_service(
    repository: ScrapRepository = Depends(get_scrap_repository),
) -> ScrapService:
    """Provide a ScrapService using the repository abstraction."""
    return ScrapService(repository)


def get_scrap_controller(
    service: ScrapService = Depends(get_scrap_service),
) -> ScrapController:
    """Provide a ScrapController wired with dependencies."""
    return ScrapController(service)


@router.post("", response_model=ScrapResponse, status_code=status.HTTP_201_CREATED)
def create_scrap(
    scrap: ScrapCreate,
    controller: ScrapController = Depends(get_scrap_controller),
    user_id: int = Depends(get_current_user),
):
    """REST endpoint to create a new scrap."""
    return controller.create_scrap(scrap, user_id)


@router.delete("/{scrap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scrap(
    scrap_id: int,
    controller: ScrapController = Depends(get_scrap_controller),
    user_id: int = Depends(get_current_user),
):
    """REST endpoint to delete a scrap."""
    controller.delete_scrap(scrap_id, user_id)


@user_router.get("/me/scraps", response_model=list[ScrapResponse], status_code=status.HTTP_200_OK)
def get_user_scraps(
    controller: ScrapController = Depends(get_scrap_controller),
    user_id: int = Depends(get_current_user),
):
    """REST endpoint to fetch all scraps for the current user."""
    return controller.get_user_scraps(user_id)
