#!/usr/bin/env python3
"""
Test script to verify SOLID & KISS improvements are working correctly.
This script tests the new backend utilities and services.
"""

import sys
import os
import asyncio
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_constants():
    """Test that all constants are properly defined"""
    print("🧪 Testing Constants...")
    
    try:
        from app.core.constants import (
            TwitterConstants, OpenAIConstants, ContentConstants,
            ValidationRules, ErrorMessages, SuccessMessages
        )
        
        # Test Twitter constants
        assert TwitterConstants.MAX_TWEET_LENGTH == 280
        assert TwitterConstants.MAX_THREAD_TWEETS == 25
        print("✅ Twitter constants working")
        
        # Test validation rules
        assert ValidationRules.MIN_TOPIC_LENGTH == 3
        assert ValidationRules.MAX_TOPIC_LENGTH == 200
        print("✅ Validation rules working")
        
        # Test error messages
        assert hasattr(ErrorMessages, 'GENERATION_FAILED')
        assert hasattr(SuccessMessages, 'CONTENT_GENERATED')
        print("✅ Error/Success messages working")
        
        print("✅ All constants tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Constants test failed: {e}\n")
        return False


def test_validation_utilities():
    """Test the new validation utilities"""
    print("🧪 Testing Validation Utilities...")
    
    try:
        from app.core.validation_utils import (
            ValidationResult, TwitterContentValidator, 
            ContentValidator, validate_content_generation_request
        )
        
        # Test ValidationResult
        result = ValidationResult()
        assert result.is_valid == True
        assert result.errors == []
        
        result.add_error("Test error")
        assert result.is_valid == False
        assert "Test error" in result.errors
        print("✅ ValidationResult working")
        
        # Test topic validation
        valid_topic = ContentValidator.validate_topic("This is a valid topic")
        assert valid_topic.is_valid == True
        
        invalid_topic = ContentValidator.validate_topic("")
        assert invalid_topic.is_valid == False
        print("✅ Topic validation working")
        
        # Test tweet content validation
        valid_tweet = TwitterContentValidator.validate_tweet_content("Valid tweet content")
        assert valid_tweet.is_valid == True
        
        long_tweet = TwitterContentValidator.validate_tweet_content("x" * 300)
        assert long_tweet.is_valid == False
        print("✅ Tweet validation working")
        
        # Test content generation request validation
        valid_request = {
            "topic": "Test topic",
            "style": "engaging",
            "language": "en"
        }
        request_result = validate_content_generation_request(valid_request)
        assert request_result.is_valid == True
        print("✅ Content generation request validation working")
        
        print("✅ All validation utilities tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Validation utilities test failed: {e}\n")
        return False


def test_error_handlers():
    """Test the new error handling utilities"""
    print("🧪 Testing Error Handlers...")
    
    try:
        from app.core.error_handlers import (
            ErrorResponseBuilder, ServiceErrorHandler, handle_service_errors
        )
        from app.core.exceptions import ValidationError
        
        # Test ErrorResponseBuilder
        validation_error = ErrorResponseBuilder.validation_error("Test validation error")
        assert validation_error["error"] == "validation_error"
        assert validation_error["status_code"] == 400
        print("✅ ErrorResponseBuilder working")
        
        # Test ServiceErrorHandler
        error_handler = ServiceErrorHandler("test_service")
        assert error_handler.logger.name == "test_service"
        print("✅ ServiceErrorHandler working")
        
        # Test decorator (basic structure)
        @handle_service_errors
        async def test_function():
            return {"success": True}
        
        # The decorator should exist and be callable
        assert callable(test_function)
        print("✅ Error handling decorator working")
        
        print("✅ All error handler tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Error handlers test failed: {e}\n")
        return False


def test_ai_provider_factory():
    """Test the AI provider factory"""
    print("🧪 Testing AI Provider Factory...")
    
    try:
        from app.core.ai_provider_factory import AIProviderFactory
        
        # Test that factory exists and has methods
        assert hasattr(AIProviderFactory, 'create_provider')
        assert hasattr(AIProviderFactory, 'get_available_providers')
        assert hasattr(AIProviderFactory, 'is_provider_available')
        print("✅ AI Provider Factory structure working")
        
        # Test available providers
        providers = AIProviderFactory.get_available_providers()
        assert isinstance(providers, list)
        print(f"✅ Available providers: {providers}")
        
        print("✅ AI Provider Factory tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ AI Provider Factory test failed: {e}\n")
        return False


def test_service_structure():
    """Test the new service structure"""
    print("🧪 Testing Service Structure...")
    
    try:
        # Test that services can be imported
        from app.services.content_generation_service import ContentGenerationService
        from app.services.content_logging_service import ContentLoggingService
        from app.services.content_orchestration_service import ContentOrchestrationService
        
        print("✅ Content generation service importable")
        print("✅ Content logging service importable")
        print("✅ Content orchestration service importable")
        
        # Test dependencies
        from app.core.dependencies import (
            get_content_generation_service,
            get_content_logging_service,
            get_content_orchestration_service
        )
        
        print("✅ Service dependencies importable")
        
        print("✅ All service structure tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Service structure test failed: {e}\n")
        return False


def test_interfaces():
    """Test the new interface segregation"""
    print("🧪 Testing Interface Segregation...")
    
    try:
        from app.core.interfaces import (
            TweetGeneratorInterface,
            ThreadGeneratorInterface,
            ReplyGeneratorInterface,
            ContentGeneratorInterface,
            TweetPostingInterface,
            UserProfileInterface,
            TweetAnalyticsInterface,
            SocialMediaInterface
        )
        
        # Test that interfaces exist
        print("✅ Tweet generator interface exists")
        print("✅ Thread generator interface exists")
        print("✅ Reply generator interface exists")
        print("✅ Content generator interface exists")
        print("✅ Tweet posting interface exists")
        print("✅ User profile interface exists")
        print("✅ Tweet analytics interface exists")
        print("✅ Social media interface exists")
        
        # Test that composite interfaces inherit from segregated ones
        assert issubclass(ContentGeneratorInterface, TweetGeneratorInterface)
        assert issubclass(ContentGeneratorInterface, ThreadGeneratorInterface)
        assert issubclass(ContentGeneratorInterface, ReplyGeneratorInterface)
        print("✅ Content generator interface properly inherits")
        
        assert issubclass(SocialMediaInterface, TweetPostingInterface)
        assert issubclass(SocialMediaInterface, UserProfileInterface)
        assert issubclass(SocialMediaInterface, TweetAnalyticsInterface)
        print("✅ Social media interface properly inherits")
        
        print("✅ All interface segregation tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Interface segregation test failed: {e}\n")
        return False


def main():
    """Run all tests"""
    print("🚀 Starting SOLID & KISS Improvements Test Suite\n")
    print("=" * 60)
    
    tests = [
        test_constants,
        test_validation_utilities,
        test_error_handlers,
        test_ai_provider_factory,
        test_service_structure,
        test_interfaces
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The improvements are working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} tests failed. Please review the issues above.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
