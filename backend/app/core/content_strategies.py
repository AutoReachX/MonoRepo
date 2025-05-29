"""
Content generation strategies following Strategy pattern.
Eliminates complex conditional logic and improves extensibility.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from app.core.types import ContentGenerationResult
from app.core.interfaces import ContentGeneratorInterface


class ContentGenerationStrategy(ABC):
    """
    Abstract base class for content generation strategies.
    Follows Strategy pattern and Open/Closed Principle.
    """
    
    def __init__(self, content_generator: ContentGeneratorInterface):
        self.content_generator = content_generator
    
    @abstractmethod
    async def generate(self, **kwargs) -> ContentGenerationResult:
        """Generate content using the specific strategy"""
        pass
    
    @abstractmethod
    def validate_parameters(self, **kwargs) -> bool:
        """Validate parameters specific to this strategy"""
        pass


class TweetGenerationStrategy(ContentGenerationStrategy):
    """
    Strategy for generating individual tweets.
    Handles tweet-specific logic and validation.
    """
    
    async def generate(self, **kwargs) -> ContentGenerationResult:
        """Generate a single tweet"""
        topic = kwargs.get('topic')
        style = kwargs.get('style')
        user_context = kwargs.get('user_context')
        language = kwargs.get('language')
        
        if not self.validate_parameters(**kwargs):
            raise ValueError("Invalid parameters for tweet generation")
        
        result = await self.content_generator.generate_tweet(
            topic=topic,
            style=style,
            user_context=user_context,
            language=language
        )
        
        return ContentGenerationResult(
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used"),
            metadata={
                "type": "tweet",
                "style": style,
                "language": language
            }
        )
    
    def validate_parameters(self, **kwargs) -> bool:
        """Validate tweet generation parameters"""
        required_params = ['topic', 'style', 'language']
        return all(kwargs.get(param) is not None for param in required_params)


class ThreadGenerationStrategy(ContentGenerationStrategy):
    """
    Strategy for generating Twitter threads.
    Handles thread-specific logic and validation.
    """
    
    async def generate(self, **kwargs) -> ContentGenerationResult:
        """Generate a Twitter thread"""
        topic = kwargs.get('topic')
        num_tweets = kwargs.get('num_tweets', 3)
        style = kwargs.get('style')
        language = kwargs.get('language')
        
        if not self.validate_parameters(**kwargs):
            raise ValueError("Invalid parameters for thread generation")
        
        result = await self.content_generator.generate_thread(
            topic=topic,
            num_tweets=num_tweets,
            style=style,
            language=language
        )
        
        return ContentGenerationResult(
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used"),
            metadata={
                "type": "thread",
                "num_tweets": num_tweets,
                "style": style,
                "language": language
            }
        )
    
    def validate_parameters(self, **kwargs) -> bool:
        """Validate thread generation parameters"""
        required_params = ['topic', 'style', 'language']
        num_tweets = kwargs.get('num_tweets', 3)
        
        # Validate required parameters
        if not all(kwargs.get(param) is not None for param in required_params):
            return False
        
        # Validate thread size
        if not isinstance(num_tweets, int) or num_tweets < 2 or num_tweets > 25:
            return False
        
        return True


class ReplyGenerationStrategy(ContentGenerationStrategy):
    """
    Strategy for generating tweet replies.
    Handles reply-specific logic and validation.
    """
    
    async def generate(self, **kwargs) -> ContentGenerationResult:
        """Generate a tweet reply"""
        original_tweet = kwargs.get('original_tweet')
        reply_style = kwargs.get('reply_style')
        user_context = kwargs.get('user_context')
        language = kwargs.get('language')
        
        if not self.validate_parameters(**kwargs):
            raise ValueError("Invalid parameters for reply generation")
        
        result = await self.content_generator.generate_reply(
            original_tweet=original_tweet,
            reply_style=reply_style,
            user_context=user_context,
            language=language
        )
        
        return ContentGenerationResult(
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used"),
            metadata={
                "type": "reply",
                "reply_style": reply_style,
                "language": language,
                "original_tweet_preview": original_tweet[:50] + "..." if len(original_tweet) > 50 else original_tweet
            }
        )
    
    def validate_parameters(self, **kwargs) -> bool:
        """Validate reply generation parameters"""
        required_params = ['original_tweet', 'reply_style', 'language']
        return all(kwargs.get(param) is not None for param in required_params)


class ContentGenerationContext:
    """
    Context class for content generation strategies.
    Follows Strategy pattern and provides a unified interface.
    """
    
    def __init__(self, content_generator: ContentGeneratorInterface):
        self.content_generator = content_generator
        self._strategies = {
            'tweet': TweetGenerationStrategy(content_generator),
            'thread': ThreadGenerationStrategy(content_generator),
            'reply': ReplyGenerationStrategy(content_generator)
        }
    
    async def generate_content(self, content_type: str, **kwargs) -> ContentGenerationResult:
        """
        Generate content using the appropriate strategy.
        
        Args:
            content_type: Type of content to generate ('tweet', 'thread', 'reply')
            **kwargs: Parameters for content generation
            
        Returns:
            ContentGenerationResult: Generated content with metadata
            
        Raises:
            ValueError: If content_type is not supported or parameters are invalid
        """
        if content_type not in self._strategies:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        strategy = self._strategies[content_type]
        return await strategy.generate(**kwargs)
    
    def add_strategy(self, content_type: str, strategy: ContentGenerationStrategy):
        """Add a new content generation strategy"""
        self._strategies[content_type] = strategy
    
    def get_supported_types(self) -> list[str]:
        """Get list of supported content types"""
        return list(self._strategies.keys())
