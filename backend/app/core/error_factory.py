"""
Error factory for consistent error creation.
Follows Factory pattern and eliminates error creation inconsistencies.
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from app.core.exceptions import (
    ValidationError,
    ContentGenerationError,
    DatabaseError,
    OpenAIAPIError
)
from app.core.constants import ErrorMessages, ResponseMessages


class ErrorFactory:
    """
    Factory class for creating consistent errors across the application.
    Follows Factory pattern and Single Responsibility Principle.
    """
    
    @staticmethod
    def create_validation_error(
        field: str, 
        message: str, 
        details: Optional[Dict[str, Any]] = None
    ) -> ValidationError:
        """
        Create a validation error with consistent formatting.
        
        Args:
            field: The field that failed validation
            message: The validation error message
            details: Optional additional details
            
        Returns:
            ValidationError: Formatted validation error
        """
        error_message = f"{field}: {message}" if field else message
        return ValidationError(error_message, details)
    
    @staticmethod
    def create_content_generation_error(
        operation: str,
        cause: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> ContentGenerationError:
        """
        Create a content generation error with consistent formatting.
        
        Args:
            operation: The operation that failed
            cause: Optional cause of the error
            details: Optional additional details
            
        Returns:
            ContentGenerationError: Formatted content generation error
        """
        if cause:
            message = f"{operation} failed: {cause}"
        else:
            message = f"{operation} failed"
        
        return ContentGenerationError(message, details)
    
    @staticmethod
    def create_database_error(
        operation: str,
        cause: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> DatabaseError:
        """
        Create a database error with consistent formatting.
        
        Args:
            operation: The database operation that failed
            cause: Optional cause of the error
            details: Optional additional details
            
        Returns:
            DatabaseError: Formatted database error
        """
        if cause:
            message = f"Database {operation} failed: {cause}"
        else:
            message = f"Database {operation} failed"
        
        return DatabaseError(message, details)
    
    @staticmethod
    def create_api_error(
        service: str,
        status_code: int,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> OpenAIAPIError:
        """
        Create an external API error with consistent formatting.
        
        Args:
            service: The external service name
            status_code: HTTP status code from the service
            message: Optional error message
            details: Optional additional details
            
        Returns:
            OpenAIAPIError: Formatted API error
        """
        if message:
            error_message = f"{service} API error (status {status_code}): {message}"
        else:
            error_message = f"{service} API error (status {status_code})"
        
        return OpenAIAPIError(error_message, details)


class HTTPErrorFactory:
    """
    Factory class for creating HTTP exceptions with consistent formatting.
    Follows Factory pattern and provides standardized HTTP responses.
    """
    
    @staticmethod
    def create_validation_http_error(
        errors: List[str],
        details: Optional[Dict[str, Any]] = None
    ) -> HTTPException:
        """
        Create an HTTP validation error response.
        
        Args:
            errors: List of validation error messages
            details: Optional additional details
            
        Returns:
            HTTPException: HTTP 400 Bad Request with validation errors
        """
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": ErrorMessages.VALIDATION_ERROR,
                "errors": errors,
                "details": details
            }
        )
    
    @staticmethod
    def create_not_found_http_error(
        resource: str,
        identifier: Optional[str] = None
    ) -> HTTPException:
        """
        Create an HTTP not found error response.
        
        Args:
            resource: The resource that was not found
            identifier: Optional identifier of the resource
            
        Returns:
            HTTPException: HTTP 404 Not Found
        """
        if identifier:
            message = f"{resource} with identifier '{identifier}' not found"
        else:
            message = f"{resource} not found"
        
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": message,
                "resource": resource,
                "identifier": identifier
            }
        )
    
    @staticmethod
    def create_unauthorized_http_error(
        message: Optional[str] = None
    ) -> HTTPException:
        """
        Create an HTTP unauthorized error response.
        
        Args:
            message: Optional custom message
            
        Returns:
            HTTPException: HTTP 401 Unauthorized
        """
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": message or ErrorMessages.UNAUTHORIZED,
                "code": "UNAUTHORIZED"
            }
        )
    
    @staticmethod
    def create_forbidden_http_error(
        resource: Optional[str] = None,
        action: Optional[str] = None
    ) -> HTTPException:
        """
        Create an HTTP forbidden error response.
        
        Args:
            resource: Optional resource being accessed
            action: Optional action being performed
            
        Returns:
            HTTPException: HTTP 403 Forbidden
        """
        if resource and action:
            message = f"Access denied: cannot {action} {resource}"
        elif resource:
            message = f"Access denied to {resource}"
        else:
            message = "Access denied"
        
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": message,
                "code": "FORBIDDEN",
                "resource": resource,
                "action": action
            }
        )
    
    @staticmethod
    def create_rate_limit_http_error(
        limit: Optional[int] = None,
        window: Optional[str] = None
    ) -> HTTPException:
        """
        Create an HTTP rate limit error response.
        
        Args:
            limit: Optional rate limit number
            window: Optional time window (e.g., "1 hour")
            
        Returns:
            HTTPException: HTTP 429 Too Many Requests
        """
        if limit and window:
            message = f"Rate limit exceeded: {limit} requests per {window}"
        else:
            message = ErrorMessages.RATE_LIMIT_EXCEEDED
        
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": message,
                "code": "RATE_LIMIT_EXCEEDED",
                "limit": limit,
                "window": window
            }
        )
    
    @staticmethod
    def create_internal_server_http_error(
        message: Optional[str] = None,
        error_id: Optional[str] = None
    ) -> HTTPException:
        """
        Create an HTTP internal server error response.
        
        Args:
            message: Optional custom message
            error_id: Optional error tracking ID
            
        Returns:
            HTTPException: HTTP 500 Internal Server Error
        """
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": message or ResponseMessages.INTERNAL_ERROR,
                "code": "INTERNAL_SERVER_ERROR",
                "error_id": error_id
            }
        )
    
    @staticmethod
    def create_service_unavailable_http_error(
        service: Optional[str] = None,
        retry_after: Optional[int] = None
    ) -> HTTPException:
        """
        Create an HTTP service unavailable error response.
        
        Args:
            service: Optional service name that is unavailable
            retry_after: Optional retry after seconds
            
        Returns:
            HTTPException: HTTP 503 Service Unavailable
        """
        if service:
            message = f"{service} service is currently unavailable"
        else:
            message = "Service temporarily unavailable"
        
        headers = {}
        if retry_after:
            headers["Retry-After"] = str(retry_after)
        
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": message,
                "code": "SERVICE_UNAVAILABLE",
                "service": service,
                "retry_after": retry_after
            },
            headers=headers
        )
