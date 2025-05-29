#!/usr/bin/env python3
"""
Twitter OAuth Test Script for AutoReach

This script tests the Twitter OAuth setup without requiring a full app run.
Run this to verify your Twitter API credentials are working.
"""

from app.core.config import settings
from app.services.twitter_service import TwitterService
import os
import sys
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()


def test_twitter_credentials():
    """Test Twitter API credentials"""
    print("🔍 Testing Twitter OAuth Setup...")
    print("=" * 50)

    # Check if credentials are set
    print("📋 Checking environment variables:")
    credentials = {
        "TWITTER_API_KEY": settings.TWITTER_API_KEY,
        "TWITTER_API_SECRET": settings.TWITTER_API_SECRET,
        "TWITTER_ACCESS_TOKEN": settings.TWITTER_ACCESS_TOKEN,
        "TWITTER_ACCESS_TOKEN_SECRET": settings.TWITTER_ACCESS_TOKEN_SECRET,
        "TWITTER_BEARER_TOKEN": settings.TWITTER_BEARER_TOKEN,
    }

    missing_creds = []
    for name, value in credentials.items():
        # Check if value is set and not a placeholder
        placeholder_patterns = [
            "your_twitter",
            "your_actual",
            "your_api",
            "your_bearer",
            "your_access",
            "your_client"
        ]

        if value and len(value) > 10 and not any(pattern in value.lower() for pattern in placeholder_patterns):
            print(f"  ✅ {name}: Set (length: {len(value)})")
        else:
            print(f"  ❌ {name}: Not set or using placeholder (value: {value[:20]}...)")
            missing_creds.append(name)

    if missing_creds:
        print(f"\n❌ Missing credentials: {', '.join(missing_creds)}")
        print("Please update your .env file with actual Twitter API credentials.")
        return False

    print("\n🔧 Testing Twitter Service initialization...")

    try:
        # Test OAuth URL generation
        twitter_service = TwitterService(
            api_key=settings.TWITTER_API_KEY,
            api_secret=settings.TWITTER_API_SECRET
        )

        print("  ✅ TwitterService initialized successfully")

        # Test OAuth URL generation
        callback_url = "http://localhost:3000/auth/twitter/callback"
        result = twitter_service.get_oauth_url(callback_url)

        if result.get("success"):
            print("  ✅ OAuth URL generation successful")
            print(f"  📝 OAuth Token: {result['oauth_token'][:10]}...")
            print(f"  🔗 Auth URL: {result['authorization_url'][:50]}...")
            return True
        else:
            print(f"  ❌ OAuth URL generation failed: {result.get('error')}")
            return False

    except Exception as e:
        print(f"  ❌ TwitterService initialization failed: {str(e)}")
        return False


def test_twitter_api_connection():
    """Test basic Twitter API connection"""
    print("\n🌐 Testing Twitter API connection...")

    try:
        twitter_service = TwitterService(
            api_key=settings.TWITTER_API_KEY,
            api_secret=settings.TWITTER_API_SECRET,
            access_token=settings.TWITTER_ACCESS_TOKEN,
            access_token_secret=settings.TWITTER_ACCESS_TOKEN_SECRET
        )

        # Test getting current user info
        user_info = twitter_service.get_current_user_info()

        if user_info and user_info.get("success"):
            print("  ✅ Twitter API connection successful")
            print(f"  👤 Connected as: @{user_info['data']['username']}")
            print(f"  🆔 User ID: {user_info['data']['id']}")
            return True
        else:
            print(f"  ❌ Twitter API connection failed: {user_info.get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"  ❌ Twitter API connection failed: {str(e)}")
        return False


def main():
    """Main test function"""
    print("🚀 AutoReach Twitter OAuth Test")
    print("=" * 50)

    # Test 1: Credentials and OAuth URL generation
    oauth_test = test_twitter_credentials()

    # Test 2: API connection (only if credentials are set)
    api_test = False
    if oauth_test:
        api_test = test_twitter_api_connection()

    # Summary
    print("\n📊 Test Summary:")
    print("=" * 50)
    print(f"OAuth Setup: {'✅ PASS' if oauth_test else '❌ FAIL'}")
    print(f"API Connection: {'✅ PASS' if api_test else '❌ FAIL'}")

    if oauth_test and api_test:
        print("\n🎉 All tests passed! Your Twitter OAuth setup is ready.")
        print("\nNext steps:")
        print("1. Start your backend: python start_server.py")
        print("2. Start your frontend: npm run dev")
        print("3. Test the OAuth flow in your browser")
    elif oauth_test:
        print("\n⚠️  OAuth setup is working, but API connection failed.")
        print("This might be normal if you're using app-only credentials.")
        print("The OAuth flow should still work for user authentication.")
    else:
        print("\n❌ OAuth setup failed. Please check your credentials.")
        print("Refer to TWITTER_OAUTH_SETUP.md for detailed instructions.")

    return oauth_test and api_test


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
