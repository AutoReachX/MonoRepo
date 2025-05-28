from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.content_log import ContentLog
from app.api.auth import get_current_user
from app.core.exceptions import handle_exception, ValidationError, ContentGenerationError
from app.core.constants import ContentConstants
from app.core.dependencies import get_content_service
from app.services.content_service import ContentService

router = APIRouter()

class ContentGenerationRequest(BaseModel):
    topic: str
    style: Optional[str] = ContentConstants.DEFAULT_STYLE
    user_context: Optional[str] = None
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE

class ThreadGenerationRequest(BaseModel):
    topic: str
    num_tweets: Optional[int] = 3
    style: Optional[str] = "informative"
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE

class ReplyGenerationRequest(BaseModel):
    original_tweet: str
    reply_style: Optional[str] = "helpful"
    user_context: Optional[str] = None
    language: Optional[str] = ContentConstants.DEFAULT_LANGUAGE

class ContentResponse(BaseModel):
    success: bool
    content: Optional[str]
    prompt: Optional[str]
    tokens_used: Optional[int]
    error: Optional[str]

@router.post("/generate-tweet", response_model=ContentResponse)
async def generate_tweet(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentService = Depends(get_content_service)
):
    """Generate a tweet using AI"""
    try:
        # Use content service to handle the generation
        result = await content_service.generate_tweet(
            topic=request.topic,
            style=request.style,
            user_context=request.user_context,
            language=request.language or current_user.language_pref,
            user=current_user,
            db=db
        )

        return ContentResponse(
            success=True,
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used")
        )

    except (ValidationError, ContentGenerationError) as e:
        raise handle_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )

@router.post("/generate-thread", response_model=ContentResponse)
async def generate_thread(
    request: ThreadGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentService = Depends(get_content_service)
):
    """Generate a Twitter thread using AI"""
    try:
        result = await content_service.generate_thread(
            topic=request.topic,
            num_tweets=request.num_tweets,
            style=request.style,
            language=request.language or current_user.language_pref,
            user=current_user,
            db=db
        )

        return ContentResponse(
            success=True,
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used")
        )

    except (ValidationError, ContentGenerationError) as e:
        raise handle_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Thread generation failed: {str(e)}"
        )

@router.post("/generate-reply", response_model=ContentResponse)
async def generate_reply(
    request: ReplyGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    content_service: ContentService = Depends(get_content_service)
):
    """Generate a reply to a tweet using AI"""
    try:
        result = await content_service.generate_reply(
            original_tweet=request.original_tweet,
            reply_style=request.reply_style,
            user_context=request.user_context,
            language=request.language or current_user.language_pref,
            user=current_user,
            db=db
        )

        return ContentResponse(
            success=True,
            content=result["content"],
            prompt=result["prompt"],
            tokens_used=result.get("tokens_used")
        )

    except (ValidationError, ContentGenerationError) as e:
        raise handle_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reply generation failed: {str(e)}"
        )

@router.get("/history")
async def get_content_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's content generation history"""
    content_logs = db.query(ContentLog).filter(
        ContentLog.user_id == current_user.id
    ).order_by(ContentLog.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "history": [
            {
                "id": log.id,
                "mode": log.mode,
                "prompt": log.prompt[:100] + "..." if len(log.prompt) > 100 else log.prompt,
                "generated_text": log.generated_text,
                "created_at": log.created_at
            }
            for log in content_logs
        ]
    }
