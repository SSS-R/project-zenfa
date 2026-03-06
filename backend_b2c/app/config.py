from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str
    
    # Redis
    redis_url: str
    
    # API
    api_title: str = "PC Lagbe B2C API"
    api_version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7 # 7 days
    
    # Engine Gateway
    engine_internal_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
