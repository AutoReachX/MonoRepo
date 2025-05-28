"""
Dependency injection for services.
Simplified to follow KISS principle while maintaining Dependency Inversion Principle.
"""

from functools import lru_cache
from app.services.twitter_service import create_twitter_service
from app.services.validation_service import ValidationService
from app.services.content_generation_service import create_content_generation_service
from app.services.content_logging_service import create_content_logging_service
from app.services.content_orchestration_service import create_content_orchestration_service
from app.core.interfaces import ContentGeneratorInterface
from app.core.ai_provider_factory import create_default_provider


# Simplified dependency injection using FastAPI's built-in caching
@lru_cache()
def get_ai_provider() -> ContentGeneratorInterface:
    """Get AI provider instance (defaults to OpenAI)"""
    return create_default_provider()


@lru_cache()
def get_twitter_service():
    """Get Twitter service instance"""
    return create_twitter_service()


@lru_cache()
def get_validation_service() -> ValidationService:
    """Get validation service instance"""
    return ValidationService()


@lru_cache()
def get_content_generation_service():
    """Get content generation service instance"""
    return create_content_generation_service(
        content_generator=get_ai_provider()
    )


@lru_cache()
def get_content_logging_service():
    """Get content logging service instance"""
    return create_content_logging_service()


@lru_cache()
def get_content_orchestration_service():
    """Get content orchestration service instance"""
    return create_content_orchestration_service(
        generation_service=get_content_generation_service(),
        logging_service=get_content_logging_service(),
        validation_service=get_validation_service()
    )


# Backward compatibility - this will be the main service used by API endpoints
@lru_cache()
def get_content_service():
    """Get content service instance (orchestration service for backward compatibility)"""
    return get_content_orchestration_service()
