"""
Unit tests for content generation strategies.
Tests strategy pattern implementation and content generation logic.
"""

import pytest
from unittest.mock import Mock, AsyncMock
from app.core.content_strategies import (
    TweetGenerationStrategy,
    ThreadGenerationStrategy,
    ReplyGenerationStrategy,
    ContentGenerationContext
)
from app.core.types import ContentGenerationResult
from app.core.interfaces import ContentGeneratorInterface


class TestTweetGenerationStrategy:
    """Test TweetGenerationStrategy"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_generator = Mock(spec=ContentGeneratorInterface)
        self.strategy = TweetGenerationStrategy(self.mock_generator)
    
    @pytest.mark.asyncio
    async def test_generate_tweet_success(self):
        """Test successful tweet generation"""
        # Arrange
        self.mock_generator.generate_tweet = AsyncMock(return_value={
            "content": "Generated tweet content",
            "prompt": "Test prompt",
            "tokens_used": 50
        })
        
        # Act
        result = await self.strategy.generate(
            topic="AI trends",
            style="engaging",
            user_context="Additional context",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated tweet content"
        assert result.prompt == "Test prompt"
        assert result.tokens_used == 50
        assert result.metadata["type"] == "tweet"
        assert result.metadata["style"] == "engaging"
        assert result.metadata["language"] == "en"
        
        self.mock_generator.generate_tweet.assert_called_once_with(
            topic="AI trends",
            style="engaging",
            user_context="Additional context",
            language="en"
        )
    
    def test_validate_parameters_valid(self):
        """Test parameter validation with valid parameters"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            style="engaging",
            language="en"
        )
        assert result is True
    
    def test_validate_parameters_missing_required(self):
        """Test parameter validation with missing required parameters"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            style="engaging"
            # Missing language
        )
        assert result is False
    
    @pytest.mark.asyncio
    async def test_generate_invalid_parameters(self):
        """Test generation with invalid parameters"""
        with pytest.raises(ValueError, match="Invalid parameters"):
            await self.strategy.generate(
                topic="AI trends",
                style="engaging"
                # Missing language
            )


class TestThreadGenerationStrategy:
    """Test ThreadGenerationStrategy"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_generator = Mock(spec=ContentGeneratorInterface)
        self.strategy = ThreadGenerationStrategy(self.mock_generator)
    
    @pytest.mark.asyncio
    async def test_generate_thread_success(self):
        """Test successful thread generation"""
        # Arrange
        self.mock_generator.generate_thread = AsyncMock(return_value={
            "content": "Generated thread content",
            "prompt": "Thread prompt",
            "tokens_used": 150
        })
        
        # Act
        result = await self.strategy.generate(
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated thread content"
        assert result.prompt == "Thread prompt"
        assert result.tokens_used == 150
        assert result.metadata["type"] == "thread"
        assert result.metadata["num_tweets"] == 5
        assert result.metadata["style"] == "informative"
        assert result.metadata["language"] == "en"
        
        self.mock_generator.generate_thread.assert_called_once_with(
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en"
        )
    
    def test_validate_parameters_valid(self):
        """Test parameter validation with valid parameters"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en"
        )
        assert result is True
    
    def test_validate_parameters_default_num_tweets(self):
        """Test parameter validation with default num_tweets"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            style="informative",
            language="en"
        )
        assert result is True
    
    def test_validate_parameters_invalid_num_tweets_too_small(self):
        """Test parameter validation with invalid num_tweets (too small)"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            num_tweets=1,
            style="informative",
            language="en"
        )
        assert result is False
    
    def test_validate_parameters_invalid_num_tweets_too_large(self):
        """Test parameter validation with invalid num_tweets (too large)"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            num_tweets=30,
            style="informative",
            language="en"
        )
        assert result is False
    
    def test_validate_parameters_invalid_num_tweets_type(self):
        """Test parameter validation with invalid num_tweets type"""
        result = self.strategy.validate_parameters(
            topic="AI trends",
            num_tweets="five",
            style="informative",
            language="en"
        )
        assert result is False


