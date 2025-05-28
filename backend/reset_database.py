#!/usr/bin/env python3
"""
Reset Database Script
Drops all tables and recreates them with the current schema
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine, Base

def reset_database():
    """Drop all tables and recreate them"""
    print("🗄️ Resetting AutoReach database...")

    try:
        # Drop all tables
        print("📤 Dropping existing tables...")
        with engine.begin() as conn:
            # Drop tables in reverse order to handle foreign keys
            conn.execute(text("DROP TABLE IF EXISTS content_history CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS scheduled_posts CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS analytics CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS tweets CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            print("✅ Existing tables dropped")

        # Create all tables with new schema
        print("📥 Creating tables with new schema...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")

        print("\n🎉 Database reset complete!")
        print("📋 New User table schema includes:")
        print("   - username (for traditional auth)")
        print("   - email (for traditional auth)")
        print("   - hashed_password (for traditional auth)")
        print("   - full_name (optional)")
        print("   - twitter_user_id (for OAuth)")
        print("   - twitter_username (for OAuth)")
        print("   - twitter_access_token (for OAuth)")
        print("   - twitter_refresh_token (for OAuth)")
        print("   - token_expiry (for OAuth)")
        print("   - language_pref")
        print("   - is_active")
        print("   - created_at")
        print("   - updated_at")

    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
