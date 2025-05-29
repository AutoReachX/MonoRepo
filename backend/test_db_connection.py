#!/usr/bin/env python3
"""
Test database connection for AutoReach
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
print("Loading .env file...")
print(f"Current working directory: {os.getcwd()}")
print(f".env file exists: {os.path.exists('.env')}")

# Check what's in the .env file
with open('.env', 'r') as f:
    content = f.read()
    print("Contents of .env file:")
    for line in content.split('\n')[:5]:  # Show first 5 lines
        if 'DATABASE_URL' in line:
            print(f"  {line}")

# Force load from .env file, overriding any existing env vars
load_dotenv(override=True, verbose=True)
print("Environment variables loaded.")


def test_connection():
    """Test database connection"""
    try:
        print("Testing database connection...")

        # Get the database URL
        database_url = os.getenv("DATABASE_URL")
        print(f"Database URL: {database_url}")

        if not database_url or "username:password@hostname:port" in database_url:
            print("❌ Database URL not properly configured!")
            print("Please check your .env file and make sure DATABASE_URL is set correctly.")
            return False

        # Try to create engine and connect
        from sqlalchemy import create_engine, text

        engine = create_engine(database_url, pool_pre_ping=True)

        # Test connection
        with engine.connect() as connection:
            _ = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


if __name__ == "__main__":
    success = test_connection()
    if not success:
        sys.exit(1)
