from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.content_log import ContentLog
from app.api.auth import get_current_user
from app.services.openai_service import openai_service

router = APIRouter()

class ContentGenerationRequest(BaseModel):
    topic: str
    style: Optional[str] = "engaging"
    user_context: Optional[str] = None
    language: Optional[str] = "en"

class ThreadGenerationRequest(BaseModel):
    topic: str
    num_tweets: Optional[int] = 3
    style: Optional[str] = "informative"
    language: Optional[str] = "en"

class ReplyGenerationRequest(BaseModel):
    original_tweet: str
    reply_style: Optional[str] = "helpful"
    user_context: Optional[str] = None
    language: Optional[str] = "en"

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
    db: Session = Depends(get_db)
):
    """Generate a tweet using AI"""
    try:
        # Generate content using OpenAI
        result = await openai_service.generate_tweet(
            topic=request.topic,
            style=request.style,
            user_context=request.user_context,
            language=request.language or current_user.language_pref
        )
        
        if result["success"]:
            # Log the generation
            content_log = ContentLog(
                user_id=current_user.id,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode="new_tweet"
            )
            db.add(content_log)
            db.commit()
            
            return ContentResponse(
                success=True,
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used")
            )
        else:
            return ContentResponse(
                success=False,
                error=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )

@router.post("/generate-thread", response_model=ContentResponse)
async def generate_thread(
    request: ThreadGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a Twitter thread using AI"""
    try:
        result = await openai_service.generate_thread(
            topic=request.topic,
            num_tweets=request.num_tweets,
            style=request.style,
            language=request.language or current_user.language_pref
        )
        
        if result["success"]:
            # Log the generation
            content_log = ContentLog(
                user_id=current_user.id,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode="thread"
            )
            db.add(content_log)
            db.commit()
            
            return ContentResponse(
                success=True,
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used")
            )
        else:
            return ContentResponse(
                success=False,
                error=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Thread generation failed: {str(e)}"
        )

@router.post("/generate-reply", response_model=ContentResponse)
async def generate_reply(
    request: ReplyGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a reply to a tweet using AI"""
    try:
        result = await openai_service.generate_reply(
            original_tweet=request.original_tweet,
            reply_style=request.reply_style,
            user_context=request.user_context,
            language=request.language or current_user.language_pref
        )
        
        if result["success"]:
            # Log the generation
            content_log = ContentLog(
                user_id=current_user.id,
                prompt=result["prompt"],
                generated_text=result["content"],
                mode="reply"
            )
            db.add(content_log)
            db.commit()
            
            return ContentResponse(
                success=True,
                content=result["content"],
                prompt=result["prompt"],
                tokens_used=result.get("tokens_used")
            )
        else:
            return ContentResponse(
                success=False,
                error=result["error"]
            )
            
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
