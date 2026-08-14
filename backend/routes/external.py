from fastapi import APIRouter, Depends
from backend.services.external import ExternalService
from backend.routes.auth import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/external", tags=["External Integrations"])

@router.get("/users")
async def get_external_users(
    current_user: User = Depends(get_current_user)
):
    external_service = ExternalService()
    users = await external_service.fetch_external_users()
    return users
