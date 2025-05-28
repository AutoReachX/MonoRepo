"""
Interfaces and protocols for dependency inversion.
Following SOLID principles by defining contracts for services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime


class ContentGeneratorInterface(ABC):
    """Interface for content generation services"""
    
    @abstractmethod
    async def generate_tweet(
        self,
        topic: str,
        style: str = "engaging",
        user_context: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a single tweet"""
        pass
    
    @abstractmethod
    async def generate_thread(
        self,
        topic: str,
        num_tweets: int = 3,
        style: str = "informative",
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a Twitter thread"""
        pass
    
    @abstractmethod
    async def generate_reply(
        self,
        original_tweet: str,
        reply_style: str = "helpful",
        user_context: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a reply to a tweet"""
        pass


class SocialMediaInterface(ABC):
    """Interface for social media platform services"""
    
    @abstractmethod
    def post_tweet(
        self,
        text: str,
        user_access_token: Optional[str] = None,
        user_access_token_secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """Post a tweet to the platform"""
        pass
    
    @abstractmethod
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile information"""
        pass
    
    @abstractmethod
    def get_tweet_analytics(self, tweet_id: str) -> Dict[str, Any]:
        """Get analytics for a specific tweet"""
        pass


class CacheInterface(ABC):
    """Interface for caching services"""
    
    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        pass
    
    @abstractmethod
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        pass


class NotificationInterface(ABC):
    """Interface for notification services"""
    
    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """Send email notification"""
        pass
    
    @abstractmethod
    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send push notification"""
        pass


class AnalyticsInterface(ABC):
    """Interface for analytics services"""
    
    @abstractmethod
    async def track_event(
        self,
        user_id: str,
        event_name: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Track user event"""
        pass
    
    @abstractmethod
    async def get_user_analytics(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get analytics for a user"""
        pass


class ValidationInterface(ABC):
    """Interface for validation services"""
    
    @abstractmethod
    def validate_tweet_content(self, content: str) -> Dict[str, Any]:
        """Validate tweet content"""
        pass
    
    @abstractmethod
    def validate_user_input(self, data: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user input against rules"""
        pass


class SchedulerInterface(ABC):
    """Interface for scheduling services"""
    
    @abstractmethod
    async def schedule_task(
        self,
        task_name: str,
        scheduled_time: datetime,
        task_data: Dict[str, Any]
    ) -> str:
        """Schedule a task for execution"""
        pass
    
    @abstractmethod
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a scheduled task"""
        pass
    
    @abstractmethod
    async def get_scheduled_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get scheduled tasks for a user"""
        pass
