import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from backend.config import settings
from backend.database import Base, engine, AsyncSessionLocal
from backend.models.user import User
from backend.models.task import Task
from backend.utils.auth import get_password_hash
from backend.routes import (
    auth_router,
    user_router,
    task_router,
    comment_router,
    dashboard_router,
    external_router
)

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Check if users already exist
        res = await db.execute(select(User))
        if res.scalars().first() is not None:
            return  # Already seeded
        
        # Seed users
        admin = User(
            name="Admin User",
            email="admin@webvory.com",
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        member1 = User(
            name="Standard Member A",
            email="member@webvory.com",
            password_hash=get_password_hash("member123"),
            role="member"
        )
        member2 = User(
            name="Standard Member B",
            email="pallav@webvory.com",
            password_hash=get_password_hash("member123"),
            role="member"
        )
        db.add_all([admin, member1, member2])
        await db.commit()
        
        # Refresh to get IDs
        await db.refresh(admin)
        await db.refresh(member1)
        await db.refresh(member2)

        # Seed tasks
        now = datetime.datetime.now(datetime.timezone.utc)
        
        t1 = Task(
            title="Setup internal dashboard layout",
            description="Create reusable UI components (Buttons, Select, Badges, Table) with Tailwind CSS.",
            status="in_progress",
            priority="high",
            assigned_to=member1.id,
            due_date=now + datetime.timedelta(days=3)
        )
        t2 = Task(
            title="Integrate external user partner API",
            description="Fetch external team members using HTTPX with custom rate limits and cache handlers.",
            status="pending",
            priority="medium",
            assigned_to=member2.id,
            due_date=now + datetime.timedelta(days=5)
        )
        t3 = Task(
            title="Configure relational database migrations",
            description="Define schema mappings for users, tasks, and comments using SQLAlchemy and SQLite.",
            status="completed",
            priority="low",
            assigned_to=admin.id,
            due_date=now - datetime.timedelta(days=2)  # Overdue if not completed, but status is completed so it's fine!
        )
        t4 = Task(
            title="Fix CORS preflight issues on production",
            description="Resolve preflight requests block for cross-origin local hosts.",
            status="blocked",
            priority="urgent",
            assigned_to=member1.id,
            due_date=now + datetime.timedelta(days=1)
        )
        t5 = Task(
            title="Review UI mockup design drafts",
            description="Review and optimize user management dashboard designs.",
            status="pending",
            priority="low",
            assigned_to=member1.id,
            due_date=now - datetime.timedelta(days=1)  # Overdue task (pending and due_date in past!)
        )
        
        db.add_all([t1, t2, t3, t4, t5])
        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed data
    await seed_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(task_router, prefix=settings.API_V1_STR)
app.include_router(comment_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(external_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Internal Task & Management API. Swagger docs are at /docs"}
