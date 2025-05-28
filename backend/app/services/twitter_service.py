import tweepy
from typing import Optional, Dict, Any
from app.core.config import settings

class TwitterService:
    def __init__(self):
        self.api_key = settings.TWITTER_API_KEY
        self.api_secret = settings.TWITTER_API_SECRET
        self.access_token = settings.TWITTER_ACCESS_TOKEN
        self.access_token_secret = settings.TWITTER_ACCESS_TOKEN_SECRET
        self.bearer_token = settings.TWITTER_BEARER_TOKEN
        
        # Initialize Twitter API v2 client
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.access_token,
            access_token_secret=self.access_token_secret,
            wait_on_rate_limit=True
        )
    
    def post_tweet(self, text: str, user_access_token: str = None, user_access_token_secret: str = None) -> Optional[Dict[str, Any]]:
        """Post a tweet to Twitter"""
        try:
            # If user tokens provided, use them instead of app tokens
            if user_access_token and user_access_token_secret:
                user_client = tweepy.Client(
                    consumer_key=self.api_key,
                    consumer_secret=self.api_secret,
                    access_token=user_access_token,
                    access_token_secret=user_access_token_secret
                )
                response = user_client.create_tweet(text=text)
            else:
                response = self.client.create_tweet(text=text)
            
            return {
                "id": response.data["id"],
                "text": response.data["text"],
                "success": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_user_info(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user information from Twitter"""
        try:
            user = self.client.get_user(username=username, user_fields=["public_metrics"])
            if user.data:
                return {
                    "id": user.data.id,
                    "username": user.data.username,
                    "name": user.data.name,
                    "followers_count": user.data.public_metrics["followers_count"],
                    "following_count": user.data.public_metrics["following_count"],
                    "tweet_count": user.data.public_metrics["tweet_count"],
                    "success": True
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        return None
    
    def get_tweet_analytics(self, tweet_id: str) -> Optional[Dict[str, Any]]:
        """Get analytics for a specific tweet"""
        try:
            tweet = self.client.get_tweet(
                tweet_id,
                tweet_fields=["public_metrics", "created_at"]
            )
            if tweet.data:
                metrics = tweet.data.public_metrics
                return {
                    "tweet_id": tweet.data.id,
                    "likes": metrics["like_count"],
                    "retweets": metrics["retweet_count"],
                    "replies": metrics["reply_count"],
                    "quotes": metrics["quote_count"],
                    "created_at": tweet.data.created_at,
                    "success": True
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        return None
    
    def get_oauth_url(self, callback_url: str) -> Dict[str, str]:
        """Get OAuth authorization URL for user authentication"""
        try:
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                callback_url
            )
            authorization_url = auth.get_authorization_url()
            return {
                "authorization_url": authorization_url,
                "oauth_token": auth.request_token["oauth_token"],
                "oauth_token_secret": auth.request_token["oauth_token_secret"],
                "success": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_access_tokens(self, oauth_token: str, oauth_token_secret: str, oauth_verifier: str) -> Dict[str, Any]:
        """Exchange OAuth verifier for access tokens"""
        try:
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret
            )
            auth.request_token = {
                "oauth_token": oauth_token,
                "oauth_token_secret": oauth_token_secret
            }
            access_token, access_token_secret = auth.get_access_token(oauth_verifier)
            
            return {
                "access_token": access_token,
                "access_token_secret": access_token_secret,
                "success": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Global instance
twitter_service = TwitterService()
