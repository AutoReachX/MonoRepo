"""
Tests for content API endpoints.
Testing API layer with mocked services.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from app.main import app


class TestContentAPI:
    """Test cases for Content API endpoints"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        self.mock_user = Mock()
        self.mock_user.id = 1
        self.mock_user.language_pref = "en"
    
    @patch('app.api.content.get_current_user')
    @patch('app.api.content.get_content_service')
    @patch('app.api.content.get_db')
    def test_generate_tweet_success(self, mock_get_db, mock_get_content_service, mock_get_current_user):
        """Test successful tweet generation endpoint"""
        # Arrange
        mock_get_current_user.return_value = self.mock_user
        mock_db = Mock()
        mock_get_db.return_value = mock_db
        
        mock_content_service = Mock()
        mock_content_service.generate_tweet = AsyncMock(return_value={
            "success": True,
            "content": "Generated tweet content",
            "prompt": "Test prompt",
            "tokens_used": 50
        })
        mock_get_content_service.return_value = mock_content_service
        
        request_data = {
            "topic": "AI and machine learning",
            "style": "engaging",
            "language": "en"
        }
        
        # Act
        response = self.client.post("/api/content/generate-tweet", json=request_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["content"] == "Generated tweet content"
        assert data["prompt"] == "Test prompt"
        assert data["tokens_used"] == 50
    
    @patch('app.api.content.get_current_user')
    @patch('app.api.content.get_content_service')
    @patch('app.api.content.get_db')
    def test_generate_tweet_validation_error(self, mock_get_db, mock_get_content_service, mock_get_current_user):
        """Test tweet generation with validation error"""
        # Arrange
        mock_get_current_user.return_value = self.mock_user
        mock_db = Mock()
        mock_get_db.return_value = mock_db
        
        mock_content_service = Mock()
        mock_content_service.generate_tweet = AsyncMock(
            side_effect=Exception("Validation error")
        )
        mock_get_content_service.return_value = mock_content_service
        
        request_data = {
            "topic": "",  # Invalid empty topic
            "style": "engaging",
            "language": "en"
        }
        
        # Act
        response = self.client.post("/api/content/generate-tweet", json=request_data)
        
        # Assert
        assert response.status_code == 500  # Should be handled by exception handler
    
    @patch('app.api.content.get_current_user')
    @patch('app.api.content.get_content_service')
    @patch('app.api.content.get_db')
    def test_generate_thread_success(self, mock_get_db, mock_get_content_service, mock_get_current_user):
        """Test successful thread generation endpoint"""
        # Arrange
        mock_get_current_user.return_value = self.mock_user
        mock_db = Mock()
        mock_get_db.return_value = mock_db
        
        mock_content_service = Mock()
        mock_content_service.generate_thread = AsyncMock(return_value={
            "success": True,
            "content": "Generated thread content",
            "prompt": "Thread prompt",
            "tokens_used": 150
        })
        mock_get_content_service.return_value = mock_content_service
        
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
    
    @patch('app.api.content.get_current_user')
    @patch('app.api.content.get_content_service')
    @patch('app.api.content.get_db')
    def test_generate_reply_success(self, mock_get_db, mock_get_content_service, mock_get_current_user):
        """Test successful reply generation endpoint"""
        # Arrange
        mock_get_current_user.return_value = self.mock_user
        mock_db = Mock()
        mock_get_db.return_value = mock_db
        
        mock_content_service = Mock()
        mock_content_service.generate_reply = AsyncMock(return_value={
            "success": True,
            "content": "Generated reply content",
            "prompt": "Reply prompt",
            "tokens_used": 75
        })
        mock_get_content_service.return_value = mock_content_service
        
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
    
    @patch('app.api.content.get_current_user')
    @patch('app.api.content.get_db')
    def test_get_content_history_success(self, mock_get_db, mock_get_current_user):
        """Test successful content history retrieval"""
        # Arrange
        mock_get_current_user.return_value = self.mock_user
        mock_db = Mock()
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []
        mock_get_db.return_value = mock_db
        
        # Act
        response = self.client.get("/api/content/history")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert "total" in data
