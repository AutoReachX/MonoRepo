"""
Tests for content API endpoints.
Testing API layer with mocked services.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock
from app.main import app
from app.core.database import get_db
from app.core.dependencies import get_content_orchestration_service
from app.api.auth import get_current_user


class TestContentAPI:
    """Test cases for Content API endpoints"""

    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        self.mock_user = Mock()
        self.mock_user.id = 1
        self.mock_user.language_pref = "en"

        # Mock database
        self.mock_db = Mock()

        # Mock content orchestration service
        self.mock_content_service = Mock()

        # Set up dependency overrides
        app.dependency_overrides[get_db] = lambda: self.mock_db
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
        app.dependency_overrides[get_content_orchestration_service] = lambda: self.mock_content_service

    def teardown_method(self):
        """Clean up after each test"""
        app.dependency_overrides.clear()

    def test_generate_tweet_success(self):
        """Test successful tweet generation endpoint"""
        # Arrange
        self.mock_content_service.generate_and_log_tweet = AsyncMock(return_value={
            "content": "Generated tweet content",
            "prompt": "Test prompt",
            "tokens_used": 50
        })

        request_data = {
            "topic": "AI and machine learning",
            "style": "engaging",
            "language": "en"
        }

        # Act
        response = self.client.post("/api/content/generate-tweet", json=request_data)

        # Assert
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.text}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["content"] == "Generated tweet content"
        assert data["prompt"] == "Test prompt"
        assert data["tokens_used"] == 50

    def test_generate_tweet_validation_error(self):
        """Test tweet generation with validation error"""
        # Arrange
        self.mock_content_service.generate_and_log_tweet = AsyncMock(
            side_effect=Exception("Validation error")
        )

        request_data = {
            "topic": "",  # Invalid empty topic
            "style": "engaging",
            "language": "en"
        }

        # Act
        response = self.client.post("/api/content/generate-tweet", json=request_data)

        # Assert
        assert response.status_code == 500  # Should be handled by exception handler

    def test_generate_thread_success(self):
        """Test successful thread generation endpoint"""
        # Arrange
        self.mock_content_service.generate_and_log_thread = AsyncMock(return_value={
            "content": "Generated thread content",
            "prompt": "Thread prompt",
            "tokens_used": 150
        })

        request_data = {
            "topic": "AI trends in 2024",
            "num_tweets": 3,
            "style": "informative",
            "language": "en"
        }

        # Act
        response = self.client.post("/api/content/generate-thread", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["content"] == "Generated thread content"

    def test_generate_reply_success(self):
        """Test successful reply generation endpoint"""
        # Arrange
        self.mock_content_service.generate_and_log_reply = AsyncMock(return_value={
            "content": "Generated reply content",
            "prompt": "Reply prompt",
            "tokens_used": 75
        })

        request_data = {
            "original_tweet": "This is an interesting tweet about AI",
            "reply_style": "helpful",
            "language": "en"
        }

        # Act
        response = self.client.post("/api/content/generate-reply", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["content"] == "Generated reply content"

    def test_generate_tweet_missing_topic(self):
        """Test tweet generation with missing required field"""
        request_data = {
            "style": "engaging",
            "language": "en"
            # Missing topic
        }

        # Act
        response = self.client.post("/api/content/generate-tweet", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error from Pydantic

    def test_generate_thread_invalid_num_tweets(self):
        """Test thread generation with invalid number of tweets"""
        request_data = {
            "topic": "AI trends",
            "num_tweets": "invalid",  # Should be integer
            "style": "informative",
            "language": "en"
        }

        # Act
        response = self.client.post("/api/content/generate-thread", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error from Pydantic

    def test_get_content_history_success(self):
        """Test successful content history retrieval"""
        # Arrange
        self.mock_content_service.get_user_content_history = Mock(return_value={
            "history": [],
            "statistics": {
                "total_generated": 0,
                "by_mode": {}
            },
            "pagination": {
                "limit": 50,
                "offset": 0,
                "has_more": False
            }
        })

        # Act
        response = self.client.get("/api/content/history")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert "statistics" in data
        assert "pagination" in data
