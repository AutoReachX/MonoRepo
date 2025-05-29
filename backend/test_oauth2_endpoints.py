#!/usr/bin/env python3
"""
Test script to verify OAuth 2.0 endpoints are working
"""

import os
import sys
import requests
import json  # noqa: F401
from dotenv import load_dotenv

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_oauth2_endpoints():
    print("🔍 Testing OAuth 2.0 Endpoints")
    print("=" * 50)

    # Load environment variables
    load_dotenv(override=True)

    base_url = "http://localhost:8000/api"

    print("\n🚀 Testing OAuth 2.0 Initialization Endpoint")
    print("-" * 30)

    try:
        # Test OAuth 2.0 initialization
        init_data = {
            "redirect_uri": "http://localhost:3000/auth/twitter/oauth2-callback"
        }

        response = requests.post(
            f"{base_url}/auth/oauth2/twitter/init",
            json=init_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ OAuth 2.0 initialization successful!")
            print(f"   - Authorization URL: {data.get('authorization_url', 'Not provided')[:100]}...")
            print(f"   - State: {data.get('state', 'Not provided')[:20]}...")
            print(f"   - Code Verifier: {data.get('code_verifier', 'Not provided')[:20]}...")

            # Check if URL contains expected parameters
            auth_url = data.get('authorization_url', '')
            if 'twitter.com/i/oauth2/authorize' in auth_url:
                print("✅ Authorization URL format is correct")
            else:
                print("❌ Authorization URL format is incorrect")

        else:
            print(f"❌ OAuth 2.0 initialization failed: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing OAuth 2.0 endpoints: {e}")

    print("\n📋 Configuration Check")
    print("-" * 30)

    # Check configuration
    try:
        from app.core.config import settings

        if settings.TWITTER_CLIENT_ID == "your_actual_twitter_client_id_here":
            print("⚠️  TWITTER_CLIENT_ID is still using placeholder value")
            print("   You need to update this with your real Twitter Client ID")
        else:
            print("✅ TWITTER_CLIENT_ID is configured")

        if settings.TWITTER_CLIENT_SECRET == "your_actual_twitter_client_secret_here":
            print("⚠️  TWITTER_CLIENT_SECRET is still using placeholder value")
            print("   You need to update this with your real Twitter Client Secret")
        else:
            print("✅ TWITTER_CLIENT_SECRET is configured")

        print(f"✅ Redirect URI: {settings.TWITTER_OAUTH_REDIRECT_URI}")

    except Exception as e:
        print(f"❌ Error checking configuration: {e}")

    print("\n📝 Next Steps")
    print("-" * 30)
    print("1. Replace placeholder values in backend/.env with real Twitter credentials")
    print("2. Make sure your Twitter App callback URI is set to:")
    print("   http://localhost:3000/auth/twitter/oauth2-callback")
    print("3. Start both backend and frontend servers")
    print("4. Test the complete OAuth flow in your browser")

    print("\n" + "=" * 50)
    print("✅ OAuth 2.0 endpoint test completed!")


if __name__ == "__main__":
    test_oauth2_endpoints()
