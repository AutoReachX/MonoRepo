"""
Common validation utilities to eliminate duplicate validation patterns.
Following DRY principle and Single Responsibility Principle.
"""

import re
from typing import Dict, Any, List, Optional
from app.core.constants import (
    ValidationRules,
    TwitterConstants,
    ContentConstants
)


class ValidationResult:
    """
    Value object for validation results.
    Follows Single Responsibility Principle.
    """

    def __init__(self, is_valid: bool = True, errors: Optional[List[str]] = None):
        self.is_valid = is_valid
        self.errors = errors or []

    def add_error(self, error: str) -> None:
        """Add an error to the validation result"""
        self.errors.append(error)
        self.is_valid = False

    def merge(self, other: 'ValidationResult') -> 'ValidationResult':
        """Merge another validation result with this one"""
        if not other.is_valid:
            self.is_valid = False
            self.errors.extend(other.errors)
        return self

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format"""
        return {
            "is_valid": self.is_valid,
            "errors": self.errors
        }


class BaseValidator:
    """
    Base validator class with common validation methods.
    Follows Single Responsibility Principle.
    """

    @staticmethod
    def validate_required_field(value: Any, field_name: str) -> ValidationResult:
        """Validate that a required field is present and not empty"""
        result = ValidationResult()

        if value is None:
            result.add_error(f"{field_name} is required")
        elif isinstance(value, str) and not value.strip():
            result.add_error(f"{field_name} is required")
        elif isinstance(value, (list, dict)) and len(value) == 0:
            result.add_error(f"{field_name} is required")

        return result

    @staticmethod
    def validate_string_length(
        value: str,
        field_name: str,
        min_length: int = 0,
        max_length: Optional[int] = None
    ) -> ValidationResult:
        """Validate string length constraints"""
        result = ValidationResult()

        if not isinstance(value, str):
            result.add_error(f"{field_name} must be a string")
            return result

        length = len(value.strip())

        if length < min_length:
            result.add_error(f"{field_name} must be at least {min_length} characters")

        if max_length and length > max_length:
            result.add_error(f"{field_name} cannot exceed {max_length} characters")

        return result

    @staticmethod
    def validate_choice(value: Any, field_name: str, choices: List[Any]) -> ValidationResult:
        """Validate that a value is in a list of allowed choices"""
        result = ValidationResult()

        if value not in choices:
            result.add_error(f"{field_name} must be one of: {', '.join(map(str, choices))}")

        return result

    @staticmethod
    def validate_integer_range(
        value: Any,
        field_name: str,
        min_value: Optional[int] = None,
        max_value: Optional[int] = None
    ) -> ValidationResult:
        """Validate integer value and range"""
        result = ValidationResult()

        if not isinstance(value, int):
            result.add_error(f"{field_name} must be an integer")
            return result

        if min_value is not None and value < min_value:
            result.add_error(f"{field_name} must be at least {min_value}")

        if max_value is not None and value > max_value:
            result.add_error(f"{field_name} cannot exceed {max_value}")

        return result


class ContentValidator(BaseValidator):
    """
    Validator for content-related data.
    Follows Single Responsibility Principle.
    """

    @staticmethod
    def validate_topic(topic: str) -> ValidationResult:
        """Validate content topic"""
        result = ValidationResult()

        # Check required
        required_result = ContentValidator.validate_required_field(topic, "Topic")
        result.merge(required_result)

        if not result.is_valid:
            return result

        # Check length
        length_result = ContentValidator.validate_string_length(
            topic,
            "Topic",
            ValidationRules.MIN_TOPIC_LENGTH,
            ValidationRules.MAX_TOPIC_LENGTH
        )
        result.merge(length_result)

        return result

    @staticmethod
    def validate_style(style: str) -> ValidationResult:
        """Validate content style"""
        return ContentValidator.validate_choice(
            style,
            "Style",
            ContentConstants.SUPPORTED_STYLES
        )

    @staticmethod
    def validate_language(language: str) -> ValidationResult:
        """Validate content language"""
        return ContentValidator.validate_choice(
            language,
            "Language",
            ContentConstants.SUPPORTED_LANGUAGES
        )

    @staticmethod
    def validate_user_context(user_context: Optional[str]) -> ValidationResult:
        """Validate user context if provided"""
        result = ValidationResult()

        if user_context is not None:
            length_result = ContentValidator.validate_string_length(
                user_context,
                "User context",
                0,
                ValidationRules.MAX_CONTENT_LENGTH
            )
            result.merge(length_result)

        return result

    @staticmethod
    def validate_thread_size(num_tweets: int) -> ValidationResult:
        """Validate thread size"""
        result = ValidationResult()

        if not isinstance(num_tweets, int):
            result.add_error("Number of tweets must be an integer")
            return result

        if num_tweets < 2:
            result.add_error("Thread must contain at least 2 tweets")

        if num_tweets > TwitterConstants.MAX_THREAD_TWEETS:
            result.add_error(f"Thread cannot exceed {TwitterConstants.MAX_THREAD_TWEETS} tweets")

        return result


class TwitterContentValidator(BaseValidator):
    """
    Validator for Twitter-specific content.
    Follows Single Responsibility Principle.
    """

    @staticmethod
    def validate_tweet_content(content: str) -> ValidationResult:
        """Validate tweet content according to Twitter rules"""
        result = ValidationResult()

        # Check required
        required_result = TwitterContentValidator.validate_required_field(content, "Tweet content")
        result.merge(required_result)

        if not result.is_valid:
            return result

        # Check length
        if len(content) > TwitterConstants.MAX_TWEET_LENGTH:
            result.add_error(f"Tweet content exceeds {TwitterConstants.MAX_TWEET_LENGTH} characters")

        if len(content.strip()) < ValidationRules.MIN_CONTENT_LENGTH:
            result.add_error(f"Tweet content must be at least {ValidationRules.MIN_CONTENT_LENGTH} character")

        # Check for excessive hashtags
        if TwitterContentValidator._count_hashtags(content) > TwitterConstants.MAX_HASHTAGS_RECOMMENDED:
            result.add_error(
                f"Tweet contains too many hashtags (max "
                f"{TwitterConstants.MAX_HASHTAGS_RECOMMENDED} recommended)")

        # Check for excessive mentions
        if TwitterContentValidator._count_mentions(content) > TwitterConstants.MAX_MENTIONS_RECOMMENDED:
            result.add_error(
                f"Tweet contains too many mentions (max "
                f"{TwitterConstants.MAX_MENTIONS_RECOMMENDED} recommended)")

        return result

    @staticmethod
    def _count_hashtags(content: str) -> int:
        """Count hashtags in content"""
        return len(re.findall(r'#\w+', content))

    @staticmethod
    def _count_mentions(content: str) -> int:
        """Count mentions in content"""
        return len(re.findall(r'@\w+', content))

    @staticmethod
    def get_character_count_info(content: str) -> Dict[str, int]:
        """Get character count information for tweet content"""
        return {
            "character_count": len(content),
            "remaining_characters": TwitterConstants.MAX_TWEET_LENGTH - len(content)
        }


class UserValidator(BaseValidator):
    """
    Validator for user-related data.
    Follows Single Responsibility Principle.
    """

    @staticmethod
    def validate_username(username: str) -> ValidationResult:
        """Validate username"""
        result = ValidationResult()

        # Check required
        required_result = UserValidator.validate_required_field(username, "Username")
        result.merge(required_result)

        if not result.is_valid:
            return result

        # Check length
        length_result = UserValidator.validate_string_length(
            username,
            "Username",
            ValidationRules.MIN_USERNAME_LENGTH,
            ValidationRules.MAX_USERNAME_LENGTH
        )
        result.merge(length_result)

        # Check format (alphanumeric and underscores only)
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            result.add_error("Username can only contain letters, numbers, and underscores")

        return result

    @staticmethod
    def validate_email(email: str) -> ValidationResult:
        """Validate email format"""
        result = ValidationResult()

        # Check required
        required_result = UserValidator.validate_required_field(email, "Email")
        result.merge(required_result)

        if not result.is_valid:
            return result

        # Basic email format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            result.add_error("Invalid email format")

        return result

    @staticmethod
    def validate_password(password: str) -> ValidationResult:
        """Validate password strength"""
        result = ValidationResult()

        # Check required
        required_result = UserValidator.validate_required_field(password, "Password")
        result.merge(required_result)

        if not result.is_valid:
            return result

        # Check length
        length_result = UserValidator.validate_string_length(
            password,
            "Password",
            ValidationRules.MIN_PASSWORD_LENGTH,
            ValidationRules.MAX_PASSWORD_LENGTH
        )
        result.merge(length_result)

        return result


# Convenience functions for common validation patterns
def validate_content_generation_request(data: Dict[str, Any]) -> ValidationResult:
    """Validate a complete content generation request"""
    result = ValidationResult()

    # Validate topic
    topic_result = ContentValidator.validate_topic(data.get("topic", ""))
    result.merge(topic_result)

    # Validate style
    style = data.get("style", ContentConstants.DEFAULT_STYLE)
    style_result = ContentValidator.validate_style(style)
    result.merge(style_result)

    # Validate language
    language = data.get("language", ContentConstants.DEFAULT_LANGUAGE)
    language_result = ContentValidator.validate_language(language)
    result.merge(language_result)

    # Validate user context if provided
    user_context = data.get("user_context")
    if user_context:
        context_result = ContentValidator.validate_user_context(user_context)
        result.merge(context_result)

    return result


def validate_thread_generation_request(data: Dict[str, Any]) -> ValidationResult:
    """Validate a thread generation request"""
    result = ValidationResult()

    # First validate as regular content generation
    base_result = validate_content_generation_request(data)
    result.merge(base_result)

    # Validate number of tweets
    num_tweets = data.get("num_tweets", TwitterConstants.DEFAULT_THREAD_SIZE)
    thread_result = ContentValidator.validate_thread_size(num_tweets)
    result.merge(thread_result)

    return result
