from typing import Optional, Tuple, Sequence
from fastapi import HTTPException, status
from backend.models.task import Task
from backend.repositories.task import TaskRepository
from backend.repositories.user import UserRepository
from backend.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    def __init__(self, task_repo: TaskRepository, user_repo: UserRepository):
        self.task_repo = task_repo
        self.user_repo = user_repo

    async def get_task_by_id(self, task_id: int) -> Task:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found."
            )
        return task

    async def list_tasks(
        self,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        assignee_filter: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 20
    ) -> Tuple[Sequence[Task], int]:
        # Validate status choice if provided
        valid_statuses = {"pending", "in_progress", "completed", "blocked"}
        if status_filter and status_filter.lower() not in valid_statuses:
            status_filter = None  # Reset invalid filter
            
        # Validate priority choice if provided
        valid_priorities = {"low", "medium", "high", "urgent"}
        if priority_filter and priority_filter.lower() not in valid_priorities:
            priority_filter = None  # Reset invalid filter

        return await self.task_repo.get_tasks(
            status=status_filter.lower() if status_filter else None,
            priority=priority_filter.lower() if priority_filter else None,
            assigned_to=assignee_filter,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            limit=limit
        )

    async def create_task(self, task_in: TaskCreate) -> Task:
        # Validate assignment user
        if task_in.assigned_to is not None:
            user = await self.user_repo.get_by_id(task_in.assigned_to)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Assigned user with ID {task_in.assigned_to} does not exist."
                )

        # Normalize status & priority
        task_in.status = task_in.status.lower() if task_in.status else "pending"
        task_in.priority = task_in.priority.lower() if task_in.priority else "medium"

        db_task = Task(
            title=task_in.title,
            description=task_in.description,
            status=task_in.status,
            priority=task_in.priority,
            due_date=task_in.due_date,
            assigned_to=task_in.assigned_to
        )
        return await self.task_repo.create(db_task)

    async def update_task(self, task_id: int, task_in: TaskUpdate) -> Task:
        db_task = await self.get_task_by_id(task_id)

        # Update and validate assignee
        if task_in.assigned_to is not None:
            user = await self.user_repo.get_by_id(task_in.assigned_to)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Assigned user with ID {task_in.assigned_to} does not exist."
                )
            db_task.assigned_to = task_in.assigned_to
        elif "assigned_to" in task_in.model_fields_set and task_in.assigned_to is None:
            # Explicitly unassigning task
            db_task.assigned_to = None

        # Update remaining optional fields
        if task_in.title is not None:
            db_task.title = task_in.title
        if task_in.description is not None:
            db_task.description = task_in.description
        if task_in.status is not None:
            db_task.status = task_in.status.lower()
        if task_in.priority is not None:
            db_task.priority = task_in.priority.lower()
        if "due_date" in task_in.model_fields_set:
            db_task.due_date = task_in.due_date

        return await self.task_repo.update(db_task)

    async def delete_task(self, task_id: int) -> None:
        db_task = await self.get_task_by_id(task_id)
        await self.task_repo.delete(db_task)

    async def get_dashboard_stats(self, user_id: Optional[int] = None) -> dict:
        return await self.task_repo.get_dashboard_stats(user_id)
