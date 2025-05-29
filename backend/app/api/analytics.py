from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.tweet import Tweet
from app.api.auth import get_current_user

router = APIRouter()


class AnalyticsResponse(BaseModel):
    total_tweets: int
    total_likes: int
    total_retweets: int
    total_replies: int
    avg_engagement_rate: float
    follower_growth: Dict[str, Any]
    top_tweets: List[Dict[str, Any]]


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's tweets
    tweets = db.query(Tweet).filter(Tweet.user_id == current_user.id).all()

    # Calculate basic metrics
    total_tweets = len(tweets)
    total_likes = sum(tweet.likes_count for tweet in tweets)
    total_retweets = sum(tweet.retweets_count for tweet in tweets)
    total_replies = sum(tweet.replies_count for tweet in tweets)

    # Calculate engagement rate
    total_engagement = total_likes + total_retweets + total_replies
    avg_engagement_rate = (total_engagement / total_tweets) if total_tweets > 0 else 0

    # Get top performing tweets
    top_tweets = []
    sorted_tweets = sorted(tweets, key=lambda t: t.likes_count + t.retweets_count, reverse=True)[:5]
    for tweet in sorted_tweets:
        top_tweets.append({
            "id": tweet.id,
            "content": tweet.content[:100] + "..." if len(tweet.content) > 100 else tweet.content,
            "likes": tweet.likes_count,
            "retweets": tweet.retweets_count,
            "engagement": tweet.likes_count + tweet.retweets_count + tweet.replies_count
        })

    # Mock follower growth data (would be real data from Twitter API)
    follower_growth = {
        "current_followers": 12543,
        "weekly_growth": 5.2,
        "monthly_growth": 18.7,
        "growth_trend": "increasing"
    }

    return AnalyticsResponse(
        total_tweets=total_tweets,
        total_likes=total_likes,
        total_retweets=total_retweets,
        total_replies=total_replies,
        avg_engagement_rate=round(avg_engagement_rate, 2),
        follower_growth=follower_growth,
        top_tweets=top_tweets
    )


@router.get("/engagement")
async def get_engagement_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get tweets from the last N days
    start_date = datetime.utcnow() - timedelta(days=days)
    tweets = db.query(Tweet).filter(
        Tweet.user_id == current_user.id,
        Tweet.created_at >= start_date
    ).all()

    # Group by day and calculate engagement
    daily_engagement = {}
    for tweet in tweets:
        day = tweet.created_at.date()
        if day not in daily_engagement:
            daily_engagement[day] = {
                "date": day.isoformat(),
                "tweets": 0,
                "likes": 0,
                "retweets": 0,
                "replies": 0
            }

        daily_engagement[day]["tweets"] += 1
        daily_engagement[day]["likes"] += tweet.likes_count
        daily_engagement[day]["retweets"] += tweet.retweets_count
        daily_engagement[day]["replies"] += tweet.replies_count

    return {"daily_engagement": list(daily_engagement.values())}


@router.get("/growth")
async def get_growth_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mock growth data (would be real data from Twitter API)
    return {
        "follower_count": 12543,
        "following_count": 1234,
        "tweet_count": 5678,
        "weekly_growth": {
            "followers": 5.2,
            "engagement": 8.7,
            "reach": 12.8
        },
        "monthly_growth": {
            "followers": 18.7,
            "engagement": 15.3,
            "reach": 25.4
        }
    }
