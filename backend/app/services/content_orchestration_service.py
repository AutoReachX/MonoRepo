"""
Content Orchestration Service following Single Responsibility Principle.
Orchestrates content generation and logging without handling the details of either.
Refactored to use parameter objects and eliminate long parameter lists.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.content_generation_service import ContentGenerationService
from app.services.content_logging_service import ContentLoggingService
from app.services.validation_service import ValidationService
from app.core.exceptions import ContentGenerationError
from app.core.error_handlers import ServiceErrorHandler
from app.core.constants import ContentModes
from app.core.types import (
    ContentGenerationRequest,
    ThreadGenerationRequest,
    ReplyGenerationRequest,
    ContentGenerationResult
)


class ContentOrchestrationService:
    """
    Service that orchestrates content generation and logging.
    Follows Single Responsibility Principle by delegating specific tasks.
    """

    def __init__(
        self,
        generation_service: ContentGenerationService,
        logging_service: ContentLoggingService,
        validation_service: ValidationService
    ):
        self.generation_service = generation_service
        self.logging_service = logging_service
        self.validation_service = validation_service
        self.error_handler = ServiceErrorHandler(__name__)

    async def generate_and_log_tweet(
        self,
        request: ContentGenerationRequest
    ) -> ContentGenerationResult:
        """
        Generate a tweet and log the operation.

        This method orchestrates the validation, generation, and logging process.
        Uses parameter object pattern to reduce complexity and improve maintainability.
        """
        try:
            # 1. Validate input
            validation_data = request.to_dict()
            validation_result = self.validation_service.validate_content_generation_request(validation_data)

            if not validation_result["is_valid"]:
                raise ContentGenerationError(
                    "Invalid input data",
                    {"errors": validation_result["errors"]}
                )

            # 2. Generate content
            result = await self.generation_service.generate_tweet(
                topic=request.topic,
                style=request.style,
                user_context=request.user_context,
                language=request.language
            )

            # 3. Log the generation
            self.logging_service.log_content_generation(
                user=request.user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.NEW_TWEET,
                db=request.db,
                additional_metadata={
                    "style": request.style,
                    "language": request.language,
                    "tokens_used": result.get("tokens_used")
                }
            )

            # 4. Return structured result
            return ContentGenerationResult(
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used"),
                metadata={
                    "style": request.style,
                    "language": request.language
                }
            )

        except ContentGenerationError:
            raise  # Re-raise validation and generation errors
        except Exception as e:
            self.error_handler.handle_generation_error(e, "tweet generation and logging")

    async def generate_and_log_thread(
        self,
        request: ThreadGenerationRequest
    ) -> ContentGenerationResult:
        """
        Generate a thread and log the operation.

        Uses parameter object pattern for cleaner method signature.
        """
        try:
            # 1. Validate input
            validation_data = request.to_dict()
            validation_result = self.validation_service.validate_thread_generation_request(validation_data)

            if not validation_result["is_valid"]:
                raise ContentGenerationError(
                    "Invalid input data",
                    {"errors": validation_result["errors"]}
                )

            # 2. Generate content
            result = await self.generation_service.generate_thread(
                topic=request.topic,
                num_tweets=request.num_tweets,
                style=request.style,
                language=request.language
            )

            # 3. Log the generation
            self.logging_service.log_content_generation(
                user=request.user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.THREAD,
                db=request.db,
                additional_metadata={
                    "num_tweets": request.num_tweets,
                    "style": request.style,
                    "language": request.language,
                    "tokens_used": result.get("tokens_used")
                }
            )

            # 4. Return structured result
            return ContentGenerationResult(
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used"),
                metadata={
                    "num_tweets": request.num_tweets,
                    "style": request.style,
                    "language": request.language
                }
            )

        except ContentGenerationError:
            raise
        except Exception as e:
            self.error_handler.handle_generation_error(e, "thread generation and logging")

    async def generate_and_log_reply(
        self,
        request: ReplyGenerationRequest
    ) -> ContentGenerationResult:
        """
        Generate a reply and log the operation.

        Uses parameter object pattern for consistency with other methods.
        """
        try:
            # 1. Generate content (replies have simpler validation)
            result = await self.generation_service.generate_reply(
                original_tweet=request.original_tweet,
                reply_style=request.reply_style,
                user_context=request.user_context,
                language=request.language
            )

            # 2. Log the generation
            self.logging_service.log_content_generation(
                user=request.user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.REPLY,
                db=request.db,
                additional_metadata={
                    "reply_style": request.reply_style,
                    "language": request.language,
                    "tokens_used": result.get("tokens_used")
                }
            )

            # 3. Return structured result
            return ContentGenerationResult(
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used"),
                metadata={
                    "reply_style": request.reply_style,
                    "language": request.language,
                    "original_tweet": request.original_tweet[:100] + "..." if len(request.original_tweet) > 100 else request.original_tweet
                }
            )

        except Exception as e:
            self.error_handler.handle_generation_error(e, "reply generation and logging")

    def get_user_content_history(
        self,
        user: User,
        db: Session,
        limit: int = 50,
        offset: int = 0,
        mode_filter: str = None
    ) -> Dict[str, Any]:
        """Get user's content generation history with statistics"""
        try:
            # Get history
            history = self.logging_service.get_user_content_history(
                user=user,
                db=db,
                limit=limit,
                offset=offset,
                mode_filter=mode_filter
            )

            # Get statistics
            stats = self.logging_service.get_content_statistics(user=user, db=db)

            return {
                "history": [
                    {
                        "id": log.id,
                        "mode": log.mode,
                        "generated_text": log.generated_text,
                        "created_at": log.created_at,
                        # Don't include the full prompt for privacy/space reasons
                        "prompt_preview": log.prompt[:100] + "..." if len(log.prompt) > 100 else log.prompt
                    }
                    for log in history
                ],
                "statistics": stats,
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": len(history) == limit
                }
            }

        except Exception as e:
            self.error_handler.handle_database_error(e, "content history retrieval")


# Factory function for dependency injection
def create_content_orchestration_service(
    generation_service: ContentGenerationService,
    logging_service: ContentLoggingService,
    validation_service: ValidationService
) -> ContentOrchestrationService:
    """Create a content orchestration service instance"""
    return ContentOrchestrationService(
        generation_service=generation_service,
        logging_service=logging_service,
        validation_service=validation_service
    )
