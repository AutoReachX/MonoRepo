import tweepy
from typing import Optional, Dict, Any
from app.core.config import settings

class TwitterService:
    def __init__(self,
                 api_key: Optional[str] = None,
                 api_secret: Optional[str] = None,
                 access_token: Optional[str] = None,
                 access_token_secret: Optional[str] = None,
                 bearer_token: Optional[str] = None,
                 client: Optional[tweepy.Client] = None):
        """
        Initialize Twitter service with dependency injection support

        Args:
            api_key: Twitter API key (defaults to settings if not provided)
            api_secret: Twitter API secret (defaults to settings if not provided)
            access_token: Twitter access token (defaults to settings if not provided)
            access_token_secret: Twitter access token secret (defaults to settings if not provided)
            bearer_token: Twitter bearer token (defaults to settings if not provided)
            client: Pre-configured Twitter client (for testing)
        """
        self.api_key = api_key or settings.TWITTER_API_KEY
        self.api_secret = api_secret or settings.TWITTER_API_SECRET
        self.access_token = access_token or settings.TWITTER_ACCESS_TOKEN
        self.access_token_secret = access_token_secret or settings.TWITTER_ACCESS_TOKEN_SECRET
        self.bearer_token = bearer_token or settings.TWITTER_BEARER_TOKEN

        if client:
            self.client = client
        elif self._has_required_credentials():
            self._initialize_client()
        else:
            # Allow initialization without credentials for testing
            self.client = None

    def _has_required_credentials(self) -> bool:
        """Check if we have the minimum required credentials"""
        return bool(self.bearer_token or (self.api_key and self.api_secret))

    def _initialize_client(self) -> None:
        """Initialize Twitter API v2 client"""
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.access_token,
            access_token_secret=self.access_token_secret,
            wait_on_rate_limit=True
        )

    def _ensure_client(self) -> None:
        """Ensure client is initialized before use"""
        if not self.client:
            if not self._has_required_credentials():
                raise ValueError("Twitter API credentials are required")
            self._initialize_client()

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
                self._ensure_client()
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
            self._ensure_client()
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

    def get_current_user_info(self) -> Optional[Dict[str, Any]]:
        """Get current authenticated user's information from Twitter"""
        try:
            self._ensure_client()
            user = self.client.get_me(user_fields=["public_metrics"])
            if user.data:
                return {
                    "data": {
                        "id": user.data.id,
                        "username": user.data.username,
                        "name": user.data.name,
                        "followers_count": user.data.public_metrics["followers_count"],
                        "following_count": user.data.public_metrics["following_count"],
                        "tweet_count": user.data.public_metrics["tweet_count"]
                    },
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
            self._ensure_client()
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

# Factory function for dependency injection
def create_twitter_service(
    api_key: Optional[str] = None,
    api_secret: Optional[str] = None,
    access_token: Optional[str] = None,
    access_token_secret: Optional[str] = None,
    bearer_token: Optional[str] = None,
    client: Optional[tweepy.Client] = None
) -> TwitterService:
    """Create a Twitter service instance"""
    return TwitterService(
        api_key=api_key,
        api_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_token_secret,
        bearer_token=bearer_token,
        client=client
    )
