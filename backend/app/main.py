"""
Zenfa API - PC Parts Aggregator for Bangladesh

A price comparison and AI-powered build recommendation API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Cleanup if needed


from .api.endpoints import components

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="PC Parts Aggregator & AI Build Recommender for Bangladesh",
    lifespan=lifespan,
)

# Includes
app.include_router(components.router, prefix="/components", tags=["Components"])

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Zenfa API",
        "version": settings.api_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "zenfa-api"}
