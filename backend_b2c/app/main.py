from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import init_db
from .services.news.scheduler import start_scheduler, shutdown_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Initialize database tables (for dev, use Alembic in prod)
    init_db()
    # Startup: Start bg schedulers
    start_scheduler()
    yield
    # Shutdown: Cleanup resources
    shutdown_scheduler()


from .api import auth, payments, support, announcements, leaderboard, articles
from .api.admin import users as admin_users, transactions as admin_transactions, tickets as admin_tickets, analytics as admin_analytics, announcements as admin_announcements, articles as admin_articles

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="PC Lagbe? Consumer Portal API",
    lifespan=lifespan,
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Includes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(support.router, prefix="/support", tags=["Support"])
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])

# Admin Includes
app.include_router(admin_users.router, prefix="/admin/users", tags=["Admin Users"])
app.include_router(admin_transactions.router, prefix="/admin/transactions", tags=["Admin Transactions"])
app.include_router(admin_tickets.router, prefix="/admin/tickets", tags=["Admin Tickets"])
app.include_router(admin_analytics.router, prefix="/admin/analytics", tags=["Admin Analytics"])
app.include_router(admin_announcements.router, prefix="/admin/announcements", tags=["Admin Announcements"])
app.include_router(admin_articles.router, prefix="/admin/articles", tags=["Admin Articles"])


@app.get("/")
async def root():
    return {"message": "Welcome to PC Lagbe B2C API", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "zenfa-b2c-api"}
