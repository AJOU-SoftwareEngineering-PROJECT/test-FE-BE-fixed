from pydantic import BaseModel, ConfigDict, Field


class ScrapCreate(BaseModel):
    sentence_id: int = Field(
        ...,
        description="스크랩할 문장의 ID",
        examples=[1]
    )


class ScrapResponse(BaseModel):
    id: int = Field(..., description="생성된 스크랩의 고유 ID 번호", examples=[1])
    sentence_id: int = Field(..., description="스크랩된 문장의 ID", examples=[1])
    sentence_content: str = Field(..., description="스크랩된 문장의 내용", examples=["이것은 스크랩된 문장입니다."])
    book_name: str = Field(..., description="스크랩된 문장이 속한 책의 제목", examples=["해리 포터와 마법사의 돌"])
    chapter: int = Field(..., description="스크랩된 문장이 속한 챕터 번호", examples=[1])

    model_config = ConfigDict(from_attributes=True)
