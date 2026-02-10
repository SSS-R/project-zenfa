from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://zenfa_user:zenfa_password@localhost:5432/zenfa_db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API
    api_title: str = "Zenfa API"
    api_version: str = "1.0.0"
    debug: bool = True

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
