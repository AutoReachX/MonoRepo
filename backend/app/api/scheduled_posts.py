from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.scheduled_post import ScheduledPost, PostStatus
from app.api.auth import get_current_user
from app.services.twitter_service import twitter_service

router = APIRouter()

class ScheduledPostCreate(BaseModel):
    content: str
    scheduled_time: datetime

class ScheduledPostResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: int
    content: str
    scheduled_time: datetime
    status: str
    tweet_id: Optional[str]
    created_at: datetime

class ScheduledPostUpdate(BaseModel):
    content: Optional[str] = None
    scheduled_time: Optional[datetime] = None

@router.post("/", response_model=ScheduledPostResponse, status_code=status.HTTP_201_CREATED)
async def create_scheduled_post(
    post: ScheduledPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule a post for future publishing"""
    # Validate scheduled time is in the future
    if post.scheduled_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    # Create scheduled post
    db_post = ScheduledPost(
        user_id=current_user.id,
        content=post.content,
        scheduled_time=post.scheduled_time,
        status=PostStatus.PENDING
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return db_post

@router.get("/", response_model=List[ScheduledPostResponse])
async def get_scheduled_posts(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's scheduled posts"""
    query = db.query(ScheduledPost).filter(ScheduledPost.user_id == current_user.id)
    
    if status_filter:
        try:
            status_enum = PostStatus(status_filter)
            query = query.filter(ScheduledPost.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter: {status_filter}"
            )
    
    posts = query.order_by(ScheduledPost.scheduled_time.asc()).offset(skip).limit(limit).all()
    return posts

@router.get("/{post_id}", response_model=ScheduledPostResponse)
async def get_scheduled_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific scheduled post"""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    return post

@router.put("/{post_id}", response_model=ScheduledPostResponse)
async def update_scheduled_post(
    post_id: int,
    post_update: ScheduledPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a scheduled post"""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    # Can only update pending posts
    if post.status != PostStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending posts"
        )
    
    # Update fields
    for field, value in post_update.dict(exclude_unset=True).items():
        if field == "scheduled_time" and value <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_scheduled_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scheduled post"""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    # Can only delete pending posts
    if post.status != PostStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending posts"
        )
    
    db.delete(post)
    db.commit()
    return {"message": "Scheduled post deleted successfully"}

@router.post("/{post_id}/post-now")
async def post_now(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Post a scheduled tweet immediately"""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    if post.status != PostStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post is not pending"
        )
    
    # Post to Twitter
    result = twitter_service.post_tweet(
        text=post.content,
        user_access_token=current_user.twitter_access_token,
        user_access_token_secret=current_user.twitter_refresh_token  # Note: This needs proper OAuth2 handling
    )
    
    if result["success"]:
        post.status = PostStatus.POSTED
        post.tweet_id = result["id"]
        db.commit()
        
        return {
            "message": "Post published successfully",
            "tweet_id": result["id"]
        }
    else:
        post.status = PostStatus.FAILED
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to post tweet: {result['error']}"
        )
