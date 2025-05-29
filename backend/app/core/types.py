"""
Core types and data structures for the AutoReach application.
Following SOLID principles and eliminating primitive obsession.
"""

from typing import Optional, Dict, Any
from dataclasses import dataclass
from sqlalchemy.orm import Session
from app.models.user import User


@dataclass
class ContentGenerationRequest:
    """
    Parameter object for content generation requests.
    Follows Parameter Object pattern to reduce long parameter lists.
    """
    topic: str
    style: str
    language: str
    user: User
    db: Session
    user_context: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "topic": self.topic,
            "style": self.style,
            "language": self.language,
            "user_context": self.user_context
        }


@dataclass
class ThreadGenerationRequest:
    """
    Parameter object for thread generation requests.
    Extends content generation with thread-specific parameters.
    """
    topic: str
    num_tweets: int
    style: str
    language: str
    user: User
    db: Session

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "topic": self.topic,
            "num_tweets": self.num_tweets,
            "style": self.style,
            "language": self.language
        }


@dataclass
class ReplyGenerationRequest:
    """
    Parameter object for reply generation requests.
    Specific to reply generation functionality.
    """
    original_tweet: str
    reply_style: str
    language: str
    user: User
    db: Session
    user_context: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "original_tweet": self.original_tweet,
            "reply_style": self.reply_style,
            "language": self.language,
            "user_context": self.user_context
        }


@dataclass
class ContentGenerationResult:
    """
    Result object for content generation operations.
    Provides consistent structure for all generation results.
    """
    content: str
    prompt: str
    tokens_used: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        result = {
            "content": self.content,
            "prompt": self.prompt
        }
        if self.tokens_used is not None:
            result["tokens_used"] = self.tokens_used
        if self.metadata:
            result["metadata"] = self.metadata
        return result


@dataclass
class ValidationContext:
    """
    Context object for validation operations.
    Provides consistent validation context across the application.
    """
    field_name: str
    value: Any
    rules: Dict[str, Any]
    user_context: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging/debugging"""
        return {
            "field_name": self.field_name,
            "value": str(self.value),
            "rules": self.rules,
            "user_context": self.user_context
        }
