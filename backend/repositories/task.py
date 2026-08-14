from typing import Optional, Sequence, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from backend.models.task import Task
from backend.models.user import User
from backend.repositories.base import BaseRepository

class TaskRepository(BaseRepository):
    async def get_by_id(self, task_id: int) -> Optional[Task]:
        result = await self.db.execute(
            select(Task)
            .filter(Task.id == task_id)
            .options(selectinload(Task.assignee))
        )
        return result.scalars().first()

    async def get_tasks(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 20
    ) -> Tuple[Sequence[Task], int]:
        # Start base queries
        query = select(Task).options(selectinload(Task.assignee))
        count_query = select(func.count(Task.id))

        # Filtering
        if status:
            query = query.filter(Task.status == status)
            count_query = count_query.filter(Task.status == status)

        if priority:
            query = query.filter(Task.priority == priority)
            count_query = count_query.filter(Task.priority == priority)

        if assigned_to is not None:
            query = query.filter(Task.assigned_to == assigned_to)
            count_query = count_query.filter(Task.assigned_to == assigned_to)

        if search:
            search_pat = f"%{search}%"
            filter_cond = or_(Task.title.ilike(search_pat), Task.description.ilike(search_pat))
            query = query.filter(filter_cond)
            count_query = count_query.filter(filter_cond)

        # Sorting
        sort_fields = {
            "created_at": Task.created_at,
            "updated_at": Task.updated_at,
            "due_date": Task.due_date,
            "priority": Task.priority,
            "status": Task.status,
            "title": Task.title
        }
        order_col = sort_fields.get(sort_by, Task.created_at)
        
        # SQL handles NULL values specially for due_date, we place them at the end or sort them
        if sort_by == "due_date" and sort_order == "asc":
            # For ascending due date, put nulls (no due date) at the end
            query = query.order_by(order_col.is_(None), order_col.asc())
        elif sort_order == "desc":
            query = query.order_by(order_col.desc())
        else:
            query = query.order_by(order_col.asc())

        # Get total count before pagination limits
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        # Execute
        result = await self.db.execute(query)
        tasks = result.scalars().all()

        return tasks, total

    async def create(self, task: Task) -> Task:
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        # Refresh with assignee loaded
        result = await self.db.execute(
            select(Task)
            .filter(Task.id == task.id)
            .options(selectinload(Task.assignee))
        )
        return result.scalars().first()

    async def update(self, task: Task) -> Task:
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        # Refresh with assignee loaded
        result = await self.db.execute(
            select(Task)
            .filter(Task.id == task.id)
            .options(selectinload(Task.assignee))
        )
        return result.scalars().first()

    async def delete(self, task: Task) -> None:
        await self.db.delete(task)
        await self.db.commit()

    async def get_dashboard_stats(self, user_id: Optional[int] = None) -> dict:
        """Returns statistics of tasks in the database."""
        # Queries for task stats
        # Total, Pending, In Progress, Completed, Overdue, Assigned to User
        total_q = select(func.count(Task.id))
        pending_q = select(func.count(Task.id)).filter(Task.status == "pending")
        in_progress_q = select(func.count(Task.id)).filter(Task.status == "in_progress")
        completed_q = select(func.count(Task.id)).filter(Task.status == "completed")
        blocked_q = select(func.count(Task.id)).filter(Task.status == "blocked")
        
        # Overdue tasks are not completed/blocked and due_date < current time
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        overdue_q = select(func.count(Task.id)).filter(
            Task.status.in_(["pending", "in_progress"]),
            Task.due_date < now
        )

        user_tasks_q = select(func.count(Task.id))
        if user_id is not None:
            user_tasks_q = user_tasks_q.filter(Task.assigned_to == user_id)
        else:
            user_tasks_q = select(func.count(Task.id)).filter(1 == 0) # Returns 0

        # Execute all asynchronously
        total = (await self.db.execute(total_q)).scalar() or 0
        pending = (await self.db.execute(pending_q)).scalar() or 0
        in_progress = (await self.db.execute(in_progress_q)).scalar() or 0
        completed = (await self.db.execute(completed_q)).scalar() or 0
        blocked = (await self.db.execute(blocked_q)).scalar() or 0
        overdue = (await self.db.execute(overdue_q)).scalar() or 0
        user_tasks = (await self.db.execute(user_tasks_q)).scalar() or 0

        return {
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "overdue_tasks": overdue,
            "user_tasks": user_tasks
        }
