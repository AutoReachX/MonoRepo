"""
Content service following Single Responsibility Principle.
Handles content generation business logic.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.interfaces import ContentGeneratorInterface
from app.models.user import User
from app.models.content_log import ContentLog
from app.core.constants import ContentModes
from app.core.exceptions import ContentGenerationError, DatabaseError
from app.services.validation_service import ValidationService


class ContentService:
    """Service for handling content generation operations"""

    def __init__(
        self,
        content_generator: ContentGeneratorInterface,
        validation_service: ValidationService
    ):
        self.content_generator = content_generator
        self.validation_service = validation_service

    async def generate_tweet(
        self,
        topic: str,
        style: str,
        user_context: Optional[str],
        language: str,
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """Generate a tweet and log the operation"""
        try:
            # Validate input
            validation_data = {
                "topic": topic,
                "style": style,
                "user_context": user_context,
                "language": language
            }
            validation_result = self.validation_service.validate_content_generation_request(validation_data)
            if not validation_result["is_valid"]:
                raise ContentGenerationError("Invalid input data", {"errors": validation_result["errors"]})

            # Generate content
            result = await self.content_generator.generate_tweet(
                topic=topic,
                style=style,
                user_context=user_context,
                language=language
            )

            # Log the generation
            self._log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.NEW_TWEET,
                db=db
            )

            return result

        except Exception as e:
            if isinstance(e, ContentGenerationError):
                raise
            raise ContentGenerationError(f"Tweet generation failed: {str(e)}")

    async def generate_thread(
        self,
        topic: str,
        num_tweets: int,
        style: str,
        language: str,
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """Generate a thread and log the operation"""
        try:
            # Validate input
            validation_data = {
                "topic": topic,
                "num_tweets": num_tweets,
                "style": style,
                "language": language
            }
            validation_result = self.validation_service.validate_thread_generation_request(validation_data)
            if not validation_result["is_valid"]:
                raise ContentGenerationError("Invalid input data", {"errors": validation_result["errors"]})

            # Generate content
            result = await self.content_generator.generate_thread(
                topic=topic,
                num_tweets=num_tweets,
                style=style,
                language=language
            )

            # Log the generation
            self._log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.THREAD,
                db=db
            )

            return result

        except Exception as e:
            if isinstance(e, ContentGenerationError):
                raise
            raise ContentGenerationError(f"Thread generation failed: {str(e)}")

    async def generate_reply(
        self,
        original_tweet: str,
        reply_style: str,
        user_context: Optional[str],
        language: str,
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """Generate a reply and log the operation"""
        try:
            # Generate content
            result = await self.content_generator.generate_reply(
                original_tweet=original_tweet,
                reply_style=reply_style,
                user_context=user_context,
                language=language
            )

            # Log the generation
            self._log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.REPLY,
                db=db
            )

            return result

        except Exception as e:
            if isinstance(e, ContentGenerationError):
                raise
            raise ContentGenerationError(f"Reply generation failed: {str(e)}")

    def _log_content_generation(
        self,
        user: User,
        prompt: str,
        generated_text: str,
        mode: str,
        db: Session
    ) -> None:
        """Log content generation to database"""
        try:
            content_log = ContentLog(
                user_id=user.id,
                prompt=prompt,
                generated_text=generated_text,
                mode=mode
            )
            db.add(content_log)
            db.commit()
        except Exception as e:
            db.rollback()
            raise DatabaseError(f"Failed to log content generation: {str(e)}")


# Factory function for dependency injection
def create_content_service(
    content_generator: ContentGeneratorInterface,
    validation_service: ValidationService
) -> ContentService:
    """Create a content service instance"""
    return ContentService(content_generator, validation_service)
