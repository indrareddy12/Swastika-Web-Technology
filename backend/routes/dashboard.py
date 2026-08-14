from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.task import TaskRepository
from backend.repositories.user import UserRepository
from backend.services.task import TaskService
from backend.routes.auth import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_repo = TaskRepository(db)
    user_repo = UserRepository(db)
    task_service = TaskService(task_repo, user_repo)
    
    stats = await task_service.get_dashboard_stats(user_id=current_user.id)
    return stats
