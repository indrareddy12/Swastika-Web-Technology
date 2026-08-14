import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.task import TaskRepository
from backend.repositories.user import UserRepository
from backend.services.task import TaskService
from backend.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from backend.routes.auth import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status (pending, in_progress, completed, blocked)"),
    priority: Optional[str] = Query(None, description="Filter by priority (low, medium, high, urgent)"),
    assignee: Optional[int] = Query(None, description="Filter by assigned user ID"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    sort_by: str = Query("created_at", description="Sort field (created_at, updated_at, due_date, status, priority, title)"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Records per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    
    tasks, total = await task_service.list_tasks(
        status_filter=status,
        priority_filter=priority,
        assignee_filter=assignee,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return {
        "tasks": tasks,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/{id}", response_model=TaskResponse)
async def get_task(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    return await task_service.get_task_by_id(id)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    return await task_service.create_task(task_in)

@router.put("/{id}", response_model=TaskResponse)
async def update_task(
    id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    return await task_service.update_task(id, task_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    await task_service.delete_task(id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
