from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.security import get_current_user
from comment.repository import CommentRepository, PostgresqlCommentRepository
from comment.schemas import CommentCreate, CommentResponse, SubCommentCreate, SubCommentResponse
from comment.service import CommentService
from alarm.repository import AlarmRepository, PostgresqlAlarmRepository
from alarm.service import AlarmService
from db.database import get_db

router = APIRouter(prefix="/sentences", tags=["comments"])
subcomment_router = APIRouter(prefix="/comments", tags=["subcomments"])

class CommentController:
    """Controller handling comment related endpoints."""

    def __init__(self, service: CommentService):
        self.service = service

    def create_comment(self, sentence_id: int, comment: CommentCreate, user_id: int) -> CommentResponse:
        """Create a new comment for a given sentence."""
        comment_data = {
            "content": comment.content,
            "user_id": user_id,
            "sentence_id": sentence_id,
        }

        created = self.service.create_comment(comment_data)
        
        response_data = CommentResponse.model_validate(created).model_dump()
        response_data["like_count"] = 0
        return CommentResponse(**response_data)

    def get_comments_by_sentence(self, sentence_id: int) -> list[CommentResponse]:
        """Get comments for a sentence ordered by most recent first."""
        comments = self.service.get_comments_by_sentence(sentence_id)
        
        result = []
        for c in comments:
            count = self.service.count_likes(c.id)
            response_data = CommentResponse.model_validate(c).model_dump()
            response_data["like_count"] = count
            result.append(CommentResponse(**response_data))
            
        return result

    def create_subcomment(self, comment_id: int, subcomment: SubCommentCreate, user_id: int) -> SubCommentResponse:
        """Create a subcomment for an existing parent comment."""
        subcomment_data = {
            "content": subcomment.content,
            "user_id": user_id,
            "comment_id": comment_id,
        }

        created = self.service.create_subcomment(subcomment_data)
        return SubCommentResponse.model_validate(created)

    def get_subcomments_by_comment(self, comment_id: int) -> list[SubCommentResponse]:
        """Get all subcomments for a parent comment in creation order."""
        subcomments = self.service.get_subcomments_by_comment(comment_id)
        return [SubCommentResponse.model_validate(sc) for sc in subcomments]

    def toggle_comment_like(self, comment_id: int, user_id: int) -> dict:
        """Toggle a like for a comment and return the updated state."""
        liked = self.service.toggle_like(comment_id, user_id)
        return {"liked": liked}

def get_comment_repository(db: Session = Depends(get_db)) -> CommentRepository:
    """Provide a repository wired with the active DB session."""
    return PostgresqlCommentRepository(db)

def get_alarm_repository(db: Session = Depends(get_db)) -> AlarmRepository:
    """Provide an alarm repository wired with the active DB session."""
    return PostgresqlAlarmRepository(db)

def get_alarm_service(
    repository: AlarmRepository = Depends(get_alarm_repository),
) -> AlarmService:
    """Provide an AlarmService using the repository abstraction."""
    return AlarmService(repository)

def get_comment_service(
    repository: CommentRepository = Depends(get_comment_repository),
    alarm_service: AlarmService = Depends(get_alarm_service),
) -> CommentService:
    """Provide a CommentService with alarm notification support."""
    return CommentService(repository, alarm_service)

def get_comment_controller(
    service: CommentService = Depends(get_comment_service),
) -> CommentController:
    """Provide a CommentController wired with dependencies."""
    return CommentController(service)

@router.post("/{sentence_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    sentence_id: int,
    comment: CommentCreate,
    controller: CommentController = Depends(get_comment_controller),
    user_id: int = Depends(get_current_user),
):
    """REST endpoint to create a comment for a sentence."""
    return controller.create_comment(sentence_id, comment, user_id)

@router.get("/{sentence_id}/comments", response_model=list[CommentResponse], status_code=status.HTTP_200_OK)
def get_comments_by_sentence(
    sentence_id: int,
    controller: CommentController = Depends(get_comment_controller),
):
    """REST endpoint to fetch comments for a sentence."""
    return controller.get_comments_by_sentence(sentence_id)

@subcomment_router.post("/{comment_id}/subcomments", response_model=SubCommentResponse, status_code=status.HTTP_201_CREATED, summary="Create a subcomment", description="부모 댓글에 대한 대댓글을 생성합니다. comment_id가 유효하지 않을 경우 404를 반환합니다.")
def create_subcomment(
    comment_id: int,
    subcomment: SubCommentCreate,
    controller: CommentController = Depends(get_comment_controller),
    user_id: int = Depends(get_current_user),
):
    """REST endpoint to create a subcomment for a given comment."""
    return controller.create_subcomment(comment_id, subcomment, user_id)

@subcomment_router.get("/{comment_id}/subcomments", response_model=list[SubCommentResponse], status_code=status.HTTP_200_OK, summary="List subcomments", description="특정 댓글의 대댓글 목록을 등록순(id 오름차순)으로 조회합니다.")
def get_subcomments_by_comment(
    comment_id: int,
    controller: CommentController = Depends(get_comment_controller),
):
    """REST endpoint to list subcomments for a given comment."""
    return controller.get_subcomments_by_comment(comment_id)

@subcomment_router.post("/{comment_id}/likes", status_code=status.HTTP_200_OK, summary="Toggle comment like", description="특정 댓글에 대해 좋아요를 토글합니다. 이미 좋아요를 누른 경우 취소하고 false를 반환합니다.")
def toggle_comment_like(
    comment_id: int,
    controller: CommentController = Depends(get_comment_controller),
):
    """REST endpoint to toggle like for a given comment (user_id=1 hardcoded)."""
    return controller.toggle_comment_like(comment_id, user_id=1)