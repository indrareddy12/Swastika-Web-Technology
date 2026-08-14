from typing import Optional, Sequence
from sqlalchemy import select
from backend.models.user import User
from backend.repositories.base import BaseRepository

class UserRepository(BaseRepository):
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_all(self) -> Sequence[User]:
        result = await self.db.execute(select(User).order_by(User.name))
        return result.scalars().all()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
