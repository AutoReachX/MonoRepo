"""
Tests for content service.
Testing business logic with mocked dependencies.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import sys
import os

# Add the app directory to the path for testing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Mock the database configuration before importing
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

# Mock the ContentLog model to avoid SQLAlchemy issues
with patch('app.services.content_service.ContentLog') as mock_content_log:
    mock_content_log.return_value = Mock()
    from app.services.content_service import ContentService
    from app.core.exceptions import ContentGenerationError
    from app.core.constants import ContentModes


class TestContentService:
    """Test cases for ContentService"""

    def setup_method(self):
        """Set up test fixtures"""
        self.mock_content_generator = Mock()
        self.mock_validation_service = Mock()
        self.mock_db = Mock()
        self.mock_user = Mock()
        self.mock_user.id = 1

        self.content_service = ContentService(
            content_generator=self.mock_content_generator,
            validation_service=self.mock_validation_service
        )

    @pytest.mark.asyncio
    @patch('app.services.content_service.ContentLog')
    async def test_generate_tweet_success(self, mock_content_log):
        """Test successful tweet generation"""
        # Arrange
        mock_content_log.return_value = Mock()
        self.mock_validation_service.validate_content_generation_request.return_value = {
            "is_valid": True,
            "errors": []
        }

        self.mock_content_generator.generate_tweet = AsyncMock(return_value={
            "success": True,
            "content": "Generated tweet content",
            "prompt": "Test prompt",
            "tokens_used": 50
        })

        # Act
        result = await self.content_service.generate_tweet(
            topic="AI",
            style="engaging",
            user_context=None,
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )

        # Assert
        assert result["success"] is True
        assert result["content"] == "Generated tweet content"
        assert result["prompt"] == "Test prompt"
        assert result["tokens_used"] == 50

        # Verify validation was called
        self.mock_validation_service.validate_content_generation_request.assert_called_once()

        # Verify content generator was called
        self.mock_content_generator.generate_tweet.assert_called_once_with(
            topic="AI",
            style="engaging",
            user_context=None,
            language="en"
        )

        # Verify database operations
        self.mock_db.add.assert_called_once()
        self.mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_tweet_validation_failure(self):
        """Test tweet generation with validation failure"""
        # Arrange
        self.mock_validation_service.validate_content_generation_request.return_value = {
            "is_valid": False,
            "errors": ["Topic is required"]
        }

        # Act & Assert
        with pytest.raises(ContentGenerationError) as exc_info:
            await self.content_service.generate_tweet(
                topic="",
                style="engaging",
                user_context=None,
                language="en",
                user=self.mock_user,
                db=self.mock_db
            )

        assert "Invalid input data" in str(exc_info.value)

        # Verify content generator was not called
        self.mock_content_generator.generate_tweet.assert_not_called()

    @pytest.mark.asyncio
    @patch('app.services.content_service.ContentLog')
    async def test_generate_thread_success(self, mock_content_log):
        """Test successful thread generation"""
        # Arrange
        mock_content_log.return_value = Mock()
        self.mock_validation_service.validate_thread_generation_request.return_value = {
            "is_valid": True,
            "errors": []
        }

        self.mock_content_generator.generate_thread = AsyncMock(return_value={
            "success": True,
            "content": "Generated thread content",
            "prompt": "Thread prompt",
            "tokens_used": 150
        })

        # Act
        result = await self.content_service.generate_thread(
            topic="AI trends",
            num_tweets=3,
            style="informative",
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )

        # Assert
        assert result["success"] is True
        assert result["content"] == "Generated thread content"

        # Verify validation was called
        self.mock_validation_service.validate_thread_generation_request.assert_called_once()

        # Verify content generator was called
        self.mock_content_generator.generate_thread.assert_called_once_with(
            topic="AI trends",
            num_tweets=3,
            style="informative",
            language="en"
        )

    @pytest.mark.asyncio
    @patch('app.services.content_service.ContentLog')
    async def test_generate_reply_success(self, mock_content_log):
        """Test successful reply generation"""
        # Arrange
        mock_content_log.return_value = Mock()
        self.mock_content_generator.generate_reply = AsyncMock(return_value={
            "success": True,
            "content": "Generated reply content",
            "prompt": "Reply prompt",
            "tokens_used": 75
        })

        # Act
        result = await self.content_service.generate_reply(
            original_tweet="Original tweet content",
            reply_style="helpful",
            user_context=None,
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )

        # Assert
        assert result["success"] is True
        assert result["content"] == "Generated reply content"

        # Verify content generator was called
        self.mock_content_generator.generate_reply.assert_called_once_with(
            original_tweet="Original tweet content",
            reply_style="helpful",
            user_context=None,
            language="en"
        )

    @pytest.mark.asyncio
    async def test_generate_tweet_content_generator_exception(self):
        """Test tweet generation when content generator raises exception"""
        # Arrange
        self.mock_validation_service.validate_content_generation_request.return_value = {
            "is_valid": True,
            "errors": []
        }

        self.mock_content_generator.generate_tweet = AsyncMock(
            side_effect=Exception("OpenAI API error")
        )

        # Act & Assert
        with pytest.raises(ContentGenerationError) as exc_info:
            await self.content_service.generate_tweet(
                topic="AI",
                style="engaging",
                user_context=None,
                language="en",
                user=self.mock_user,
                db=self.mock_db
            )

        assert "Tweet generation failed" in str(exc_info.value)
        assert "OpenAI API error" in str(exc_info.value)

    @patch('app.services.content_service.ContentLog')
    def test_log_content_generation_success(self, mock_content_log):
        """Test successful content generation logging"""
        # Arrange
        mock_content_log.return_value = Mock()

        # Act
        self.content_service._log_content_generation(
            user=self.mock_user,
            prompt="Test prompt",
            generated_text="Test content",
            mode=ContentModes.NEW_TWEET,
            db=self.mock_db
        )

        # Assert
        self.mock_db.add.assert_called_once()
        self.mock_db.commit.assert_called_once()

    def test_log_content_generation_database_error(self):
        """Test content generation logging with database error"""
        # Arrange
        self.mock_db.commit.side_effect = Exception("Database error")

        # Act & Assert
        with pytest.raises(Exception):  # Should raise DatabaseError but we're testing the flow
            self.content_service._log_content_generation(
                user=self.mock_user,
                prompt="Test prompt",
                generated_text="Test content",
                mode=ContentModes.NEW_TWEET,
                db=self.mock_db
            )

        # Verify rollback was called
        self.mock_db.rollback.assert_called_once()
