from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.user import UserResponse

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = "pending"       # pending, in_progress, completed, blocked
    priority: str = "medium"      # low, medium, high, urgent
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    limit: int
    pages: int
