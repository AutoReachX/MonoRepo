"""
Application constants to eliminate magic numbers and strings.
Following KISS principle by centralizing configuration values.
"""

# OpenAI Configuration
class OpenAIConstants:
    DEFAULT_MODEL = "gpt-4"
    TWEET_MAX_TOKENS = 280
    THREAD_MAX_TOKENS = 1000
    REPLY_MAX_TOKENS = 280
    DEFAULT_TEMPERATURE = 0.7
    DEFAULT_N = 1


# Twitter Configuration
class TwitterConstants:
    MAX_TWEET_LENGTH = 280
    MAX_THREAD_TWEETS = 25
    DEFAULT_THREAD_SIZE = 3


# Content Generation
class ContentConstants:
    DEFAULT_STYLE = "engaging"
    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "it", "pt"]
    SUPPORTED_STYLES = [
        "engaging",
        "professional", 
        "casual",
        "educational",
        "humorous",
        "informative",
        "helpful"
    ]


# Database Configuration
class DatabaseConstants:
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    DEFAULT_SKIP = 0


# Authentication
class AuthConstants:
    TOKEN_TYPE = "bearer"
    DEFAULT_TOKEN_EXPIRE_MINUTES = 30
    ALGORITHM = "HS256"


# Content Generation Modes
class ContentModes:
    NEW_TWEET = "new_tweet"
    REPLY = "reply"
    THREAD = "thread"
    REWRITE = "rewrite"


# Post Status
class PostStatus:
    PENDING = "pending"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"


# API Response Messages
class ResponseMessages:
    SUCCESS = "Operation completed successfully"
    CREATED = "Resource created successfully"
    UPDATED = "Resource updated successfully"
    DELETED = "Resource deleted successfully"
    NOT_FOUND = "Resource not found"
    UNAUTHORIZED = "Authentication required"
    FORBIDDEN = "Access denied"
    VALIDATION_ERROR = "Invalid input data"
    INTERNAL_ERROR = "Internal server error"
    EXTERNAL_SERVICE_ERROR = "External service unavailable"


# Validation Rules
class ValidationRules:
    MIN_TOPIC_LENGTH = 3
    MAX_TOPIC_LENGTH = 200
    MIN_CONTENT_LENGTH = 1
    MAX_CONTENT_LENGTH = 2000
    MIN_USERNAME_LENGTH = 3
    MAX_USERNAME_LENGTH = 50
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128


# Rate Limiting
class RateLimits:
    CONTENT_GENERATION_PER_HOUR = 50
    TWEET_POSTING_PER_HOUR = 100
    API_REQUESTS_PER_MINUTE = 60


# Cache Configuration
class CacheConstants:
    DEFAULT_TTL = 300  # 5 minutes
    USER_CACHE_TTL = 900  # 15 minutes
    CONTENT_CACHE_TTL = 1800  # 30 minutes
    ANALYTICS_CACHE_TTL = 3600  # 1 hour
