"""
Value objects for domain concepts.
Eliminates primitive obsession and provides type safety.
Following Domain-Driven Design principles.
"""

from typing import Optional
from dataclasses import dataclass
from app.core.constants import ValidationRules, ContentConstants
from app.core.exceptions import ValidationError


@dataclass(frozen=True)
class Topic:
    """
    Value object for content topic.
    Ensures topic validation and immutability.
    """
    value: str

    def __post_init__(self):
        """Validate topic on creation"""
        if not self.value or not self.value.strip():
            raise ValidationError("Topic cannot be empty")

        if len(self.value.strip()) < ValidationRules.MIN_TOPIC_LENGTH:
            raise ValidationError(f"Topic must be at least {ValidationRules.MIN_TOPIC_LENGTH} characters")

        if len(self.value.strip()) > ValidationRules.MAX_TOPIC_LENGTH:
            raise ValidationError(f"Topic cannot exceed {ValidationRules.MAX_TOPIC_LENGTH} characters")

    def __str__(self) -> str:
        return self.value.strip()

    @property
    def length(self) -> int:
        return len(self.value.strip())


@dataclass(frozen=True)
class ContentStyle:
    """
    Value object for content style.
    Ensures only valid styles are used.
    """
    value: str

    def __post_init__(self):
        """Validate style on creation"""
        if self.value not in ContentConstants.SUPPORTED_STYLES:
            raise ValidationError(f"Invalid style: {self.value}. Supported styles: {ContentConstants.SUPPORTED_STYLES}")

    def __str__(self) -> str:
        return self.value

    @classmethod
    def default(cls) -> 'ContentStyle':
        return cls(ContentConstants.DEFAULT_STYLE)


@dataclass(frozen=True)
class Language:
    """
    Value object for language code.
    Ensures only supported languages are used.
    """
    code: str

    def __post_init__(self):
        """Validate language on creation"""
        if self.code not in ContentConstants.SUPPORTED_LANGUAGES:
            raise ValidationError(
                f"Unsupported language: {
                    self.code}. Supported: {
                    ContentConstants.SUPPORTED_LANGUAGES}")

    def __str__(self) -> str:
        return self.code

    @classmethod
    def default(cls) -> 'Language':
        return cls(ContentConstants.DEFAULT_LANGUAGE)


@dataclass(frozen=True)
class ThreadSize:
    """
    Value object for thread size.
    Ensures valid thread size constraints.
    """
    value: int

    def __post_init__(self):
        """Validate thread size on creation"""
        if self.value < ValidationRules.MIN_THREAD_SIZE:
            raise ValidationError(f"Thread size must be at least {ValidationRules.MIN_THREAD_SIZE}")

        if self.value > ValidationRules.MAX_THREAD_SIZE:
            raise ValidationError(f"Thread size cannot exceed {ValidationRules.MAX_THREAD_SIZE}")

    def __int__(self) -> int:
        return self.value

    def __str__(self) -> str:
        return str(self.value)


@dataclass(frozen=True)
class UserContext:
    """
    Value object for user context.
    Provides optional context with validation.
    """
    value: Optional[str] = None

    def __post_init__(self):
        """Validate user context if provided"""
        if self.value is not None:
            if len(self.value) > ValidationRules.MAX_CONTENT_LENGTH:
                raise ValidationError(f"User context cannot exceed {ValidationRules.MAX_CONTENT_LENGTH} characters")

    def __str__(self) -> str:
        return self.value or ""

    @property
    def is_empty(self) -> bool:
        return not self.value or not self.value.strip()

    @property
    def length(self) -> int:
        return len(self.value) if self.value else 0


@dataclass(frozen=True)
class TweetContent:
    """
    Value object for tweet content.
    Ensures Twitter character limits and content validation.
    """
    value: str

    def __post_init__(self):
        """Validate tweet content on creation"""
        if not self.value or not self.value.strip():
            raise ValidationError("Tweet content cannot be empty")

        if len(self.value) > ValidationRules.MAX_TWEET_LENGTH:
            raise ValidationError(f"Tweet content cannot exceed {ValidationRules.MAX_TWEET_LENGTH} characters")

    def __str__(self) -> str:
        return self.value

    @property
    def length(self) -> int:
        return len(self.value)

    @property
    def remaining_characters(self) -> int:
        return ValidationRules.MAX_TWEET_LENGTH - self.length

    @property
    def hashtag_count(self) -> int:
        """Count hashtags in content"""
        import re
        return len(re.findall(r'#\w+', self.value))

    @property
    def mention_count(self) -> int:
        """Count mentions in content"""
        import re
        return len(re.findall(r'@\w+', self.value))
