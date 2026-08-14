from typing import Sequence
from fastapi import HTTPException, status
from backend.models.comment import Comment
from backend.repositories.comment import CommentRepository
from backend.repositories.task import TaskRepository
from backend.schemas.comment import CommentCreate

class CommentService:
    def __init__(
        self,
        comment_repo: CommentRepository,
        task_repo: TaskRepository
    ):
        self.comment_repo = comment_repo
        self.task_repo = task_repo

    async def get_comments_for_task(self, task_id: int) -> Sequence[Comment]:
        # Verify task exists
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found."
            )
        return await self.comment_repo.get_comments_by_task(task_id)

    async def add_comment(self, task_id: int, user_id: int, comment_in: CommentCreate) -> Comment:
        # Verify task exists
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found."
            )

        db_comment = Comment(
            task_id=task_id,
            user_id=user_id,
            comment=comment_in.comment
        )
        return await self.comment_repo.create(db_comment)

    async def delete_comment(self, comment_id: int, user_id: int, user_role: str) -> None:
        db_comment = await self.comment_repo.get_by_id(comment_id)
        if not db_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Comment with ID {comment_id} not found."
            )
        
        # Only comment author or admins can delete comments
        if db_comment.user_id != user_id and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this comment."
            )
            
        await self.comment_repo.delete(db_comment)
