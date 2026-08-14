from backend.routes.auth import router as auth_router, get_current_user, require_admin
from backend.routes.user import router as user_router
from backend.routes.task import router as task_router
from backend.routes.comment import router as comment_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.external import router as external_router

__all__ = [
    "auth_router",
    "user_router",
    "task_router",
    "comment_router",
    "dashboard_router",
    "external_router",
    "get_current_user",
    "require_admin"
]
