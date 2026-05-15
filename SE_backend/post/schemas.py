
from pydantic import BaseModel, ConfigDict

class PostChapterCreate(BaseModel):
    userId: int
    content: str
    bookId: int
    chapter: int

class PostChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idList: list[int]

class ModifySentenceRequest(BaseModel):
    sentenceId: int
    content: str

class ModifySentenceResponse(BaseModel):
    result: str

class AddSentenceRequest(BaseModel):
    beforeId: int
    afterId: int
    bookId: int
    content: str

class AddSentenceResponse(BaseModel):
    id: int

class DeleteSentenceRequest(BaseModel):
    sentenceId: int
    beforeId: int

class DeleteSentenceResponse(BaseModel):
    result: str


class BookCreate(BaseModel):
    name: str
    intro: str
    author_id: int


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    author_name: str
    like_count: int = 0


class BookSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    author_name: str
    like_count: int = 0