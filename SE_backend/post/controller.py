from fastapi import APIRouter, Depends, status
from db.database import get_db
from db.model import Sentence
from sqlalchemy.orm import Session

from post.repository import (
    BookRepository,
    PostgresqlBookRepository,
    PostgresqlSentenceRepository,
    SentenceRepository,
)
from alarm.repository import AlarmRepository, PostgresqlAlarmRepository
from alarm.service import AlarmService
from post.schemas import (
    AddSentenceRequest,
    AddSentenceResponse,
    BookCreate,
    BookResponse,
    DeleteSentenceRequest,
    DeleteSentenceResponse,
    ModifySentenceResponse,
    ModifySentenceRequest,
    PostChapterCreate,
    PostChapterResponse,
)
from post.service import PostService

router = APIRouter(prefix="/books", tags=["books"])

class PostController:
    def __init__(self, service: PostService):
        self.service = service

    def post(self, dto: PostChapterCreate):
        created: list[Sentence] = self.service.post_sentences(dto)
        result = list(map(lambda i : PostChapterResponse(i.id), created))
        return result
    
    def modify(self, dto: ModifySentenceRequest):
        return self.service.modify_sentence(dto)
    
    def add(self, dto: AddSentenceRequest):
        return self.service.add_sentence(dto)
    
    def delete_sentence(self, dto: DeleteSentenceRequest):
        self.service.delete_sentence(dto)

    def search_books(self, query: str):
        return self.service.search_books(query)

    def get_ranked_books(self):
        return self.service.get_ranked_books()

    def create_book(self, dto: BookCreate):
        return self.service.create_book(dto)

    def list_books(self):
        return self.service.list_books()

    def delete_book(self, book_id: int):
        self.service.delete_book(book_id)

def get_sentence_repository(db: Session = Depends(get_db)) -> SentenceRepository:
    return PostgresqlSentenceRepository(db)


def get_book_repository(db: Session = Depends(get_db)) -> BookRepository:
    return PostgresqlBookRepository(db)


def get_alarm_repository(db: Session = Depends(get_db)) -> AlarmRepository:
    return PostgresqlAlarmRepository(db)


def get_alarm_service(
    repository: AlarmRepository = Depends(get_alarm_repository),
) -> AlarmService:
    return AlarmService(repository)


def get_post_service(
    sentence_repository: SentenceRepository = Depends(get_sentence_repository),
    book_repository: BookRepository = Depends(get_book_repository),
    alarm_service: AlarmService = Depends(get_alarm_service),
) -> PostService:
    return PostService(sentence_repository, book_repository, alarm_service)

def get_post_controller(
        service: PostService = Depends(get_post_service)
) -> PostController:
    return PostController(service)

@router.post("/chapter", response_model=list[PostChapterResponse], status_code=status.HTTP_201_CREATED)
def post_chapter(
    dto: PostChapterCreate, controller: PostController = Depends(get_post_controller)
) -> list[PostChapterResponse]:
    return controller.post(dto)

@router.patch("/chapter", response_model=ModifySentenceResponse, status_code=status.HTTP_200_OK)
def modify_sentence(
    dto: ModifySentenceRequest, controller: PostController = Depends(get_post_controller)
) -> ModifySentenceResponse:
    controller.modify(dto)
    return ModifySentenceResponse(result="성공적으로 문장이 수정되었습니다.")

@router.post("/sentence", response_class=AddSentenceResponse, status_code=status.HTTP_200_OK)
def post_sentence(
    dto: AddSentenceRequest, controller: PostController = Depends(get_post_controller)
) -> AddSentenceResponse:
    result = controller.add(dto)
    return AddSentenceResponse(id = result.id)

@router.delete("/sentence", response_model=DeleteSentenceResponse, status_code=status.HTTP_200_OK)
def delete_sentence(
    dto: DeleteSentenceRequest, controller: PostController = Depends(get_post_controller)
) -> DeleteSentenceResponse:
    controller.delete_sentence(dto)
    return DeleteSentenceResponse(result = "성공적으로 문장이 삭제되었습니다.")


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    dto: BookCreate, controller: PostController = Depends(get_post_controller)
) -> BookResponse:
    return controller.create_book(dto)


@router.get("", response_model=list[BookResponse], status_code=status.HTTP_200_OK)
def list_books(
    controller: PostController = Depends(get_post_controller),
) -> list[BookResponse]:
    return controller.list_books()


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int, controller: PostController = Depends(get_post_controller)
):
    controller.delete_book(book_id)


@router.get("/search", response_model=list[BookResponse], status_code=status.HTTP_200_OK)
def search_books(
    q: str,
    controller: PostController = Depends(get_post_controller),
) -> list[BookResponse]:
    return controller.search_books(q)


@router.get("/rank", response_model=list[BookResponse], status_code=status.HTTP_200_OK)
def get_ranked_books(
    controller: PostController = Depends(get_post_controller),
) -> list[BookResponse]:
    return controller.get_ranked_books()
