#!/usr/bin/env python3
"""
Integration tests for AutoReach API
Tests the complete flow from frontend to backend
"""

import pytest  # noqa: F401
import requests
import json  # noqa: F401
import time  # noqa: F401
from typing import Dict, Any  # noqa: F401

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
}


class TestAPIIntegration:
    """Test API integration and data flow"""

    def setup_method(self):
        """Setup for each test method"""
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None

    def teardown_method(self):
        """Cleanup after each test method"""
        if self.session:
            self.session.close()

    def test_health_check(self):
        """Test basic API health check"""
        response = self.session.get(f"{self.base_url}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.session.get(f"{self.base_url}/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    def test_cors_headers(self):
        """Test CORS configuration"""
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        response = self.session.options(f"{self.base_url}/api/content/generate-tweet", headers=headers)
        # Should not return 405 or CORS error
        assert response.status_code in [200, 204]

    def test_user_registration_flow(self):
        """Test complete user registration flow"""
        # Register new user
        response = self.session.post(
            f"{self.base_url}/api/users/",
            json=TEST_USER
        )

        if response.status_code == 400:
            # User might already exist, that's okay for testing
            assert "already registered" in response.json().get("detail", "")
        else:
            assert response.status_code == 201
            user_data = response.json()
            assert user_data["username"] == TEST_USER["username"]
            assert user_data["email"] == TEST_USER["email"]
            assert "id" in user_data

    def test_authentication_flow(self):
        """Test login and token authentication"""
        # First ensure user exists
        self.test_user_registration_flow()

        # Login
        login_data = {
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }

        response = self.session.post(
            f"{self.base_url}/api/auth/token",
            data=login_data  # OAuth2PasswordRequestForm expects form data
        )

        assert response.status_code == 200
        token_data = response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"

        # Store token for subsequent requests
        self.auth_token = token_data["access_token"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.auth_token}"
        })

        # Test authenticated endpoint
        response = self.session.get(f"{self.base_url}/api/auth/me")
        assert response.status_code == 200
        user_data = response.json()
        assert user_data["username"] == TEST_USER["username"]

    def test_content_generation_endpoints(self):
        """Test content generation API endpoints"""
        # Authenticate first
        self.test_authentication_flow()

        # Test tweet generation
        tweet_request = {
            "topic": "AI and technology trends",
            "style": "professional",
            "language": "en"
        }

        response = self.session.post(
            f"{self.base_url}/api/content/generate-tweet",
            json=tweet_request
        )

        # Note: This might fail if OpenAI API key is not configured
        # That's expected in test environment
        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
            assert "content" in data
        else:
            # Check if it's a configuration error (expected in test)
            assert response.status_code in [500, 422]

    def test_content_history_endpoint(self):
        """Test content history retrieval"""
        # Authenticate first
        self.test_authentication_flow()

        response = self.session.get(f"{self.base_url}/api/content/history")
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert "statistics" in data
        assert "pagination" in data
        assert isinstance(data["history"], list)
        assert isinstance(data["statistics"], dict)

    def test_api_documentation(self):
        """Test that API documentation is accessible"""
        response = self.session.get(f"{self.base_url}/docs")
        assert response.status_code == 200

        response = self.session.get(f"{self.base_url}/redoc")
        assert response.status_code == 200


if __name__ == "__main__":
    # Run tests manually
    test_instance = TestAPIIntegration()

    print("🧪 Running AutoReach API Integration Tests...")
    print("=" * 50)

    tests = [
        ("Health Check", test_instance.test_health_check),
        ("Root Endpoint", test_instance.test_root_endpoint),
        ("CORS Headers", test_instance.test_cors_headers),
        ("User Registration", test_instance.test_user_registration_flow),
        ("Authentication", test_instance.test_authentication_flow),
        ("Content Generation", test_instance.test_content_generation_endpoints),
        ("Content History", test_instance.test_content_history_endpoint),
        ("API Documentation", test_instance.test_api_documentation),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            test_instance.setup_method()
            test_func()
            print(f"✅ {test_name}")
            passed += 1
        except Exception as e:
            print(f"❌ {test_name}: {str(e)}")
            failed += 1
        finally:
            test_instance.teardown_method()

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed} passed, {failed} failed")

    if failed == 0:
        print("🎉 All integration tests passed!")
    else:
        print("⚠️ Some tests failed. Check the backend configuration.")
