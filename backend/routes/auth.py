from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.user import UserRepository
from backend.services.user import UserService
from backend.schemas.user import UserCreate, UserLogin, UserResponse, Token
from backend.utils.auth import create_access_token, verify_token
from backend.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or authorization credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorized user not found in the system."
        )
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions are required for this action."
        )
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    return await user_service.register_user(user_in)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    
    user = await user_service.authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
