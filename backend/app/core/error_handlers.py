"""
Common error handling utilities to eliminate duplicate error handling patterns.
Following DRY principle and KISS principle.
"""

from functools import wraps
from typing import Callable, Any, Dict, Optional
from fastapi import HTTPException, status
import logging

from app.core.exceptions import (
    ValidationError,
    ContentGenerationError,
    DatabaseError,
    OpenAIAPIError
)
from app.core.constants import ErrorMessages, ResponseMessages

logger = logging.getLogger(__name__)


def handle_service_errors(func: Callable) -> Callable:
    """
    Decorator to handle common service errors and convert them to HTTP exceptions.
    Follows Single Responsibility Principle by centralizing error handling.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ValidationError as e:
            logger.warning(f"Validation error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except ContentGenerationError as e:
            logger.error(f"Content generation error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ErrorMessages.GENERATION_FAILED
            )
        except OpenAIAPIError as e:
            logger.error(f"OpenAI API error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=ErrorMessages.EXTERNAL_API_ERROR
            )
        except DatabaseError as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ResponseMessages.INTERNAL_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ResponseMessages.INTERNAL_ERROR
            )
    return wrapper


def handle_sync_service_errors(func: Callable) -> Callable:
    """
    Decorator for synchronous functions that need error handling.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            logger.warning(f"Validation error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except DatabaseError as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ResponseMessages.INTERNAL_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ResponseMessages.INTERNAL_ERROR
            )
    return wrapper


class ErrorResponseBuilder:
    """
    Builder class for creating consistent error responses.
    Follows Builder pattern and Single Responsibility Principle.
    """

    @staticmethod
    def validation_error(message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a validation error response"""
        response = {
            "error": "validation_error",
            "message": message,
            "status_code": 400
        }
        if details:
            response["details"] = details
        return response

    @staticmethod
    def not_found_error(resource: str) -> Dict[str, Any]:
        """Create a not found error response"""
        return {
            "error": "not_found",
            "message": f"{resource} not found",
            "status_code": 404
        }

    @staticmethod
    def unauthorized_error() -> Dict[str, Any]:
        """Create an unauthorized error response"""
        return {
            "error": "unauthorized",
            "message": ErrorMessages.INVALID_CREDENTIALS,
            "status_code": 401
        }

    @staticmethod
    def forbidden_error() -> Dict[str, Any]:
        """Create a forbidden error response"""
        return {
            "error": "forbidden",
            "message": ErrorMessages.INSUFFICIENT_PERMISSIONS,
            "status_code": 403
        }

    @staticmethod
    def rate_limit_error() -> Dict[str, Any]:
        """Create a rate limit error response"""
        return {
            "error": "rate_limit_exceeded",
            "message": ErrorMessages.RATE_LIMIT_EXCEEDED,
            "status_code": 429
        }

    @staticmethod
    def internal_error() -> Dict[str, Any]:
        """Create an internal server error response"""
        return {
            "error": "internal_error",
            "message": ResponseMessages.INTERNAL_ERROR,
            "status_code": 500
        }


class ServiceErrorHandler:
    """
    Centralized error handling for service layer.
    Follows Single Responsibility Principle.
    """

    def __init__(self, logger_name: str):
        self.logger = logging.getLogger(logger_name)

    def handle_validation_error(self, error: ValidationError, context: str = "") -> None:
        """Handle validation errors with proper logging"""
        self.logger.warning(f"Validation error{' in ' + context if context else ''}: {str(error)}")
        raise error

    def handle_generation_error(self, error: Exception, context: str = "") -> None:
        """Handle content generation errors"""
        self.logger.error(f"Generation error{' in ' + context if context else ''}: {str(error)}")
        raise ContentGenerationError(f"Content generation failed: {str(error)}")

    def handle_database_error(self, error: Exception, context: str = "") -> None:
        """Handle database errors"""
        self.logger.error(f"Database error{' in ' + context if context else ''}: {str(error)}")
        raise DatabaseError(f"Database operation failed: {str(error)}")

    def handle_external_api_error(self, error: Exception, service: str, context: str = "") -> None:
        """Handle external API errors"""
        self.logger.error(f"{service} API error{' in ' + context if context else ''}: {str(error)}")
        raise OpenAIAPIError(f"{service} API error: {str(error)}")


def log_and_raise_http_exception(
    status_code: int,
    detail: str,
    logger: logging.Logger,
    context: str = ""
) -> None:
    """
    Utility function to log and raise HTTP exceptions consistently.
    """
    log_message = f"HTTP {status_code}{' in ' + context if context else ''}: {detail}"

    if status_code >= 500:
        logger.error(log_message)
    elif status_code >= 400:
        logger.warning(log_message)
    else:
        logger.info(log_message)

    raise HTTPException(status_code=status_code, detail=detail)


# Common error handling patterns
def safe_execute(func: Callable, error_handler: ServiceErrorHandler, context: str = "") -> Any:
    """
    Safely execute a function with proper error handling.
    """
    try:
        return func()
    except ValidationError as e:
        error_handler.handle_validation_error(e, context)
    except DatabaseError as e:
        error_handler.handle_database_error(e, context)
    except Exception as e:
        error_handler.handle_generation_error(e, context)
