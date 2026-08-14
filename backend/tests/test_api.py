import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
import asyncio

from backend.main import app
from backend.database import Base, get_db

# Test Database setup
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_database.db"

test_engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    # Setup tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup database files
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    
    # Safely remove db files if they remain
    for filename in ["./test_database.db"]:
        if os.path.exists(filename):
            try:
                os.remove(filename)
            except Exception:
                pass

async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Apply dependency override
app.dependency_overrides[get_db] = override_get_db

@pytest.mark.asyncio
async def test_auth_and_tasks():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register Admin User
        response = await ac.post("/api/auth/register", json={
            "name": "Test Admin",
            "email": "testadmin@example.com",
            "password": "password123",
            "role": "admin"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "testadmin@example.com"
        assert data["role"] == "admin"

        # 2. Login
        response = await ac.post("/api/auth/login", json={
            "email": "testadmin@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        token_data = response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Check me
        response = await ac.get("/api/auth/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["name"] == "Test Admin"

        # 4. Create user member via admin
        response = await ac.post("/api/users", headers=headers, json={
            "name": "Test Member",
            "email": "testmember@example.com",
            "password": "password123",
            "role": "member"
        })
        assert response.status_code == 201
        member_id = response.json()["id"]

        # 5. Create Task
        response = await ac.post("/api/tasks", headers=headers, json={
            "title": "Build Test Dashboard",
            "description": "Integration testing on FastAPI endpoint",
            "status": "pending",
            "priority": "high",
            "assigned_to": member_id
        })
        assert response.status_code == 201
        task_id = response.json()["id"]
        assert response.json()["title"] == "Build Test Dashboard"

        # 6. Get Tasks (with pagination & status filter)
        response = await ac.get("/api/tasks?status=pending&limit=10", headers=headers)
        assert response.status_code == 200
        list_data = response.json()
        assert list_data["total"] == 1
        assert len(list_data["tasks"]) == 1
        assert list_data["tasks"][0]["id"] == task_id

        # 7. Update Task Status
        response = await ac.put(f"/api/tasks/{task_id}", headers=headers, json={
            "status": "in_progress"
        })
        assert response.status_code == 200
        assert response.json()["status"] == "in_progress"

        # 8. Get Dashboard stats
        response = await ac.get("/api/dashboard", headers=headers)
        assert response.status_code == 200
        stats = response.json()
        assert stats["total_tasks"] == 1
        assert stats["in_progress_tasks"] == 1

        # 9. Post Comment
        response = await ac.post(f"/api/tasks/{task_id}/comments", headers=headers, json={
            "comment": "Completed the database design phase"
        })
        assert response.status_code == 201
        assert response.json()["comment"] == "Completed the database design phase"

        # 10. List Comments
        response = await ac.get(f"/api/tasks/{task_id}/comments", headers=headers)
        assert response.status_code == 200
        comments = response.json()
        assert len(comments) == 1
        assert comments[0]["comment"] == "Completed the database design phase"