class TestReplyGenerationStrategy:
    """Test ReplyGenerationStrategy"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_generator = Mock(spec=ContentGeneratorInterface)
        self.strategy = ReplyGenerationStrategy(self.mock_generator)
    
    @pytest.mark.asyncio
    async def test_generate_reply_success(self):
        """Test successful reply generation"""
        # Arrange
        self.mock_generator.generate_reply = AsyncMock(return_value={
            "content": "Generated reply content",
            "prompt": "Reply prompt",
            "tokens_used": 75
        })
        
        # Act
        result = await self.strategy.generate(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            user_context="Additional context",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated reply content"
        assert result.prompt == "Reply prompt"
        assert result.tokens_used == 75
        assert result.metadata["type"] == "reply"
        assert result.metadata["reply_style"] == "helpful"
        assert result.metadata["language"] == "en"
        assert "original_tweet_preview" in result.metadata
        
        self.mock_generator.generate_reply.assert_called_once_with(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            user_context="Additional context",
            language="en"
        )
    
    def test_validate_parameters_valid(self):
        """Test parameter validation with valid parameters"""
        result = self.strategy.validate_parameters(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            language="en"
        )
        assert result is True
    
    def test_validate_parameters_missing_required(self):
        """Test parameter validation with missing required parameters"""
        result = self.strategy.validate_parameters(
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful"
            # Missing language
        )
        assert result is False


class TestContentGenerationContext:
    """Test ContentGenerationContext"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_generator = Mock(spec=ContentGeneratorInterface)
        self.context = ContentGenerationContext(self.mock_generator)
    
    @pytest.mark.asyncio
    async def test_generate_content_tweet(self):
        """Test generating tweet content through context"""
        # Arrange
        self.mock_generator.generate_tweet = AsyncMock(return_value={
            "content": "Generated tweet content",
            "prompt": "Test prompt",
            "tokens_used": 50
        })
        
        # Act
        result = await self.context.generate_content(
            "tweet",
            topic="AI trends",
            style="engaging",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated tweet content"
        assert result.metadata["type"] == "tweet"
    
    @pytest.mark.asyncio
    async def test_generate_content_thread(self):
        """Test generating thread content through context"""
        # Arrange
        self.mock_generator.generate_thread = AsyncMock(return_value={
            "content": "Generated thread content",
            "prompt": "Thread prompt",
            "tokens_used": 150
        })
        
        # Act
        result = await self.context.generate_content(
            "thread",
            topic="AI trends",
            num_tweets=5,
            style="informative",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated thread content"
        assert result.metadata["type"] == "thread"
    
    @pytest.mark.asyncio
    async def test_generate_content_reply(self):
        """Test generating reply content through context"""
        # Arrange
        self.mock_generator.generate_reply = AsyncMock(return_value={
            "content": "Generated reply content",
            "prompt": "Reply prompt",
            "tokens_used": 75
        })
        
        # Act
        result = await self.context.generate_content(
            "reply",
            original_tweet="This is an interesting tweet about AI",
            reply_style="helpful",
            language="en"
        )
        
        # Assert
        assert isinstance(result, ContentGenerationResult)
        assert result.content == "Generated reply content"
        assert result.metadata["type"] == "reply"
    
    @pytest.mark.asyncio
    async def test_generate_content_unsupported_type(self):
        """Test generating content with unsupported type"""
        with pytest.raises(ValueError, match="Unsupported content type"):
            await self.context.generate_content(
                "unsupported_type",
                topic="AI trends"
            )
    
    def test_add_strategy(self):
        """Test adding new strategy to context"""
        # Arrange
        custom_strategy = Mock()
        
        # Act
        self.context.add_strategy("custom", custom_strategy)
        
        # Assert
        assert "custom" in self.context._strategies
        assert self.context._strategies["custom"] == custom_strategy
    
    def test_get_supported_types(self):
        """Test getting supported content types"""
        supported_types = self.context.get_supported_types()
        
        assert "tweet" in supported_types
        assert "thread" in supported_types
        assert "reply" in supported_types
        assert len(supported_types) == 3
