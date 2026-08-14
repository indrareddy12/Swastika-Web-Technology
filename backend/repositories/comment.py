from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.models.comment import Comment
from backend.repositories.base import BaseRepository

class CommentRepository(BaseRepository):
    async def get_by_id(self, comment_id: int) -> Optional[Comment]:
        result = await self.db.execute(
            select(Comment)
            .filter(Comment.id == comment_id)
            .options(selectinload(Comment.user))
        )
        return result.scalars().first()

    async def get_comments_by_task(self, task_id: int) -> Sequence[Comment]:
        result = await self.db.execute(
            select(Comment)
            .filter(Comment.task_id == task_id)
            .options(selectinload(Comment.user))
            .order_by(Comment.created_at.asc())
        )
        return result.scalars().all()

    async def create(self, comment: Comment) -> Comment:
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        # Refresh with user details loaded
        result = await self.db.execute(
            select(Comment)
            .filter(Comment.id == comment.id)
            .options(selectinload(Comment.user))
        )
        return result.scalars().first()

    async def delete(self, comment: Comment) -> None:
        await self.db.delete(comment)
        await self.db.commit()
