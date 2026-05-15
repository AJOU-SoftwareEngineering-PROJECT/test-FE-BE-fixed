import re
from db.model import Sentence, AlarmType
from post.repository import BookRepository, SentenceRepository
from post.schemas import (
    AddSentenceRequest,
    BookCreate,
    BookResponse,
    DeleteSentenceRequest,
    ModifySentenceRequest,
    PostChapterCreate,
)
from alarm.service import AlarmService


class PostService:
    def __init__(
        self,
        sentence_repository: SentenceRepository,
        book_repository: BookRepository,
        alarm_service: AlarmService = None,
    ):
        self.sentence_repository = sentence_repository
        self.book_repository = book_repository
        self.alarm_service = alarm_service
    
    def post_sentences(self, dto: PostChapterCreate) -> list[Sentence]:
        
        sentences = dto.content
        bookId = dto.bookId
        chapter = dto.chapter
        saved_sentences = []

        # 빈 문자열 제거
        split_sentences = [
            s.strip()
            for s in re.split(r"[.?]", sentences)
            if s.strip()
        ]

        for sentence in split_sentences:
            saved = self.sentence_repository.create({
                "chapter": chapter,
                "content": sentence,
                "book_id": bookId,
            })
            saved_sentences.append(saved)

        # 마지막 문장은 다음 문장이 없으므로 len - 1까지만
        for i in range(len(saved_sentences) - 1):
            saved_sentences[i].after_id = saved_sentences[i + 1].id
            self.sentence_repository.update(saved_sentences[i])

        if self.alarm_service:
            liked_user_ids = self.book_repository.get_users_who_like_book(bookId)
            if liked_user_ids:
                self.alarm_service.create_alarms_bulk(
                    liked_user_ids,
                    AlarmType.NEW_CHAPTER,
                    content="새 챕터가 공개되었습니다.",
                    target_url=f"/books/{bookId}/chapters/{chapter}",
                )

        return saved_sentences
            
    def modify_sentence(self, dto: ModifySentenceRequest) -> Sentence:
        sentence = self.sentence_repository.find(dto.sentenceId)
        sentence.content = dto.content
        return self.sentence_repository.update(sentence)

    def search_books(self, query: str) -> list[BookResponse]:
        books = self.book_repository.search_books(query)
        return [BookResponse(**book) for book in books]

    def get_ranked_books(self) -> list[BookResponse]:
        books = self.book_repository.get_ranked_books()
        return [BookResponse(**book) for book in books]

    def create_book(self, dto: BookCreate) -> BookResponse:
        book = self.book_repository.create(dto.model_dump())
        author_name = self.book_repository.get_author_name(book.author_id)

        return BookResponse(
            id=book.id,
            name=book.name,
            author_name=author_name,
            like_count=0,
        )

    def list_books(self) -> list[BookResponse]:
        books = self.book_repository.find_all()
        return [BookResponse(**book) for book in books]

    def delete_book(self, book_id: int):
        book = self.book_repository.find(book_id)
        if book is None:
            raise ValueError("Book not found")

        self.book_repository.delete(book)

    def add_sentence(self, dto: AddSentenceRequest) -> Sentence:
        book = self.book_repository.find(dto.bookId)
        if book is None:
            raise ValueError("Book not found")

        before = self.sentence_repository.find(dto.beforeId)
        if before is None:
            raise ValueError("Before sentence not found")

        sentence = {
            "book_id": book.id,
            "chapter": before.chapter,
            "content": dto.content,
            "after_id": dto.afterId,
        }
        saved_sentence = self.sentence_repository.create(sentence)

        before.after_id = saved_sentence.id
        self.sentence_repository.update(before)

        return saved_sentence
    
    def delete_sentence(self, dto: DeleteSentenceRequest):
        before = self.sentence_repository.find(dto.beforeId)
        sentence = self.sentence_repository.find(dto.sentenceId)
        before.after_id = sentence.after_id

        self.sentence_repository.update(before)
        self.sentence_repository.delete(sentence)

