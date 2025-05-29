"""
Content Generation Service following Single Responsibility Principle.
Handles ONLY content generation logic, not logging or other concerns.
"""

from typing import Dict, Any, Optional
from app.core.interfaces import ContentGeneratorInterface
from app.core.error_handlers import ServiceErrorHandler


class ContentGenerationService:
    """
    Service responsible ONLY for content generation.
    Follows Single Responsibility Principle.
    """

    def __init__(self, content_generator: ContentGeneratorInterface):
        self.content_generator = content_generator
        self.error_handler = ServiceErrorHandler(__name__)

    async def generate_tweet(
        self,
        topic: str,
        style: str,
        user_context: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """Generate a tweet using the configured AI provider"""
        try:
            result = await self.content_generator.generate_tweet(
                topic=topic,
                style=style,
                user_context=user_context,
                language=language
            )
            return result

        except Exception as e:
            self.error_handler.handle_generation_error(e, "tweet generation")

    async def generate_thread(
        self,
        topic: str,
        num_tweets: int,
        style: str,
        language: str
    ) -> Dict[str, Any]:
        """Generate a thread using the configured AI provider"""
        try:
            result = await self.content_generator.generate_thread(
                topic=topic,
                num_tweets=num_tweets,
                style=style,
                language=language
            )
            return result

        except Exception as e:
            self.error_handler.handle_generation_error(e, "thread generation")

    async def generate_reply(
        self,
        original_tweet: str,
        reply_style: str,
        user_context: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """Generate a reply using the configured AI provider"""
        try:
            result = await self.content_generator.generate_reply(
                original_tweet=original_tweet,
                reply_style=reply_style,
                user_context=user_context,
                language=language
            )
            return result

        except Exception as e:
            self.error_handler.handle_generation_error(e, "reply generation")


# Factory function for dependency injection
def create_content_generation_service(
    content_generator: ContentGeneratorInterface
) -> ContentGenerationService:
    """Create a content generation service instance"""
    return ContentGenerationService(content_generator)
