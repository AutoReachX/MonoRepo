#!/usr/bin/env python3
"""
Integration tests for Reachly API
Tests the complete flow using FastAPI test client
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

# Test configuration
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
}


class TestAPIIntegration:
    """Test API integration using FastAPI test client"""

    def setup_method(self):
        """Setup for each test method"""
        self.client = TestClient(app)
        self.auth_token = None

    def test_health_check(self):
        """Test basic API health check"""
        response = self.client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.client.get("/")
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
        response = self.client.options("/api/content/generate-tweet", headers=headers)
        # Should not return 405 or CORS error
        assert response.status_code in [200, 204]

    def test_api_documentation(self):
        """Test that API documentation is accessible"""
        response = self.client.get("/docs")
        assert response.status_code == 200

        response = self.client.get("/redoc")
        assert response.status_code == 200

    def test_content_generation_endpoint_structure(self):
        """Test content generation endpoint structure (without API keys)"""
        # Test tweet generation endpoint exists
        response = self.client.post("/api/content/generate-tweet", json={
            "topic": "test topic",
            "style": "professional",
            "language": "en"
        })

        # Should return 401 (unauthorized), 422 (validation error) or 500 (missing API key)
        # All are acceptable since we don't have auth tokens or real API keys in tests
        assert response.status_code in [401, 422, 500]

    def test_content_history_endpoint_structure(self):
        """Test content history endpoint structure"""
        response = self.client.get("/api/content/history")
        # Should return 401 (unauthorized) since no auth token
        assert response.status_code == 401


