#!/usr/bin/env python3
"""
Database initialization script for AutoReach
Creates all tables defined in the models
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv(override=True)

# Add the current directory to Python path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import user, tweet, scheduled_post, content_log

def create_tables():
    """Create all database tables"""
    try:
        print("Creating database tables...")

        # Import all models to ensure they're registered with Base
        from app.models.user import User
        from app.models.tweet import Tweet
        from app.models.scheduled_post import ScheduledPost
        from app.models.content_log import ContentLog

        # Create all tables
        Base.metadata.create_all(bind=engine)

        print("✅ Database tables created successfully!")
        print("Tables created:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")

    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_tables()
