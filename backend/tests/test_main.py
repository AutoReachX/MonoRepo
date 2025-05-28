import os
import sys
from unittest.mock import patch

# Mock environment variables for testing
test_env = {
    "DATABASE_URL": "postgresql://test:test@localhost:5432/test",
    "SECRET_KEY": "test-secret-key",
    "REDIS_URL": "redis://localhost:6379",
    "DEBUG": "true"
}

with patch.dict(os.environ, test_env):
    from fastapi.testclient import TestClient
    from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to AutoReach API"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["version"] == "1.0.0"
