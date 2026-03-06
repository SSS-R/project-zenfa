from sqlmodel import SQLModel, create_engine, Session
from .config import get_settings

settings = get_settings()

# Create database engine
engine = create_engine(
    settings.database_url,
    pool_size=20,            # persistent connections
    max_overflow=30,         # burst capacity  
    pool_timeout=30,         # wait for a connection
    pool_recycle=1800,       # recycle stale connections
    pool_pre_ping=True,      # verify connections before use
    echo=settings.debug,     # Log SQL queries in debug mode
)


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency for getting database session."""
    with Session(engine) as session:
        yield session
