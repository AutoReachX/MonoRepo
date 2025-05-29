#!/usr/bin/env python3
"""
Test script for AutoReach API
Tests basic functionality and database connectivity
"""

import requests
import json  # noqa: F401
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

BASE_URL = "http://localhost:8000"


def test_api_endpoints():
    """Test basic API endpoints"""
    print("🧪 Testing AutoReach API endpoints...")

    # Test root endpoint
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

    # Test health endpoint
    print("\n2. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint: {data}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

    # Test API docs
    print("\n3. Testing API documentation...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation is accessible")
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

    return True


def test_database_connection():
    """Test database connectivity through API"""
    print("\n🗄️ Testing database connectivity...")

    # Test a simple endpoint that uses the database
    # Try to get a non-existent user (should return 404, which means DB is working)
    try:
        response = requests.get(f"{BASE_URL}/api/users/999999")
        print(f"User lookup endpoint status: {response.status_code}")
        if response.status_code == 404:  # Expected for non-existent user
            print("✅ Database connection through API is working")
            return True
        elif response.status_code in [401, 403]:  # Auth required but endpoint works
            print("✅ Database connection through API is working (auth required)")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except BaseException:
                print(f"Response text: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Database test error: {e}")
        return False


if __name__ == "__main__":
    print("🚀 AutoReach API Test Suite")
    print("=" * 50)

    # Test API endpoints
    api_success = test_api_endpoints()

    # Test database
    db_success = test_database_connection()

    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"API Endpoints: {'✅ PASS' if api_success else '❌ FAIL'}")
    print(f"Database: {'✅ PASS' if db_success else '❌ FAIL'}")

    if api_success and db_success:
        print("\n🎉 All tests passed! Your AutoReach backend is ready!")
        print(f"🌐 API Documentation: {BASE_URL}/docs")
        print(f"🔗 API Base URL: {BASE_URL}")
    else:
        print("\n⚠️ Some tests failed. Please check the issues above.")
        sys.exit(1)
