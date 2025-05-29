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
    MAX_RETRIES = 3
    RETRY_DELAY_SECONDS = 1
    TIMEOUT_SECONDS = 30


# Twitter Configuration
class TwitterConstants:
    MAX_TWEET_LENGTH = 280
    MAX_THREAD_TWEETS = 25
    DEFAULT_THREAD_SIZE = 3
    MAX_HASHTAGS_RECOMMENDED = 3
    MAX_MENTIONS_RECOMMENDED = 5
    RATE_LIMIT_WINDOW_MINUTES = 15
    MAX_TWEETS_PER_WINDOW = 300


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
    MIN_THREAD_SIZE = 2
    MAX_THREAD_SIZE = 25
    MAX_TWEET_LENGTH = 280


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


# API Configuration
class APIConstants:
    DEFAULT_TIMEOUT_SECONDS = 30
    MAX_REQUEST_SIZE_MB = 10
    CORS_MAX_AGE_SECONDS = 3600
    DEFAULT_PAGE = 1


# Error Messages
class ErrorMessages:
    INVALID_CREDENTIALS = "Invalid username or password"
    TOKEN_EXPIRED = "Authentication token has expired"
    INSUFFICIENT_PERMISSIONS = "Insufficient permissions for this action"
    CONTENT_TOO_LONG = "Content exceeds maximum length"
    INVALID_TOPIC = "Topic must be between {min} and {max} characters"
    GENERATION_FAILED = "Content generation failed. Please try again."
    RATE_LIMIT_EXCEEDED = "Rate limit exceeded. Please try again later."
    EXTERNAL_API_ERROR = "External service is temporarily unavailable"
    VALIDATION_ERROR = "Invalid input data"
    UNAUTHORIZED = "Authentication required"


# Success Messages
class SuccessMessages:
    CONTENT_GENERATED = "Content generated successfully"
    TWEET_POSTED = "Tweet posted successfully"
    USER_CREATED = "User account created successfully"
    SETTINGS_UPDATED = "Settings updated successfully"
    LOGIN_SUCCESSFUL = "Login successful"
    LOGOUT_SUCCESSFUL = "Logout successful"
