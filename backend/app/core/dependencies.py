"""
Dependency injection container for services.
Following Dependency Inversion Principle.
"""

from functools import lru_cache
from app.services.openai_service import create_openai_service
from app.services.twitter_service import create_twitter_service
from app.services.validation_service import ValidationService
from app.services.content_service import ContentService
from app.core.interfaces import ContentGeneratorInterface


class ServiceContainer:
    """Container for managing service dependencies"""

    def __init__(self):
        self._services = {}

    def register_service(self, interface_type: type, implementation: object) -> None:
        """Register a service implementation for an interface"""
        self._services[interface_type] = implementation

    def get_service(self, interface_type: type) -> object:
        """Get a service implementation by interface type"""
        if interface_type not in self._services:
            raise ValueError(f"Service not registered for {interface_type}")
        return self._services[interface_type]


# Global service container
_container = ServiceContainer()


@lru_cache()
def get_openai_service() -> ContentGeneratorInterface:
    """Get OpenAI service instance"""
    return create_openai_service()


@lru_cache()
def get_twitter_service():
    """Get Twitter service instance"""
    return create_twitter_service()


@lru_cache()
def get_validation_service() -> ValidationService:
    """Get validation service instance"""
    return ValidationService()


@lru_cache()
def get_content_service() -> ContentService:
    """Get content service instance"""
    return ContentService(
        content_generator=get_openai_service(),
        validation_service=get_validation_service()
    )


# Initialize services lazily when needed
def initialize_services():
    """Initialize all services in the container"""
    try:
        _container.register_service(ContentGeneratorInterface, get_openai_service())
        _container.register_service(ValidationService, get_validation_service())
        _container.register_service(ContentService, get_content_service())
    except Exception:
        # Allow initialization to fail gracefully for testing
        pass
