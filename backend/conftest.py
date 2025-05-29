"""
Test configuration and fixtures for AutoReach backend
"""

import pytest
import os
import sys
from pathlib import Path
from unittest.mock import Mock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Add the backend directory to Python path for tests
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set test environment variables before importing app modules
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["OPENAI_API_KEY"] = ""  # Empty for testing
os.environ["TWITTER_API_KEY"] = ""  # Empty for testing
os.environ["TWITTER_API_SECRET"] = ""  # Empty for testing
os.environ["TWITTER_ACCESS_TOKEN"] = ""  # Empty for testing
os.environ["TWITTER_ACCESS_TOKEN_SECRET"] = ""  # Empty for testing
os.environ["TWITTER_BEARER_TOKEN"] = ""  # Empty for testing

from app.main import app  # noqa: E402
from app.core.database import Base, get_db  # noqa: E402
from app.services.openai_service import create_openai_service  # noqa: E402
from app.services.twitter_service import create_twitter_service  # noqa: E402


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(test_db):
    """Create a database session for testing"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """Create a test client"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing"""
    mock_client = Mock()
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "Test generated content"
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


@pytest.fixture
def mock_openai_service():
    """Mock OpenAI service for testing"""
    mock_service = Mock()
    mock_service.generate_tweet.return_value = {
        "content": "Test generated tweet content",
        "prompt": "Test prompt",
        "tokens_used": 50
    }
    mock_service.generate_thread.return_value = {
        "content": ["Tweet 1", "Tweet 2", "Tweet 3"],
        "prompt": "Test thread prompt",
        "tokens_used": 150
    }
    mock_service.generate_reply.return_value = {
        "content": "Test generated reply content",
        "prompt": "Test reply prompt",
        "tokens_used": 75
    }
    return mock_service


@pytest.fixture
def mock_twitter_client():
    """Mock Twitter client for testing"""
    mock_client = Mock()
    mock_client.create_tweet.return_value = Mock(data={"id": "123456789"})
    mock_client.get_user.return_value = Mock(data={"id": "123", "username": "testuser"})
    return mock_client


@pytest.fixture
def openai_service(mock_openai_client):
    """Create OpenAI service with mocked client"""
    return create_openai_service(api_key="test-key", client=mock_openai_client)


@pytest.fixture
def twitter_service(mock_twitter_client):
    """Create Twitter service with mocked client"""
    return create_twitter_service(
        api_key="test-key",
        api_secret="test-secret",
        access_token="test-token",
        access_token_secret="test-token-secret",
        bearer_token="test-bearer",
        client=mock_twitter_client
    )
