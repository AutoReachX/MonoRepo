"""
Content Orchestration Service following Single Responsibility Principle.
Orchestrates content generation and logging without handling the details of either.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.content_generation_service import ContentGenerationService
from app.services.content_logging_service import ContentLoggingService
from app.services.validation_service import ValidationService
from app.core.exceptions import ContentGenerationError
from app.core.error_handlers import ServiceErrorHandler
from app.core.constants import ContentModes


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
        topic: str,
        style: str,
        user_context: Optional[str],
        language: str,
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Generate a tweet and log the operation.
        
        This method orchestrates the validation, generation, and logging process.
        """
        try:
            # 1. Validate input
            validation_data = {
                "topic": topic,
                "style": style,
                "user_context": user_context,
                "language": language
            }
            validation_result = self.validation_service.validate_content_generation_request(validation_data)
            
            if not validation_result["is_valid"]:
                raise ContentGenerationError(
                    "Invalid input data", 
                    {"errors": validation_result["errors"]}
                )
            
            # 2. Generate content
            result = await self.generation_service.generate_tweet(
                topic=topic,
                style=style,
                user_context=user_context,
                language=language
            )
            
            # 3. Log the generation
            self.logging_service.log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.NEW_TWEET,
                db=db,
                additional_metadata={
                    "style": style,
                    "language": language,
                    "tokens_used": result.get("tokens_used")
                }
            )
            
            return result
            
        except ContentGenerationError:
            raise  # Re-raise validation and generation errors
        except Exception as e:
            self.error_handler.handle_generation_error(e, "tweet generation and logging")
    
    async def generate_and_log_thread(
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
            # 1. Validate input
            validation_data = {
                "topic": topic,
                "num_tweets": num_tweets,
                "style": style,
                "language": language
            }
            validation_result = self.validation_service.validate_thread_generation_request(validation_data)
            
            if not validation_result["is_valid"]:
                raise ContentGenerationError(
                    "Invalid input data", 
                    {"errors": validation_result["errors"]}
                )
            
            # 2. Generate content
            result = await self.generation_service.generate_thread(
                topic=topic,
                num_tweets=num_tweets,
                style=style,
                language=language
            )
            
            # 3. Log the generation
            self.logging_service.log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.THREAD,
                db=db,
                additional_metadata={
                    "num_tweets": num_tweets,
                    "style": style,
                    "language": language,
                    "tokens_used": result.get("tokens_used")
                }
            )
            
            return result
            
        except ContentGenerationError:
            raise
        except Exception as e:
            self.error_handler.handle_generation_error(e, "thread generation and logging")
    
    async def generate_and_log_reply(
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
            # 1. Generate content (replies have simpler validation)
            result = await self.generation_service.generate_reply(
                original_tweet=original_tweet,
                reply_style=reply_style,
                user_context=user_context,
                language=language
            )
            
            # 2. Log the generation
            self.logging_service.log_content_generation(
                user=user,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode=ContentModes.REPLY,
                db=db,
                additional_metadata={
                    "reply_style": reply_style,
                    "language": language,
                    "tokens_used": result.get("tokens_used")
                }
            )
            
            return result
            
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
