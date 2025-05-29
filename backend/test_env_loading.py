#!/usr/bin/env python3
"""
Test script to verify environment variables are loading correctly
"""

import os
import sys
from dotenv import load_dotenv

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_env_loading():
    print("🔍 Testing Environment Variable Loading")
    print("=" * 50)

    # Load environment variables
    load_dotenv(override=True)

    # Test Twitter OAuth 2.0 credentials
    print("\n📱 Twitter OAuth 2.0 Credentials:")
    print(f"TWITTER_CLIENT_ID: {'✅ Set' if os.getenv('TWITTER_CLIENT_ID') else '❌ Not set'}")
    print(f"TWITTER_CLIENT_SECRET: {'✅ Set' if os.getenv('TWITTER_CLIENT_SECRET') else '❌ Not set'}")
    print(f"TWITTER_BEARER_TOKEN: {'✅ Set' if os.getenv('TWITTER_BEARER_TOKEN') else '❌ Not set'}")
    print(f"TWITTER_OAUTH_REDIRECT_URI: {os.getenv('TWITTER_OAUTH_REDIRECT_URI', 'Not set')}")

    # Test Twitter API v1.1 credentials
    print("\n🐦 Twitter API v1.1 Credentials:")
    print(f"TWITTER_API_KEY: {'✅ Set' if os.getenv('TWITTER_API_KEY') else '❌ Not set'}")
    print(f"TWITTER_API_SECRET: {'✅ Set' if os.getenv('TWITTER_API_SECRET') else '❌ Not set'}")
    print(f"TWITTER_ACCESS_TOKEN: {'✅ Set' if os.getenv('TWITTER_ACCESS_TOKEN') else '❌ Not set'}")
    print(f"TWITTER_ACCESS_TOKEN_SECRET: {'✅ Set' if os.getenv('TWITTER_ACCESS_TOKEN_SECRET') else '❌ Not set'}")

    # Test other important settings
    print("\n⚙️ Other Settings:")
    print(f"DATABASE_URL: {'✅ Set' if os.getenv('DATABASE_URL') else '❌ Not set'}")
    print(f"SECRET_KEY: {'✅ Set' if os.getenv('SECRET_KEY') else '❌ Not set'}")
    print(f"FRONTEND_URL: {os.getenv('FRONTEND_URL', 'Not set')}")
    print(f"DEBUG: {os.getenv('DEBUG', 'Not set')}")

    # Test config loading
    print("\n🔧 Testing Config Loading:")
    try:
        from app.core.config import settings
        print("✅ Config loaded successfully")
        print(f"   - TWITTER_CLIENT_ID: {'Set' if settings.TWITTER_CLIENT_ID else 'Empty'}")
        print(f"   - TWITTER_CLIENT_SECRET: {'Set' if settings.TWITTER_CLIENT_SECRET else 'Empty'}")
        print(f"   - TWITTER_OAUTH_REDIRECT_URI: {settings.TWITTER_OAUTH_REDIRECT_URI}")
        print(f"   - FRONTEND_URL: {settings.FRONTEND_URL}")

        # Check for placeholder values
        if settings.TWITTER_CLIENT_ID == "your_actual_twitter_client_id_here":
            print("⚠️  WARNING: TWITTER_CLIENT_ID still has placeholder value")
        if settings.TWITTER_CLIENT_SECRET == "your_actual_twitter_client_secret_here":
            print("⚠️  WARNING: TWITTER_CLIENT_SECRET still has placeholder value")

    except Exception as e:
        print(f"❌ Failed to load config: {e}")

    print("\n" + "=" * 50)
    print("✅ Environment variable test completed!")


if __name__ == "__main__":
    test_env_loading()
