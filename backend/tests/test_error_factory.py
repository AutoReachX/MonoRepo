"""
Unit tests for error factory.
Tests consistent error creation patterns.
"""

import pytest
from fastapi import HTTPException, status
from app.core.error_factory import ErrorFactory, HTTPErrorFactory
from app.core.exceptions import (
    ValidationError,
    ContentGenerationError,
    DatabaseError,
    OpenAIAPIError
)


class TestErrorFactory:
    """Test ErrorFactory for consistent error creation"""
    
    def test_create_validation_error(self):
        """Test creating validation error"""
        error = ErrorFactory.create_validation_error(
            field="topic",
            message="is required",
            details={"code": "REQUIRED"}
        )
        
        assert isinstance(error, ValidationError)
        assert str(error) == "topic: is required"
        assert error.details == {"code": "REQUIRED"}
    
    def test_create_validation_error_without_field(self):
        """Test creating validation error without field name"""
        error = ErrorFactory.create_validation_error(
            field="",
            message="Invalid input data"
        )
        
        assert isinstance(error, ValidationError)
        assert str(error) == "Invalid input data"
    
    def test_create_content_generation_error(self):
        """Test creating content generation error"""
        error = ErrorFactory.create_content_generation_error(
            operation="tweet generation",
            cause="API timeout",
            details={"timeout": 30}
        )
        
        assert isinstance(error, ContentGenerationError)
        assert str(error) == "tweet generation failed: API timeout"
        assert error.details == {"timeout": 30}
    
    def test_create_content_generation_error_without_cause(self):
        """Test creating content generation error without cause"""
        error = ErrorFactory.create_content_generation_error(
            operation="tweet generation"
        )
        
        assert isinstance(error, ContentGenerationError)
        assert str(error) == "tweet generation failed"
    
    def test_create_database_error(self):
        """Test creating database error"""
        error = ErrorFactory.create_database_error(
            operation="insert",
            cause="connection timeout",
            details={"table": "content_logs"}
        )
        
        assert isinstance(error, DatabaseError)
        assert str(error) == "Database insert failed: connection timeout"
        assert error.details == {"table": "content_logs"}
    
    def test_create_database_error_without_cause(self):
        """Test creating database error without cause"""
        error = ErrorFactory.create_database_error(
            operation="insert"
        )
        
        assert isinstance(error, DatabaseError)
        assert str(error) == "Database insert failed"
    
    def test_create_api_error(self):
        """Test creating API error"""
        error = ErrorFactory.create_api_error(
            service="OpenAI",
            status_code=429,
            message="Rate limit exceeded",
            details={"retry_after": 60}
        )
        
        assert isinstance(error, OpenAIAPIError)
        assert str(error) == "OpenAI API error (status 429): Rate limit exceeded"
        assert error.details == {"retry_after": 60}
    
    def test_create_api_error_without_message(self):
        """Test creating API error without message"""
        error = ErrorFactory.create_api_error(
            service="OpenAI",
            status_code=500
        )
        
        assert isinstance(error, OpenAIAPIError)
        assert str(error) == "OpenAI API error (status 500)"


class TestHTTPErrorFactory:
    """Test HTTPErrorFactory for consistent HTTP error responses"""
    
    def test_create_validation_http_error(self):
        """Test creating HTTP validation error"""
        errors = ["Topic is required", "Style is invalid"]
        details = {"field_count": 2}
        
        error = HTTPErrorFactory.create_validation_http_error(errors, details)
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_400_BAD_REQUEST
        assert error.detail["errors"] == errors
        assert error.detail["details"] == details
    
    def test_create_not_found_http_error(self):
        """Test creating HTTP not found error"""
        error = HTTPErrorFactory.create_not_found_http_error(
            resource="User",
            identifier="123"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert "User with identifier '123' not found" in error.detail["message"]
        assert error.detail["resource"] == "User"
        assert error.detail["identifier"] == "123"
    
    def test_create_not_found_http_error_without_identifier(self):
        """Test creating HTTP not found error without identifier"""
        error = HTTPErrorFactory.create_not_found_http_error(
            resource="User"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found" in error.detail["message"]
        assert error.detail["resource"] == "User"
        assert error.detail["identifier"] is None
    
    def test_create_unauthorized_http_error(self):
        """Test creating HTTP unauthorized error"""
        error = HTTPErrorFactory.create_unauthorized_http_error(
            message="Invalid token"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_401_UNAUTHORIZED
        assert error.detail["message"] == "Invalid token"
        assert error.detail["code"] == "UNAUTHORIZED"
    
    def test_create_unauthorized_http_error_default_message(self):
        """Test creating HTTP unauthorized error with default message"""
        error = HTTPErrorFactory.create_unauthorized_http_error()
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_401_UNAUTHORIZED
        assert "code" in error.detail
    
    def test_create_forbidden_http_error(self):
        """Test creating HTTP forbidden error"""
        error = HTTPErrorFactory.create_forbidden_http_error(
            resource="content",
            action="delete"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert "cannot delete content" in error.detail["message"]
        assert error.detail["resource"] == "content"
        assert error.detail["action"] == "delete"
    
    def test_create_forbidden_http_error_minimal(self):
        """Test creating HTTP forbidden error with minimal info"""
        error = HTTPErrorFactory.create_forbidden_http_error()
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert "Access denied" in error.detail["message"]
    
    def test_create_rate_limit_http_error(self):
        """Test creating HTTP rate limit error"""
        error = HTTPErrorFactory.create_rate_limit_http_error(
            limit=100,
            window="1 hour"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "100 requests per 1 hour" in error.detail["message"]
        assert error.detail["limit"] == 100
        assert error.detail["window"] == "1 hour"
    
    def test_create_rate_limit_http_error_default(self):
        """Test creating HTTP rate limit error with defaults"""
        error = HTTPErrorFactory.create_rate_limit_http_error()
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "code" in error.detail
    
    def test_create_internal_server_http_error(self):
        """Test creating HTTP internal server error"""
        error = HTTPErrorFactory.create_internal_server_http_error(
            message="Database connection failed",
            error_id="ERR-123"
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert error.detail["message"] == "Database connection failed"
        assert error.detail["error_id"] == "ERR-123"
    
    def test_create_service_unavailable_http_error(self):
        """Test creating HTTP service unavailable error"""
        error = HTTPErrorFactory.create_service_unavailable_http_error(
            service="OpenAI",
            retry_after=60
        )
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "OpenAI service is currently unavailable" in error.detail["message"]
        assert error.detail["service"] == "OpenAI"
        assert error.detail["retry_after"] == 60
        assert error.headers["Retry-After"] == "60"
    
    def test_create_service_unavailable_http_error_minimal(self):
        """Test creating HTTP service unavailable error with minimal info"""
        error = HTTPErrorFactory.create_service_unavailable_http_error()
        
        assert isinstance(error, HTTPException)
        assert error.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "Service temporarily unavailable" in error.detail["message"]
