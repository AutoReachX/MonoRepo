from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Database configuration following KISS principle
class DatabaseConfig:
    """Centralized database configuration following Single Responsibility Principle"""

    @staticmethod
    def create_engine():
        """Create database engine with appropriate configuration"""
        if settings.DATABASE_URL.startswith("sqlite"):
            return create_engine(
                settings.DATABASE_URL,
                connect_args={"check_same_thread": False}
            )
        else:
            return create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
            )

# Create database engine
engine = DatabaseConfig.create_engine()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
