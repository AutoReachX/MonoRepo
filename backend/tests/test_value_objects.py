"""
Unit tests for value objects.
Tests domain validation and immutability.
"""

import pytest
from app.core.value_objects import (
    Topic, ContentStyle, Language, ThreadSize,
    UserContext, TweetContent
)
from app.core.exceptions import ValidationError


class TestTopic:
    """Test Topic value object"""

    def test_valid_topic_creation(self):
        """Test creating a valid topic"""
        topic = Topic("AI and machine learning")
        assert str(topic) == "AI and machine learning"
        assert topic.length == 23

    def test_topic_strips_whitespace(self):
        """Test topic strips leading/trailing whitespace"""
        topic = Topic("  AI trends  ")
        assert str(topic) == "AI trends"
        assert topic.length == 9

    def test_empty_topic_raises_error(self):
        """Test empty topic raises ValidationError"""
        with pytest.raises(ValidationError, match="Topic cannot be empty"):
            Topic("")

        with pytest.raises(ValidationError, match="Topic cannot be empty"):
            Topic("   ")

    def test_topic_too_short_raises_error(self):
        """Test topic too short raises ValidationError"""
        with pytest.raises(ValidationError, match="Topic must be at least"):
            Topic("AI")

    def test_topic_too_long_raises_error(self):
        """Test topic too long raises ValidationError"""
        long_topic = "A" * 201  # Assuming max length is 200
        with pytest.raises(ValidationError, match="Topic cannot exceed"):
            Topic(long_topic)

    def test_topic_immutability(self):
        """Test topic is immutable"""
        topic = Topic("AI trends")
        with pytest.raises(AttributeError):
            topic.value = "New value"


class TestContentStyle:
    """Test ContentStyle value object"""

    def test_valid_style_creation(self):
        """Test creating valid content styles"""
        style = ContentStyle("engaging")
        assert str(style) == "engaging"

    def test_invalid_style_raises_error(self):
        """Test invalid style raises ValidationError"""
        with pytest.raises(ValidationError, match="Invalid style"):
            ContentStyle("invalid_style")

    def test_default_style(self):
        """Test default style creation"""
        style = ContentStyle.default()
        assert isinstance(style, ContentStyle)

    def test_style_immutability(self):
        """Test style is immutable"""
        style = ContentStyle("engaging")
        with pytest.raises(AttributeError):
            style.value = "professional"


class TestLanguage:
    """Test Language value object"""

    def test_valid_language_creation(self):
        """Test creating valid language"""
        lang = Language("en")
        assert str(lang) == "en"

    def test_invalid_language_raises_error(self):
        """Test invalid language raises ValidationError"""
        with pytest.raises(ValidationError, match="Unsupported language"):
            Language("invalid")

    def test_default_language(self):
        """Test default language creation"""
        lang = Language.default()
        assert isinstance(lang, Language)

    def test_language_immutability(self):
        """Test language is immutable"""
        lang = Language("en")
        with pytest.raises(AttributeError):
            lang.code = "es"


class TestThreadSize:
    """Test ThreadSize value object"""

    def test_valid_thread_size_creation(self):
        """Test creating valid thread size"""
        size = ThreadSize(5)
        assert int(size) == 5
        assert str(size) == "5"

    def test_thread_size_too_small_raises_error(self):
        """Test thread size too small raises ValidationError"""
        with pytest.raises(ValidationError, match="Thread size must be at least"):
            ThreadSize(1)

    def test_thread_size_too_large_raises_error(self):
        """Test thread size too large raises ValidationError"""
        with pytest.raises(ValidationError, match="Thread size cannot exceed"):
            ThreadSize(30)  # Assuming max is 25

    def test_thread_size_immutability(self):
        """Test thread size is immutable"""
        size = ThreadSize(5)
        with pytest.raises(AttributeError):
            size.value = 10


class TestUserContext:
    """Test UserContext value object"""

    def test_valid_user_context_creation(self):
        """Test creating valid user context"""
        context = UserContext("Additional context for generation")
        assert str(context) == "Additional context for generation"
        assert not context.is_empty
        assert context.length > 0

    def test_empty_user_context(self):
        """Test empty user context"""
        context = UserContext()
        assert str(context) == ""
        assert context.is_empty
        assert context.length == 0

        context_none = UserContext(None)
        assert str(context_none) == ""
        assert context_none.is_empty
        assert context_none.length == 0

    def test_user_context_too_long_raises_error(self):
        """Test user context too long raises ValidationError"""
        long_context = "A" * 2001  # MAX_CONTENT_LENGTH is 2000
        with pytest.raises(ValidationError, match="User context cannot exceed"):
            UserContext(long_context)

    def test_user_context_immutability(self):
        """Test user context is immutable"""
        context = UserContext("Test context")
        with pytest.raises(AttributeError):
            context.value = "New context"


class TestTweetContent:
    """Test TweetContent value object"""

    def test_valid_tweet_content_creation(self):
        """Test creating valid tweet content"""
        content = TweetContent("This is a test tweet #AI @user")
        assert str(content) == "This is a test tweet #AI @user"
        assert content.length == 30
        assert content.remaining_characters == 250  # Assuming 280 char limit
        assert content.hashtag_count == 1
        assert content.mention_count == 1

    def test_empty_tweet_content_raises_error(self):
        """Test empty tweet content raises ValidationError"""
        with pytest.raises(ValidationError, match="Tweet content cannot be empty"):
            TweetContent("")

        with pytest.raises(ValidationError, match="Tweet content cannot be empty"):
            TweetContent("   ")

    def test_tweet_content_too_long_raises_error(self):
        """Test tweet content too long raises ValidationError"""
        long_content = "A" * 281  # Assuming 280 char limit
        with pytest.raises(ValidationError, match="Tweet content cannot exceed"):
            TweetContent(long_content)

    def test_hashtag_counting(self):
        """Test hashtag counting in tweet content"""
        content = TweetContent("Test #AI #MachineLearning #Tech")
        assert content.hashtag_count == 3

    def test_mention_counting(self):
        """Test mention counting in tweet content"""
        content = TweetContent("Hello @user1 and @user2 and @user3")
        assert content.mention_count == 3

    def test_tweet_content_immutability(self):
        """Test tweet content is immutable"""
        content = TweetContent("Test tweet")
        with pytest.raises(AttributeError):
            content.value = "New tweet"

    def test_remaining_characters_calculation(self):
        """Test remaining characters calculation"""
        content = TweetContent("Short tweet")
        expected_remaining = 280 - len("Short tweet")
        assert content.remaining_characters == expected_remaining
