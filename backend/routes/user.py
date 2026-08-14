from typing import Sequence
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.user import UserRepository
from backend.services.user import UserService
from backend.schemas.user import UserCreate, UserResponse
from backend.routes.auth import get_current_user, require_admin
from backend.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    return await user_service.list_users()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    return await user_service.register_user(user_in)
