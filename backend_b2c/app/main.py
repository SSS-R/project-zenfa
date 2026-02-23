from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Initialize database tables (for dev, use Alembic in prod)
    init_db()
    yield
    # Shutdown: Cleanup resources


from .api import auth, payments

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
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])


@app.get("/")
async def root():
    return {"message": "Welcome to PC Lagbe B2C API", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "zenfa-b2c-api"}
