"""
Validation service following Single Responsibility Principle.
Handles all input validation logic in one place.
"""

import re
from typing import Dict, Any, List, Optional
from app.core.interfaces import ValidationInterface
from app.core.constants import ValidationRules, TwitterConstants, ContentConstants
from app.core.exceptions import ValidationError


class ValidationService(ValidationInterface):
    """Service for validating user inputs and content"""
    
    def validate_tweet_content(self, content: str) -> Dict[str, Any]:
        """Validate tweet content according to Twitter rules"""
        errors = []
        
        if not content or not content.strip():
            errors.append("Tweet content cannot be empty")
        
        if len(content) > TwitterConstants.MAX_TWEET_LENGTH:
            errors.append(f"Tweet content exceeds {TwitterConstants.MAX_TWEET_LENGTH} characters")
        
        if len(content.strip()) < ValidationRules.MIN_CONTENT_LENGTH:
            errors.append(f"Tweet content must be at least {ValidationRules.MIN_CONTENT_LENGTH} character")
        
        # Check for potentially problematic content
        if self._contains_excessive_hashtags(content):
            errors.append("Tweet contains too many hashtags (max 3 recommended)")
        
        if self._contains_excessive_mentions(content):
            errors.append("Tweet contains too many mentions (max 5 recommended)")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "character_count": len(content),
            "remaining_characters": TwitterConstants.MAX_TWEET_LENGTH - len(content)
        }
    
    def validate_user_input(self, data: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user input against provided rules"""
        errors = []
        
        for field, field_rules in rules.items():
            value = data.get(field)
            field_errors = self._validate_field(field, value, field_rules)
            errors.extend(field_errors)
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
    
    def validate_content_generation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content generation request"""
        errors = []
        
        # Validate topic
        topic = data.get("topic", "").strip()
        if not topic:
            errors.append("Topic is required")
        elif len(topic) < ValidationRules.MIN_TOPIC_LENGTH:
            errors.append(f"Topic must be at least {ValidationRules.MIN_TOPIC_LENGTH} characters")
        elif len(topic) > ValidationRules.MAX_TOPIC_LENGTH:
            errors.append(f"Topic cannot exceed {ValidationRules.MAX_TOPIC_LENGTH} characters")
        
        # Validate style
        style = data.get("style", ContentConstants.DEFAULT_STYLE)
        if style not in ContentConstants.SUPPORTED_STYLES:
            errors.append(f"Style must be one of: {', '.join(ContentConstants.SUPPORTED_STYLES)}")
        
        # Validate language
        language = data.get("language", ContentConstants.DEFAULT_LANGUAGE)
        if language not in ContentConstants.SUPPORTED_LANGUAGES:
            errors.append(f"Language must be one of: {', '.join(ContentConstants.SUPPORTED_LANGUAGES)}")
        
        # Validate user context if provided
        user_context = data.get("user_context")
        if user_context and len(user_context) > ValidationRules.MAX_CONTENT_LENGTH:
            errors.append(f"User context cannot exceed {ValidationRules.MAX_CONTENT_LENGTH} characters")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
    
    def validate_thread_generation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate thread generation request"""
        errors = []
        
        # First validate as regular content generation
        base_validation = self.validate_content_generation_request(data)
        errors.extend(base_validation["errors"])
        
        # Validate number of tweets
        num_tweets = data.get("num_tweets", TwitterConstants.DEFAULT_THREAD_SIZE)
        if not isinstance(num_tweets, int):
            errors.append("Number of tweets must be an integer")
        elif num_tweets < 2:
            errors.append("Thread must contain at least 2 tweets")
        elif num_tweets > TwitterConstants.MAX_THREAD_TWEETS:
            errors.append(f"Thread cannot exceed {TwitterConstants.MAX_THREAD_TWEETS} tweets")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
    
    def validate_scheduled_post_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate scheduled post request"""
        errors = []
        
        # Validate content
        content = data.get("content", "").strip()
        content_validation = self.validate_tweet_content(content)
        if not content_validation["is_valid"]:
            errors.extend(content_validation["errors"])
        
        # Validate scheduled time
        scheduled_time = data.get("scheduled_time")
        if not scheduled_time:
            errors.append("Scheduled time is required")
        # Additional datetime validation would go here
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
    
    def _validate_field(self, field_name: str, value: Any, rules: Dict[str, Any]) -> List[str]:
        """Validate a single field against its rules"""
        errors = []
        
        # Required validation
        if rules.get("required", False) and (value is None or value == ""):
            errors.append(f"{field_name} is required")
            return errors  # No point in further validation if required field is missing
        
        # Skip further validation if field is optional and empty
        if value is None or value == "":
            return errors
        
        # Type validation
        expected_type = rules.get("type")
        if expected_type and not isinstance(value, expected_type):
            errors.append(f"{field_name} must be of type {expected_type.__name__}")
            return errors
        
        # String-specific validations
        if isinstance(value, str):
            min_length = rules.get("min_length")
            if min_length and len(value) < min_length:
                errors.append(f"{field_name} must be at least {min_length} characters")
            
            max_length = rules.get("max_length")
            if max_length and len(value) > max_length:
                errors.append(f"{field_name} cannot exceed {max_length} characters")
            
            pattern = rules.get("pattern")
            if pattern and not re.match(pattern, value):
                errors.append(f"{field_name} format is invalid")
        
        # Numeric validations
        if isinstance(value, (int, float)):
            min_value = rules.get("min_value")
            if min_value is not None and value < min_value:
                errors.append(f"{field_name} must be at least {min_value}")
            
            max_value = rules.get("max_value")
            if max_value is not None and value > max_value:
                errors.append(f"{field_name} cannot exceed {max_value}")
        
        # Choice validation
        choices = rules.get("choices")
        if choices and value not in choices:
            errors.append(f"{field_name} must be one of: {', '.join(map(str, choices))}")
        
        return errors
    
    def _contains_excessive_hashtags(self, content: str) -> bool:
        """Check if content contains too many hashtags"""
        hashtags = re.findall(r'#\w+', content)
        return len(hashtags) > 3
    
    def _contains_excessive_mentions(self, content: str) -> bool:
        """Check if content contains too many mentions"""
        mentions = re.findall(r'@\w+', content)
        return len(mentions) > 5


# Global instance for dependency injection
validation_service = ValidationService()
