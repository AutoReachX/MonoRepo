from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.core.constants import ContentConstants
from app.core.dependencies import get_content_orchestration_service
from app.services.content_orchestration_service import ContentOrchestrationService
from app.core.error_handlers import handle_service_errors
from app.core.types import (
    ContentGenerationRequest,
    ThreadGenerationRequest,
    ReplyGenerationRequest
)

router = APIRouter()


class ContentGenerationRequestModel(BaseModel):
    """Pydantic model for API request validation"""
    topic: str
    style: Optional[str] = ContentConstants.DEFAULT_STYLE
    user_context: Optional[str] = None
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE


class ThreadGenerationRequestModel(BaseModel):
    """Pydantic model for thread generation API request validation"""
    topic: str
    num_tweets: Optional[int] = 3
    style: Optional[str] = "informative"
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE


class ReplyGenerationRequestModel(BaseModel):
    """Pydantic model for reply generation API request validation"""
    original_tweet: str
    reply_style: Optional[str] = "helpful"
    user_context: Optional[str] = None
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE


class ContentResponse(BaseModel):
    """Standardized response model for content generation"""
    success: bool
    content: Optional[str]
    prompt: Optional[str]
    tokens_used: Optional[int]
    metadata: Optional[dict] = None
    error: Optional[str] = None


@router.post("/generate-tweet", response_model=ContentResponse)
@handle_service_errors
async def generate_tweet(
    request: ContentGenerationRequestModel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentOrchestrationService = Depends(get_content_orchestration_service)
):
    """
    Generate a tweet using AI.

    Uses parameter object pattern for cleaner service interaction.
    """
    # Create parameter object for service layer
    service_request = ContentGenerationRequest(
        topic=request.topic,
        style=request.style or ContentConstants.DEFAULT_STYLE,
        user_context=request.user_context,
        language=request.language or getattr(current_user, 'language_pref', ContentConstants.DEFAULT_LANGUAGE),
        user=current_user,
        db=db
    )

    # Use content orchestration service to handle the generation and logging
    result = await content_service.generate_and_log_tweet(service_request)

    return ContentResponse(
        success=True,
        content=result.content,
        prompt=result.prompt,
        tokens_used=result.tokens_used,
        metadata=result.metadata,
        error=None
    )


@router.post("/generate-thread", response_model=ContentResponse)
@handle_service_errors
async def generate_thread(
    request: ThreadGenerationRequestModel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentOrchestrationService = Depends(get_content_orchestration_service)
):
    """
    Generate a Twitter thread using AI.

    Uses parameter object pattern for cleaner service interaction.
    """
    # Create parameter object for service layer
    service_request = ThreadGenerationRequest(
        topic=request.topic,
        num_tweets=request.num_tweets or 3,
        style=request.style or "informative",
        language=request.language or getattr(current_user, 'language_pref', ContentConstants.DEFAULT_LANGUAGE),
        user=current_user,
        db=db
    )

    result = await content_service.generate_and_log_thread(service_request)

    return ContentResponse(
        success=True,
        content=result.content,
        prompt=result.prompt,
        tokens_used=result.tokens_used,
        metadata=result.metadata,
        error=None
    )


@router.post("/generate-reply", response_model=ContentResponse)
@handle_service_errors
async def generate_reply(
    request: ReplyGenerationRequestModel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentOrchestrationService = Depends(get_content_orchestration_service)
):
    """
    Generate a reply to a tweet using AI.

    Uses parameter object pattern for cleaner service interaction.
    """
    # Create parameter object for service layer
    service_request = ReplyGenerationRequest(
        original_tweet=request.original_tweet,
        reply_style=request.reply_style or "helpful",
        user_context=request.user_context,
        language=request.language or getattr(current_user, 'language_pref', ContentConstants.DEFAULT_LANGUAGE),
        user=current_user,
        db=db
    )

    result = await content_service.generate_and_log_reply(service_request)

    return ContentResponse(
        success=True,
        content=result.content,
        prompt=result.prompt,
        tokens_used=result.tokens_used,
        metadata=result.metadata,
        error=None
    )


@router.get("/history")
@handle_service_errors
async def get_content_history(
    skip: int = 0,
    limit: int = 50,
    mode_filter: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentOrchestrationService = Depends(get_content_orchestration_service)
):
    """Get user's content generation history"""
    return content_service.get_user_content_history(
        user=current_user,
        db=db,
        limit=limit,
        offset=skip,
        mode_filter=mode_filter
    )
