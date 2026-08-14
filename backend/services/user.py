from typing import Optional, Sequence
from fastapi import HTTPException, status
from backend.models.user import User
from backend.repositories.user import UserRepository
from backend.schemas.user import UserCreate
from backend.utils.auth import get_password_hash, verify_password

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.user_repo.get_by_email(email)

    async def list_users(self) -> Sequence[User]:
        return await self.user_repo.get_all()

    async def register_user(self, user_in: UserCreate) -> User:
        # Check if user already exists
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        
        # Hash password and create User
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hashed_password,
            role=user_in.role
        )
        return await self.user_repo.create(db_user)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
