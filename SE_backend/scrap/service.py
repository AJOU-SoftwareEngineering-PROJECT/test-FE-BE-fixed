from typing import List

from fastapi import HTTPException, status

from db.model import Scrap
from scrap.repository import ScrapRepository
from scrap.schemas import ScrapResponse


class ScrapService:
    """Service layer for scrap related operations."""

    def __init__(self, repository: ScrapRepository):
        self.repository = repository

    def create_scrap(self, scrap_data: dict) -> ScrapResponse:
        """
        Persist a new scrap into DB and return with details.
        
        - Checks for duplicate scraps before creation (raises 400 if duplicate)
        - Validates that the sentence exists (raises 404 if not)
        """
        # Check for duplicate scrap
        existing_scrap = self.repository.find_existing_scrap(
            scrap_data["user_id"],
            scrap_data["sentence_id"]
        )
        if existing_scrap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 스크랩한 문장입니다."
            )
        
        created = self.repository.create(scrap_data)
        scrap_dict = self.repository.find_scrap_with_details(created.id)
        return ScrapResponse(**scrap_dict)

    def delete_scrap(self, scrap_id: int, user_id: int) -> None:
        """
        Delete a scrap, validating that the user owns it.
        Raises 403 if user doesn't own the scrap.
        """
        scrap = self.repository.find(scrap_id)
        
        if not scrap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 스크랩을 찾을 수 없습니다."
            )
        
        if scrap.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="본인의 스크랩만 삭제할 수 있습니다."
            )
        
        self.repository.delete(scrap_id)

    def get_scraps_by_user(self, user_id: int) -> List[ScrapResponse]:
        """Fetch all scraps for a user with sentence and book details."""
        scrap_dicts = self.repository.find_by_user(user_id)
        return [ScrapResponse(**scrap_dict) for scrap_dict in scrap_dicts]
