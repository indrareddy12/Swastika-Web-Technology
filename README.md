# WebVory Task & Management Portal

A premium, production-grade internal task-tracking and management dashboard. Built as a full-stack SPA, it features a modern React client (powered by Vite and Tailwind CSS) communicating with a robust Python REST API (FastAPI, SQLAlchemy, and SQLite).

---

## Key Features

1. **Analytical Dashboard**: Grid of glowing KPI cards detailing total scope, pending tasks, active progress, completed items, blocked tickets, and assignments specific to the logged-in user. Includes a live preview feed of recent activities.
2. **Dynamic Task Board**: Full CRUD actions for task management. Supports toggling between an interactive Grid View (Kanban style) and a structured Table View.
3. **Server-Side Operations**: Search keywords, status filters, priority filters, assignee filters, column-sorting, and paginated pagination math are executed directly in the SQLite database to avoid heavy client-side loading.
4. **Discussion Threads**: Interactive comment logs under task detail views with author and admin-restricted deletion rules.
5. **Secure Authentication**: User sign-up and login utilizing native bcrypt password hashing and stateful JWT (JSON Web Token) authorization.
6. **External API Proxy Gateway**: Seamless integration fetching partner data from a public API (`JSONPlaceholder`) using HTTPX. Features a 5-second gateway timeout limit and a 60-second in-memory server cache to prevent rate-limit blocks.
7. **Premium Aesthetics**: Dark mode toggle (class-based, stored in local storage), glassmorphic design panels, custom scrollbars, glowing ring indicators, and smooth micro-animations.

---

## Technology Stack

### Backend
- **Python 3.14+**
- **FastAPI**: REST API Router and OpenAPI swagger spec.
- **SQLAlchemy (Async)**: Object Relational Mapper for async connections.
- **aiosqlite**: Asynchronous driver for SQLite database files.
- **Pydantic v2**: Payload serialization and structure validation schemas.
- **Bcrypt & Python-Jose**: Hashing algorithms and JWT processing.
- **HTTPX**: Non-blocking client for external partner integrations.
- **Pytest**: Automatic endpoint test suite.

### Frontend
- **React 18 & Vite**: Client scaffolding and dev server.
- **Tailwind CSS v3**: Utility CSS engine with custom design system parameters.
- **Axios**: Promised-based network client.
- **Lucide React**: Vector icon framework.

---

## Directory Structure

```text
Swastika-Web-Tech/
├── backend/
│   ├── models/          # SQLAlchemy database models
│   ├── schemas/         # Pydantic validation schemas
│   ├── repositories/    # Async CRUD repository layers
│   ├── services/        # Business logic & External integrations
│   ├── routes/          # REST Endpoint controllers & Auth guards
│   ├── utils/           # Bcrypt & JWT security utilities
│   ├── tests/           # Integration tests
│   ├── config.py        # Environment variables & constants
│   ├── database.py      # Async DB session factory
│   └── main.py          # FastAPI startup and lifespans
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI component library & modals
│   │   ├── pages/       # Portal dashboard, lists, details views
│   │   ├── index.css    # Custom variables, glassmorphic layout definitions
│   │   └── App.jsx      # Portal routing and global state
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── README.md
└── database.db (Generated on boot)
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
1. Open terminal and navigate to the project root:
   ```powershell
   cd c:\Users\indra\Desktop\Swastika-Web-Tech
   ```
2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows PowerShell:
     ```powershell
     Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
     .\venv\Scripts\Activate.ps1
     ```
   - On Windows CMD:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
4. Install all backend dependencies:
   ```powershell
   python -m pip install fastapi uvicorn sqlalchemy pydantic aiosqlite python-jose[cryptography] passlib[bcrypt] python-multipart httpx pytest pytest-asyncio bcrypt
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` folder:
   ```powershell
   cd c:\Users\indra\Desktop\Swastika-Web-Tech\frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```

---

## Running the Applications

### 1. Start Backend Server
Navigate to the root directory, activate the python virtual environment, and run `uvicorn`:
```powershell
uvicorn backend.main:app --reload --port 8000
```
- The API will boot at `http://127.0.0.1:8000`.
- Access the interactive documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.
- *Note:* On first boot, the backend automatically creates `database.db` and seeds sandbox accounts and mock tasks.

### 2. Start Frontend Server
Navigate to the `frontend` folder and run the Vite dev server:
```powershell
npm run dev
```
- The React application will start at `http://localhost:3000`.
- Requests to `/api` are automatically proxied to the backend at port 8000 (configured in `vite.config.js`).

---

## Sandbox Login Accounts

To help evaluate the portal immediately, the database is auto-seeded with the following credentials:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@webvory.com` | `admin123` | Admin User |
| **Member** | `member@webvory.com` | `member123` | Standard Member A |
| **Member** | `pallav@webvory.com` | `member123` | Standard Member B |

---

## REST API Specification

### Authentication
- `POST /api/auth/register` - Create user.
- `POST /api/auth/login` - Returns JWT Token and user metadata.
- `GET  /api/auth/me` - Retrieve current logged-in user profile (Requires Authorization Bearer Token header).

### Task Deliverables
- `GET    /api/tasks` - Retrieve tasks. Supports paginated queries, search, and filters.
  - Query fields: `?status=in_progress&priority=high&assignee=1&search=design&page=1&limit=10&sort_by=due_date&sort_order=asc`
- `GET    /api/tasks/{id}` - Fetch single task.
- `POST   /api/tasks` - Create task.
- `PUT    /api/tasks/{id}` - Edit task details (supports partial fields).
- `DELETE /api/tasks/{id}` - Remove task.

### Users List
- `GET  /api/users` - Fetch list of active system users (for assignments).
- `POST /api/users` - Create user (Admin permissions required).

### Dashboard Metrics
- `GET  /api/dashboard` - Get KPI statistics total counts (total, pending, progress, completed, overdue, user assignments).

### External Integrations
- `GET  /api/external/users` - Proxy calling external partner directory. Implements caching and timeout checks.

---

## Assumptions & Design Choices
1. **SQLite Database**: SQLite was chosen as the local database as it resides in a single file (`database.db`), removing PostgreSQL installation dependencies on evaluator environments.
2. **Server-Side Filtering**: In alignment with standard production practices, filters (like search queries and paginations) execute directly in SQL queries (`offset` and `limit`) instead of loading all database records into client state.
3. **Self-Contained Routing**: In-memory tab-state routing was utilized in the frontend instead of React Router to ensure ease of use, instant state synchronization (auth headers), and zero router config requirements for local previewing.
4. **Native Bcrypt Hashing**: Standard password hashing is handled using the native python `bcrypt` package directly in the backend config utility to bypass passlib compatibility errors on newer Python installations.
