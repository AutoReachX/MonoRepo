"""
Unit tests for core types (parameter objects).
Tests parameter object functionality and serialization.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session
from app.core.types import (
    ContentGenerationRequest,
    ThreadGenerationRequest,
    ReplyGenerationRequest,
    ContentGenerationResult,
    ValidationContext
)
from app.models.user import User


class TestContentGenerationRequest:
    """Test ContentGenerationRequest parameter object"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_user = Mock(spec=User)
        self.mock_user.id = 1
        self.mock_user.username = "testuser"
        
        self.mock_db = Mock(spec=Session)
    
    def test_content_generation_request_creation(self):
        """Test creating ContentGenerationRequest"""
        request = ContentGenerationRequest(
            topic="AI trends",
            style="engaging",
            language="en",
            user=self.mock_user,
            db=self.mock_db,
            user_context="Additional context"
        )
        
        assert request.topic == "AI trends"
        assert request.style == "engaging"
        assert request.language == "en"
        assert request.user == self.mock_user
        assert request.db == self.mock_db
        assert request.user_context == "Additional context"
    
    def test_content_generation_request_optional_context(self):
        """Test ContentGenerationRequest with optional context"""
        request = ContentGenerationRequest(
            topic="AI trends",
            style="engaging",
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )
        
        assert request.user_context is None
    
    def test_content_generation_request_to_dict(self):
        """Test ContentGenerationRequest to_dict method"""
        request = ContentGenerationRequest(
            topic="AI trends",
            style="engaging",
            language="en",
            user=self.mock_user,
            db=self.mock_db,
            user_context="Additional context"
        )
        
        result = request.to_dict()
        expected = {
            "topic": "AI trends",
            "style": "engaging",
            "language": "en",
            "user_context": "Additional context"
        }
        
        assert result == expected


class TestThreadGenerationRequest:
    """Test ThreadGenerationRequest parameter object"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_user = Mock(spec=User)
        self.mock_user.id = 1
        self.mock_user.username = "testuser"
        
        self.mock_db = Mock(spec=Session)
    
    def test_thread_generation_request_creation(self):
        """Test creating ThreadGenerationRequest"""
        request = ThreadGenerationRequest(
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )
        
        assert request.topic == "AI trends"
        assert request.num_tweets == 5
        assert request.style == "informative"
        assert request.language == "en"
        assert request.user == self.mock_user
        assert request.db == self.mock_db
    
    def test_thread_generation_request_to_dict(self):
        """Test ThreadGenerationRequest to_dict method"""
        request = ThreadGenerationRequest(
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )
        
        result = request.to_dict()
        expected = {
            "topic": "AI trends",
            "num_tweets": 5,
            "style": "informative",
            "language": "en"
        }
        
        assert result == expected


class TestReplyGenerationRequest:
    """Test ReplyGenerationRequest parameter object"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_user = Mock(spec=User)
        self.mock_user.id = 1
        self.mock_user.username = "testuser"
        
        self.mock_db = Mock(spec=Session)
    
    def test_reply_generation_request_creation(self):
        """Test creating ReplyGenerationRequest"""
        request = ReplyGenerationRequest(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            language="en",
            user=self.mock_user,
            db=self.mock_db,
            user_context="Additional context"
        )
        
        assert request.original_tweet == "This is an interesting tweet about AI"
        assert request.reply_style == "helpful"
        assert request.language == "en"
        assert request.user == self.mock_user
        assert request.db == self.mock_db
        assert request.user_context == "Additional context"
    
    def test_reply_generation_request_optional_context(self):
        """Test ReplyGenerationRequest with optional context"""
        request = ReplyGenerationRequest(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            language="en",
            user=self.mock_user,
            db=self.mock_db
        )
        
        assert request.user_context is None
    
    def test_reply_generation_request_to_dict(self):
        """Test ReplyGenerationRequest to_dict method"""
        request = ReplyGenerationRequest(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            language="en",
            user=self.mock_user,
            db=self.mock_db,
            user_context="Additional context"
        )
        
        result = request.to_dict()
        expected = {
            "original_tweet": "This is an interesting tweet about AI",
            "reply_style": "helpful",
            "language": "en",
            "user_context": "Additional context"
        }
        
        assert result == expected


class TestContentGenerationResult:
    """Test ContentGenerationResult"""
    
    def test_content_generation_result_creation(self):
        """Test creating ContentGenerationResult"""
        result = ContentGenerationResult(
            content="Generated content",
            prompt="Test prompt",
            tokens_used=50,
            metadata={"style": "engaging"}
        )
        
        assert result.content == "Generated content"
        assert result.prompt == "Test prompt"
        assert result.tokens_used == 50
        assert result.metadata == {"style": "engaging"}
    
    def test_content_generation_result_optional_fields(self):
        """Test ContentGenerationResult with optional fields"""
        result = ContentGenerationResult(
            content="Generated content",
            prompt="Test prompt"
        )
        
        assert result.content == "Generated content"
        assert result.prompt == "Test prompt"
        assert result.tokens_used is None
        assert result.metadata is None
    
    def test_content_generation_result_to_dict(self):
        """Test ContentGenerationResult to_dict method"""
        result = ContentGenerationResult(
            content="Generated content",
            prompt="Test prompt",
            tokens_used=50,
            metadata={"style": "engaging"}
        )
        
        result_dict = result.to_dict()
        expected = {
            "content": "Generated content",
            "prompt": "Test prompt",
            "tokens_used": 50,
            "metadata": {"style": "engaging"}
        }
        
        assert result_dict == expected
    
    def test_content_generation_result_to_dict_without_optional(self):
        """Test ContentGenerationResult to_dict without optional fields"""
        result = ContentGenerationResult(
            content="Generated content",
            prompt="Test prompt"
        )
        
        result_dict = result.to_dict()
        expected = {
            "content": "Generated content",
            "prompt": "Test prompt"
        }
        
        assert result_dict == expected


class TestValidationContext:
    """Test ValidationContext"""
    
    def test_validation_context_creation(self):
        """Test creating ValidationContext"""
        context = ValidationContext(
            field_name="topic",
            value="AI trends",
            rules={"min_length": 3, "max_length": 200},
            user_context={"user_id": 1}
        )
        
        assert context.field_name == "topic"
        assert context.value == "AI trends"
        assert context.rules == {"min_length": 3, "max_length": 200}
        assert context.user_context == {"user_id": 1}
    
    def test_validation_context_optional_user_context(self):
        """Test ValidationContext with optional user context"""
        context = ValidationContext(
            field_name="topic",
            value="AI trends",
            rules={"min_length": 3, "max_length": 200}
        )
        
        assert context.user_context is None
    
    def test_validation_context_to_dict(self):
        """Test ValidationContext to_dict method"""
        context = ValidationContext(
            field_name="topic",
            value="AI trends",
            rules={"min_length": 3, "max_length": 200},
            user_context={"user_id": 1}
        )
        
        result = context.to_dict()
        expected = {
            "field_name": "topic",
            "value": "AI trends",
            "rules": {"min_length": 3, "max_length": 200},
            "user_context": {"user_id": 1}
        }
        
        assert result == expected
