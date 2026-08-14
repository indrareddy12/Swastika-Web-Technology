from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.user import UserResponse

class CommentBase(BaseModel):
    comment: str = Field(..., min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    user: UserResponse

    model_config = ConfigDict(from_attributes=True)
