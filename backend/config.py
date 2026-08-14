import os

class Settings:
    PROJECT_NAME: str = "Internal Task & Management Dashboard"
    API_V1_STR: str = "/api"
    
    # SQLite Async URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./database.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-antigravity-dashboard-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # External API Integration
    EXTERNAL_API_URL: str = "https://jsonplaceholder.typicode.com/users"
    EXTERNAL_API_TIMEOUT: float = 5.0
    
    # CORS Origins (Allow all for development dashboard)
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
