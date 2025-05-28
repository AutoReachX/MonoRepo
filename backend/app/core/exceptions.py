"""
Custom exceptions for the AutoReach application.
Following SOLID principles by creating specific exception types.
"""

from fastapi import HTTPException, status
from typing import Optional, Dict, Any


class AutoReachException(Exception):
    """Base exception for AutoReach application"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AutoReachException):
    """Raised when input validation fails"""
    pass


class AuthenticationError(AutoReachException):
    """Raised when authentication fails"""
    pass


class AuthorizationError(AutoReachException):
    """Raised when user lacks permission"""
    pass


class ExternalServiceError(AutoReachException):
    """Raised when external service calls fail"""
    pass


class TwitterAPIError(ExternalServiceError):
    """Raised when Twitter API calls fail"""
    pass


class OpenAIAPIError(ExternalServiceError):
    """Raised when OpenAI API calls fail"""
    pass


class DatabaseError(AutoReachException):
    """Raised when database operations fail"""
    pass


class ContentGenerationError(AutoReachException):
    """Raised when content generation fails"""
    pass


def create_http_exception(
    exception: AutoReachException,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
) -> HTTPException:
    """Convert AutoReach exception to HTTP exception"""
    return HTTPException(
        status_code=status_code,
        detail={
            "message": exception.message,
            "details": exception.details
        }
    )


# Exception mapping for common cases
EXCEPTION_STATUS_MAP = {
    ValidationError: status.HTTP_400_BAD_REQUEST,
    AuthenticationError: status.HTTP_401_UNAUTHORIZED,
    AuthorizationError: status.HTTP_403_FORBIDDEN,
    TwitterAPIError: status.HTTP_502_BAD_GATEWAY,
    OpenAIAPIError: status.HTTP_502_BAD_GATEWAY,
    DatabaseError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ContentGenerationError: status.HTTP_500_INTERNAL_SERVER_ERROR,
}


def handle_exception(exception: AutoReachException) -> HTTPException:
    """Handle AutoReach exceptions with appropriate HTTP status codes"""
    status_code = EXCEPTION_STATUS_MAP.get(type(exception), status.HTTP_500_INTERNAL_SERVER_ERROR)
    return create_http_exception(exception, status_code)
