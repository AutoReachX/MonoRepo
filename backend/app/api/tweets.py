from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.tweet import Tweet
from app.api.auth import get_current_user

router = APIRouter()


class TweetCreate(BaseModel):
    content: str
    scheduled_at: Optional[datetime] = None


class TweetResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    content: str
    status: str
    is_scheduled: bool
    scheduled_at: Optional[datetime]
    posted_at: Optional[datetime]
    likes_count: int
    retweets_count: int
    replies_count: int
    created_at: datetime


class TweetUpdate(BaseModel):
    content: Optional[str] = None
    scheduled_at: Optional[datetime] = None


@router.post("/", response_model=TweetResponse, status_code=status.HTTP_201_CREATED)
async def create_tweet(
    tweet: TweetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_tweet = Tweet(
        user_id=current_user.id,
        content=tweet.content,
        scheduled_at=tweet.scheduled_at,
        is_scheduled=tweet.scheduled_at is not None,
        status="scheduled" if tweet.scheduled_at else "draft"
    )
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    return db_tweet


@router.get("/", response_model=List[TweetResponse])
async def read_tweets(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tweets = db.query(Tweet).filter(Tweet.user_id == current_user.id).offset(skip).limit(limit).all()
    return tweets


@router.get("/{tweet_id}", response_model=TweetResponse)
async def read_tweet(
    tweet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tweet = db.query(Tweet).filter(
        Tweet.id == tweet_id,
        Tweet.user_id == current_user.id
    ).first()
    if tweet is None:
        raise HTTPException(status_code=404, detail="Tweet not found")
    return tweet


@router.put("/{tweet_id}", response_model=TweetResponse)
async def update_tweet(
    tweet_id: int,
    tweet_update: TweetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tweet = db.query(Tweet).filter(
        Tweet.id == tweet_id,
        Tweet.user_id == current_user.id
    ).first()
    if tweet is None:
        raise HTTPException(status_code=404, detail="Tweet not found")

    for field, value in tweet_update.dict(exclude_unset=True).items():
        setattr(tweet, field, value)

    # Update scheduling status
    if tweet_update.scheduled_at is not None:
        tweet.is_scheduled = True
        tweet.status = "scheduled"

    db.commit()
    db.refresh(tweet)
    return tweet


@router.delete("/{tweet_id}")
async def delete_tweet(
    tweet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tweet = db.query(Tweet).filter(
        Tweet.id == tweet_id,
        Tweet.user_id == current_user.id
    ).first()
    if tweet is None:
        raise HTTPException(status_code=404, detail="Tweet not found")

    db.delete(tweet)
    db.commit()
    return {"message": "Tweet deleted successfully"}
