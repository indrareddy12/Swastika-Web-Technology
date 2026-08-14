from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.comment import CommentRepository
from backend.repositories.task import TaskRepository
from backend.services.comment import CommentService
from backend.schemas.comment import CommentCreate, CommentResponse
from backend.routes.auth import get_current_user
from backend.models.user import User

router = APIRouter(tags=["Comments"])

@router.get("/tasks/{task_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment_repo = CommentRepository(db)
    task_repo = TaskRepository(db)
    comment_service = CommentService(comment_repo, task_repo)
    return await comment_service.get_comments_for_task(task_id)

@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    task_id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment_repo = CommentRepository(db)
    task_repo = TaskRepository(db)
    comment_service = CommentService(comment_repo, task_repo)
    return await comment_service.add_comment(task_id, current_user.id, comment_in)

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment_repo = CommentRepository(db)
    task_repo = TaskRepository(db)
    comment_service = CommentService(comment_repo, task_repo)
    await comment_service.delete_comment(comment_id, current_user.id, current_user.role)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
