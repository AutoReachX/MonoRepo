"""
Tests for validation service.
Following good testing practices with clear test cases.
"""

import pytest  # noqa: F401
from app.services.validation_service import ValidationService
from app.core.constants import TwitterConstants  # ValidationRules, ContentConstants unused


class TestValidationService:
    """Test cases for ValidationService"""

    def setup_method(self):
        """Set up test fixtures"""
        self.validation_service = ValidationService()

    def test_validate_tweet_content_valid(self):
        """Test validation of valid tweet content"""
        content = "This is a valid tweet content #test"
        result = self.validation_service.validate_tweet_content(content)

        assert result["is_valid"] is True
        assert len(result["errors"]) == 0
        assert result["character_count"] == len(content)
        assert result["remaining_characters"] == TwitterConstants.MAX_TWEET_LENGTH - len(content)

    def test_validate_tweet_content_empty(self):
        """Test validation of empty tweet content"""
        content = ""
        result = self.validation_service.validate_tweet_content(content)

        assert result["is_valid"] is False
        assert "Tweet content is required" in result["errors"]

    def test_validate_tweet_content_too_long(self):
        """Test validation of tweet content that's too long"""
        content = "a" * (TwitterConstants.MAX_TWEET_LENGTH + 1)
        result = self.validation_service.validate_tweet_content(content)

        assert result["is_valid"] is False
        assert any("exceeds" in error for error in result["errors"])

    def test_validate_tweet_content_excessive_hashtags(self):
        """Test validation of tweet with too many hashtags"""
        content = "Test tweet #one #two #three #four #five"
        result = self.validation_service.validate_tweet_content(content)

        assert result["is_valid"] is False
        assert any("hashtags" in error for error in result["errors"])

    def test_validate_content_generation_request_valid(self):
        """Test validation of valid content generation request"""
        data = {
            "topic": "AI and machine learning",
            "style": "engaging",
            "language": "en"
        }
        result = self.validation_service.validate_content_generation_request(data)

        assert result["is_valid"] is True
        assert len(result["errors"]) == 0

    def test_validate_content_generation_request_missing_topic(self):
        """Test validation with missing topic"""
        data = {
            "style": "engaging",
            "language": "en"
        }
        result = self.validation_service.validate_content_generation_request(data)

        assert result["is_valid"] is False
        assert "Topic is required" in result["errors"]

    def test_validate_content_generation_request_topic_too_short(self):
        """Test validation with topic too short"""
        data = {
            "topic": "AI",  # Only 2 characters
            "style": "engaging",
            "language": "en"
        }
        result = self.validation_service.validate_content_generation_request(data)

        assert result["is_valid"] is False
        assert any("at least" in error for error in result["errors"])

    def test_validate_content_generation_request_invalid_style(self):
        """Test validation with invalid style"""
        data = {
            "topic": "Valid topic here",
            "style": "invalid_style",
            "language": "en"
        }
        result = self.validation_service.validate_content_generation_request(data)

        assert result["is_valid"] is False
        assert any("Style must be one of" in error for error in result["errors"])

    def test_validate_thread_generation_request_valid(self):
        """Test validation of valid thread generation request"""
        data = {
            "topic": "AI and machine learning trends",
            "num_tweets": 5,
            "style": "informative",
            "language": "en"
        }
        result = self.validation_service.validate_thread_generation_request(data)

        assert result["is_valid"] is True
        assert len(result["errors"]) == 0

    def test_validate_thread_generation_request_too_few_tweets(self):
        """Test validation with too few tweets in thread"""
        data = {
            "topic": "Valid topic",
            "num_tweets": 1,  # Too few
            "style": "informative",
            "language": "en"
        }
        result = self.validation_service.validate_thread_generation_request(data)

        assert result["is_valid"] is False
        assert any("at least 2 tweets" in error for error in result["errors"])

    def test_validate_thread_generation_request_too_many_tweets(self):
        """Test validation with too many tweets in thread"""
        data = {
            "topic": "Valid topic",
            "num_tweets": TwitterConstants.MAX_THREAD_TWEETS + 1,  # Too many
            "style": "informative",
            "language": "en"
        }
        result = self.validation_service.validate_thread_generation_request(data)

        assert result["is_valid"] is False
        assert any("cannot exceed" in error for error in result["errors"])

    def test_validate_field_required_missing(self):
        """Test field validation for required field that's missing"""
        errors = self.validation_service._validate_field(
            "test_field",
            None,
            {"required": True}
        )

        assert len(errors) == 1
        assert "test_field is required" in errors[0]

    def test_validate_field_string_length(self):
        """Test field validation for string length constraints"""
        # Test minimum length
        errors = self.validation_service._validate_field(
            "test_field",
            "ab",  # Too short
            {"type": str, "min_length": 3}
        )
        assert len(errors) == 1
        assert "at least 3 characters" in errors[0]

        # Test maximum length
        errors = self.validation_service._validate_field(
            "test_field",
            "abcdef",  # Too long
            {"type": str, "max_length": 5}
        )
        assert len(errors) == 1
        assert "cannot exceed 5 characters" in errors[0]

    def test_validate_field_numeric_range(self):
        """Test field validation for numeric range constraints"""
        # Test minimum value
        errors = self.validation_service._validate_field(
            "test_field",
            5,
            {"type": int, "min_value": 10}
        )
        assert len(errors) == 1
        assert "at least 10" in errors[0]

        # Test maximum value
        errors = self.validation_service._validate_field(
            "test_field",
            15,
            {"type": int, "max_value": 10}
        )
        assert len(errors) == 1
        assert "cannot exceed 10" in errors[0]

    def test_validate_field_choices(self):
        """Test field validation for choice constraints"""
        errors = self.validation_service._validate_field(
            "test_field",
            "invalid_choice",
            {"choices": ["choice1", "choice2", "choice3"]}
        )
        assert len(errors) == 1
        assert "must be one of" in errors[0]
