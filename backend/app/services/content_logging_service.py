"""
Content Logging Service following Single Responsibility Principle.
Handles ONLY content logging, not generation or other concerns.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.content_log import ContentLog
from app.core.exceptions import DatabaseError
from app.core.error_handlers import ServiceErrorHandler


class ContentLoggingService:
    """
    Service responsible ONLY for logging content generation activities.
    Follows Single Responsibility Principle.
    """
    
    def __init__(self):
        self.error_handler = ServiceErrorHandler(__name__)
    
    def log_content_generation(
        self,
        user: User,
        prompt: str,
        generated_text: str,
        mode: str,
        db: Session,
        additional_metadata: Dict[str, Any] = None
    ) -> ContentLog:
        """
        Log content generation to database.
        
        Args:
            user: User who generated the content
            prompt: The prompt used for generation
            generated_text: The generated content
            mode: Generation mode (tweet, thread, reply, etc.)
            db: Database session
            additional_metadata: Optional metadata to store
            
        Returns:
            ContentLog: The created log entry
            
        Raises:
            DatabaseError: If logging fails
        """
        try:
            content_log = ContentLog(
                user_id=user.id,
                prompt=prompt,
                generated_text=generated_text,
                mode=mode
            )
            
            # Add metadata if provided
            if additional_metadata:
                # Assuming ContentLog has a metadata field (JSON)
                # This would need to be added to the model
                pass
            
            db.add(content_log)
            db.commit()
            db.refresh(content_log)
            
            return content_log
            
        except Exception as e:
            db.rollback()
            self.error_handler.handle_database_error(e, "content logging")
    
    def get_user_content_history(
        self,
        user: User,
        db: Session,
        limit: int = 50,
        offset: int = 0,
        mode_filter: str = None
    ) -> list[ContentLog]:
        """
        Get content generation history for a user.
        
        Args:
            user: User to get history for
            db: Database session
            limit: Maximum number of records to return
            offset: Number of records to skip
            mode_filter: Optional filter by generation mode
            
        Returns:
            List of ContentLog entries
        """
        try:
            query = db.query(ContentLog).filter(ContentLog.user_id == user.id)
            
            if mode_filter:
                query = query.filter(ContentLog.mode == mode_filter)
            
            query = query.order_by(ContentLog.created_at.desc())
            query = query.offset(offset).limit(limit)
            
            return query.all()
            
        except Exception as e:
            self.error_handler.handle_database_error(e, "content history retrieval")
    
    def get_content_statistics(
        self,
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Get content generation statistics for a user.
        
        Args:
            user: User to get statistics for
            db: Database session
            
        Returns:
            Dictionary with statistics
        """
        try:
            total_generated = db.query(ContentLog).filter(
                ContentLog.user_id == user.id
            ).count()
            
            # Count by mode
            mode_counts = {}
            modes = db.query(ContentLog.mode).filter(
                ContentLog.user_id == user.id
            ).distinct().all()
            
            for (mode,) in modes:
                count = db.query(ContentLog).filter(
                    ContentLog.user_id == user.id,
                    ContentLog.mode == mode
                ).count()
                mode_counts[mode] = count
            
            return {
                "total_generated": total_generated,
                "by_mode": mode_counts
            }
            
        except Exception as e:
            self.error_handler.handle_database_error(e, "content statistics")
    
    def delete_content_log(
        self,
        log_id: int,
        user: User,
        db: Session
    ) -> bool:
        """
        Delete a content log entry (only if it belongs to the user).
        
        Args:
            log_id: ID of the log entry to delete
            user: User requesting deletion
            db: Database session
            
        Returns:
            True if deleted, False if not found
        """
        try:
            log_entry = db.query(ContentLog).filter(
                ContentLog.id == log_id,
                ContentLog.user_id == user.id
            ).first()
            
            if not log_entry:
                return False
            
            db.delete(log_entry)
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            self.error_handler.handle_database_error(e, "content log deletion")


# Factory function for dependency injection
def create_content_logging_service() -> ContentLoggingService:
    """Create a content logging service instance"""
    return ContentLoggingService()
