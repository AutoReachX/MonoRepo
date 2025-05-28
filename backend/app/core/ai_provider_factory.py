"""
AI Provider Factory following Open/Closed Principle.
Makes it easy to add new AI providers without modifying existing code.
"""

from typing import Optional, Dict, Any
from app.core.interfaces import ContentGeneratorInterface
from app.core.exceptions import ValidationError
from app.core.constants import ErrorMessages


class AIProviderFactory:
    """
    Factory for creating AI provider instances.
    Follows Open/Closed Principle - open for extension, closed for modification.
    """
    
    _providers: Dict[str, type] = {}
    
    @classmethod
    def register_provider(cls, provider_name: str, provider_class: type) -> None:
        """
        Register a new AI provider.
        This allows adding new providers without modifying existing code.
        """
        if not issubclass(provider_class, ContentGeneratorInterface):
            raise ValidationError(f"Provider {provider_class} must implement ContentGeneratorInterface")
        
        cls._providers[provider_name.lower()] = provider_class
    
    @classmethod
    def create_provider(
        cls, 
        provider_name: str, 
        **kwargs
    ) -> ContentGeneratorInterface:
        """
        Create an AI provider instance.
        
        Args:
            provider_name: Name of the provider (e.g., 'openai', 'anthropic')
            **kwargs: Provider-specific configuration
            
        Returns:
            ContentGeneratorInterface: Provider instance
            
        Raises:
            ValidationError: If provider is not registered
        """
        provider_name = provider_name.lower()
        
        if provider_name not in cls._providers:
            available_providers = ', '.join(cls._providers.keys())
            raise ValidationError(
                f"Unknown AI provider: {provider_name}. "
                f"Available providers: {available_providers}"
            )
        
        provider_class = cls._providers[provider_name]
        return provider_class(**kwargs)
    
    @classmethod
    def get_available_providers(cls) -> list[str]:
        """Get list of available provider names"""
        return list(cls._providers.keys())
    
    @classmethod
    def is_provider_available(cls, provider_name: str) -> bool:
        """Check if a provider is available"""
        return provider_name.lower() in cls._providers


# Auto-register built-in providers
def _register_builtin_providers():
    """Register built-in AI providers"""
    try:
        from app.services.openai_service import OpenAIService
        AIProviderFactory.register_provider('openai', OpenAIService)
    except ImportError:
        pass  # OpenAI service not available
    
    # Future providers can be registered here
    # try:
    #     from app.services.anthropic_service import AnthropicService
    #     AIProviderFactory.register_provider('anthropic', AnthropicService)
    # except ImportError:
    #     pass


# Register providers on module import
_register_builtin_providers()


class AIProviderConfig:
    """
    Configuration class for AI providers.
    Follows Single Responsibility Principle.
    """
    
    def __init__(self, provider_name: str, **config):
        self.provider_name = provider_name
        self.config = config
    
    def create_provider(self) -> ContentGeneratorInterface:
        """Create provider instance with this configuration"""
        return AIProviderFactory.create_provider(self.provider_name, **self.config)
    
    def validate_config(self) -> bool:
        """Validate provider configuration"""
        # Basic validation - can be extended per provider
        if not self.provider_name:
            return False
        
        if not AIProviderFactory.is_provider_available(self.provider_name):
            return False
        
        return True


class AIProviderManager:
    """
    Manager for handling multiple AI providers.
    Follows Single Responsibility Principle.
    """
    
    def __init__(self, default_provider: str = 'openai'):
        self.default_provider = default_provider
        self._provider_configs: Dict[str, AIProviderConfig] = {}
        self._provider_instances: Dict[str, ContentGeneratorInterface] = {}
    
    def add_provider_config(self, name: str, config: AIProviderConfig) -> None:
        """Add a provider configuration"""
        if not config.validate_config():
            raise ValidationError(f"Invalid configuration for provider: {name}")
        
        self._provider_configs[name] = config
    
    def get_provider(self, name: Optional[str] = None) -> ContentGeneratorInterface:
        """
        Get a provider instance.
        
        Args:
            name: Provider name, uses default if None
            
        Returns:
            ContentGeneratorInterface: Provider instance
        """
        provider_name = name or self.default_provider
        
        # Return cached instance if available
        if provider_name in self._provider_instances:
            return self._provider_instances[provider_name]
        
        # Create new instance
        if provider_name not in self._provider_configs:
            raise ValidationError(f"No configuration found for provider: {provider_name}")
        
        config = self._provider_configs[provider_name]
        provider = config.create_provider()
        
        # Cache the instance
        self._provider_instances[provider_name] = provider
        
        return provider
    
    def set_default_provider(self, provider_name: str) -> None:
        """Set the default provider"""
        if provider_name not in self._provider_configs:
            raise ValidationError(f"Provider not configured: {provider_name}")
        
        self.default_provider = provider_name
    
    def get_available_providers(self) -> list[str]:
        """Get list of configured provider names"""
        return list(self._provider_configs.keys())


# Convenience functions for common use cases
def create_openai_provider(api_key: Optional[str] = None, **kwargs) -> ContentGeneratorInterface:
    """Create OpenAI provider with simplified interface"""
    config = {'api_key': api_key, **kwargs}
    return AIProviderFactory.create_provider('openai', **config)


def create_default_provider() -> ContentGeneratorInterface:
    """Create default AI provider"""
    return create_openai_provider()


# Example of how to add a new provider (for future use):
"""
# To add a new provider, create the service class:

class AnthropicService(ContentGeneratorInterface):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        # Initialize Anthropic client
    
    async def generate_tweet(self, topic: str, style: str = "engaging", 
                           user_context: Optional[str] = None, 
                           language: str = "en") -> Dict[str, Any]:
        # Implementation
        pass
    
    # ... other required methods

# Then register it:
AIProviderFactory.register_provider('anthropic', AnthropicService)

# Now it can be used:
provider = AIProviderFactory.create_provider('anthropic', api_key='your-key')
"""
