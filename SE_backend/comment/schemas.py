from pydantic import BaseModel, ConfigDict, Field, field_validator

class CommentCreate(BaseModel):
    # ✨ 수정 1: 날아갔던 description과 examples 복구
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="등록할 댓글의 본문 내용입니다. (공백 제외 1~500자)",
        examples=["이 문장 정말 흥미진진하네요! 다음 전개가 기대됩니다."]
    )

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

class CommentResponse(BaseModel):
    # ✨ 수정 2: 모든 필드에 친절한 Swagger 설명 추가
    id: int = Field(..., description="생성된 댓글의 고유 ID 번호", examples=[1])
    content: str = Field(..., description="저장된 댓글 내용")
    user_id: int = Field(..., description="댓글을 작성한 유저의 ID")
    sentence_id: int = Field(..., description="댓글이 달린 문장의 ID")
    
    # ✨ 수정 3: 대망의 좋아요 개수(like_count) 필드 추가! (기본값 0)
    like_count: int = Field(default=0, description="해당 댓글의 좋아요 총 개수", examples=[5])

    model_config = ConfigDict(from_attributes=True)

class SubCommentCreate(BaseModel):
    # ✨ 수정 4: 대댓글에도 친절한 설명 추가
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="등록할 대댓글의 본문 내용입니다. (공백 제외 1~500자)",
        examples=["저도 그렇게 생각합니다! 완전 공감해요."]
    )

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

class SubCommentResponse(BaseModel):
    id: int = Field(..., description="생성된 대댓글의 고유 ID 번호", examples=[1])
    content: str = Field(..., description="저장된 대댓글 내용")
    user_id: int = Field(..., description="대댓글을 작성한 유저의 ID")
    comment_id: int = Field(..., description="대댓글이 달린 부모 댓글의 ID")

    model_config = ConfigDict(from_attributes=True)