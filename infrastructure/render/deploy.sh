#!/bin/bash

# AutoReach Render Deployment Script
# This script helps prepare your project for Render deployment

echo "🚀 AutoReach Render Deployment Helper"
echo "======================================"
echo

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the AutoReach project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check for required files
echo "📋 Checking deployment requirements..."

# Check backend requirements
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ backend/requirements.txt not found"
    exit 1
fi

# Check frontend package.json
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found"
    exit 1
fi

# Check for .env.example
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found"
    exit 1
fi

echo "✅ All required files found"

# Update backend config for production
echo "🔧 Updating backend configuration for production..."

# Update CORS settings to include production URLs
cat > backend/app/core/config_prod.py << 'EOF'
import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "AutoReach"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    VERSION: str = "1.0.0"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/autoreach")

    # CORS - Updated for production
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        os.getenv("FRONTEND_URL", ""),
        "https://*.onrender.com"
    ]

    # Twitter API (OAuth 2.0)
    TWITTER_CLIENT_ID: str = os.getenv("TWITTER_CLIENT_ID", "")
    TWITTER_CLIENT_SECRET: str = os.getenv("TWITTER_CLIENT_SECRET", "")
    TWITTER_BEARER_TOKEN: str = os.getenv("TWITTER_BEARER_TOKEN", "")
    TWITTER_OAUTH_REDIRECT_URI: str = os.getenv("TWITTER_OAUTH_REDIRECT_URI", "http://localhost:3000/auth/twitter/oauth2-callback")

    # Twitter API v1.1 (for tweepy compatibility)
    TWITTER_API_KEY: str = os.getenv("TWITTER_API_KEY", "")
    TWITTER_API_SECRET: str = os.getenv("TWITTER_API_SECRET", "")
    TWITTER_ACCESS_TOKEN: str = os.getenv("TWITTER_ACCESS_TOKEN", "")
    TWITTER_ACCESS_TOKEN_SECRET: str = os.getenv("TWITTER_ACCESS_TOKEN_SECRET", "")

    # OpenAI API
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Redis (for Celery)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # Email settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        env_file = [".env"]
        env_file_encoding = 'utf-8'

settings = Settings()
EOF

echo "✅ Production config created"

# Create Render build script for backend
echo "📝 Creating backend build script..."
cat > backend/build.sh << 'EOF'
#!/bin/bash
# Render build script for backend

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Setting up database..."
# Database tables will be created automatically by SQLAlchemy
python -c "
from app.models import Base
from app.core.database import engine
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Database setup complete!')
"

echo "Backend build complete!"
EOF

chmod +x backend/build.sh

# Create Render start script for backend
cat > backend/start.sh << 'EOF'
#!/bin/bash
# Render start script for backend

echo "Starting AutoReach Backend..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
EOF

chmod +x backend/start.sh

echo "✅ Backend scripts created"

# Update frontend for production
echo "🔧 Updating frontend configuration..."

# Add engines to package.json if not present
cd frontend
if ! grep -q '"engines"' package.json; then
    echo "Adding Node.js engine specification..."
    npm pkg set engines.node=">=18.0.0"
fi
cd ..

echo "✅ Frontend configuration updated"

# Create deployment checklist
echo "📋 Creating deployment checklist..."
cat > infrastructure/render/DEPLOYMENT_CHECKLIST.md << 'EOF'
# AutoReach Deployment Checklist

## Pre-Deployment Setup

### 1. Render Account Setup
- [ ] Create account at render.com
- [ ] Connect GitHub repository
- [ ] Verify billing information (even for free tier)

### 2. API Keys and Credentials
- [ ] Twitter API credentials ready
  - [ ] Client ID
  - [ ] Client Secret  
  - [ ] Bearer Token
- [ ] OpenAI API key ready
- [ ] Generate secure SECRET_KEY

### 3. Repository Preparation
- [ ] Code pushed to GitHub
- [ ] All dependencies listed in requirements.txt/package.json
- [ ] Environment variables documented

## Deployment Steps

### 1. Deploy Database Services
- [ ] Create PostgreSQL database
  - Name: autoreach-db
  - Plan: Free
  - Note connection string
- [ ] Create Redis instance
  - Name: autoreach-redis
  - Plan: Free
  - Note connection string

### 2. Deploy Backend API
- [ ] Create Web Service
- [ ] Connect GitHub repo
- [ ] Set root directory: backend
- [ ] Set build command: pip install -r requirements.txt
- [ ] Set start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- [ ] Add all environment variables
- [ ] Deploy and verify health check

### 3. Deploy Frontend
- [ ] Create Web Service
- [ ] Connect GitHub repo
- [ ] Set root directory: frontend
- [ ] Set build command: npm ci && npm run build
- [ ] Set start command: npm start
- [ ] Add NEXT_PUBLIC_API_URL environment variable
- [ ] Deploy and verify loading

### 4. Post-Deployment Configuration
- [ ] Update CORS settings with frontend URL
- [ ] Update Twitter OAuth redirect URI
- [ ] Test authentication flow
- [ ] Verify all features working

## Testing Checklist

### Backend Testing
- [ ] Health endpoint responds: /health
- [ ] API docs accessible: /docs
- [ ] Database connection working
- [ ] Redis connection working

### Frontend Testing
- [ ] Site loads correctly
- [ ] API connection working
- [ ] Twitter OAuth flow working
- [ ] All pages accessible
- [ ] Mobile responsive

### Integration Testing
- [ ] User registration/login
- [ ] Content creation
- [ ] Twitter posting
- [ ] Analytics display

## Troubleshooting

### Common Issues
- Build failures: Check logs for missing dependencies
- Database errors: Verify connection string and migrations
- CORS errors: Update ALLOWED_HOSTS configuration
- OAuth errors: Verify redirect URI matches exactly

### Performance
- Monitor service metrics in Render dashboard
- Consider upgrading to paid plans for better performance
- Implement caching strategies if needed
EOF

echo "✅ Deployment checklist created"

echo
echo "🎉 Deployment preparation complete!"
echo
echo "Next steps:"
echo "1. Review the files in infrastructure/render/"
echo "2. Follow the deployment guide in infrastructure/render/README.md"
echo "3. Use the checklist in infrastructure/render/DEPLOYMENT_CHECKLIST.md"
echo
echo "Files created:"
echo "- infrastructure/render/render.yaml (Blueprint for one-click deploy)"
echo "- infrastructure/render/README.md (Comprehensive deployment guide)"
echo "- infrastructure/render/backend-deploy.md (Backend-specific instructions)"
echo "- infrastructure/render/DEPLOYMENT_CHECKLIST.md (Step-by-step checklist)"
echo "- backend/build.sh (Backend build script)"
echo "- backend/start.sh (Backend start script)"
echo
echo "🚀 Ready to deploy to Render!"
