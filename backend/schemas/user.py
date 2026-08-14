from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str = "member"  # admin, member

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
