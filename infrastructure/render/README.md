# AutoReach Render Deployment Guide

This guide will help you deploy the AutoReach platform to Render.com.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **API Keys**: Gather your Twitter API and OpenAI API credentials

## Deployment Options

### Option 1: One-Click Deploy (Recommended)
Use the `render.yaml` blueprint for automatic deployment of all services.

### Option 2: Manual Setup
Deploy each service individually through the Render dashboard.

## Quick Deploy Steps

### 1. Connect GitHub Repository
1. Go to your Render dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your AutoReach code

### 2. Configure Environment Variables
The blueprint will create the services, but you'll need to add these environment variables:

**Backend Service Environment Variables:**
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_OAUTH_REDIRECT_URI=https://your-frontend-url.onrender.com/auth/twitter/oauth2-callback
OPENAI_API_KEY=your_openai_api_key
SMTP_HOST=smtp.gmail.com (optional)
SMTP_PORT=587 (optional)
SMTP_USER=your_email@gmail.com (optional)
SMTP_PASSWORD=your_app_password (optional)
```

**Frontend Service Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 3. Deploy
1. Click "Apply" to deploy all services
2. Wait for all services to build and deploy
3. Update the CORS settings in your backend once you have the frontend URL

## Service URLs
After deployment, you'll have:
- **Frontend**: `https://autoreach-frontend.onrender.com`
- **Backend API**: `https://autoreach-backend.onrender.com`
- **API Docs**: `https://autoreach-backend.onrender.com/docs`

## Post-Deployment Configuration

### 1. Update CORS Settings
Once you have your frontend URL, update the backend CORS settings:

1. Go to your backend service in Render
2. Add environment variable:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

### 2. Update Twitter OAuth Redirect URI
Update your Twitter app settings:
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Update the OAuth redirect URI to: `https://your-frontend-url.onrender.com/auth/twitter/oauth2-callback`

### 3. Test the Deployment
1. Visit your frontend URL
2. Test the connection to the backend
3. Try the Twitter OAuth flow
4. Test content generation features

## Troubleshooting

### Common Issues

**Build Failures:**
- Check the build logs in Render dashboard
- Ensure all dependencies are in requirements.txt/package.json
- Verify Python/Node versions are compatible

**Database Connection Issues:**
- Verify DATABASE_URL is correctly set
- Check if database service is running
- Ensure database migrations have run

**CORS Errors:**
- Update ALLOWED_HOSTS in backend config
- Verify FRONTEND_URL environment variable
- Check that frontend URL is correctly set

**Twitter OAuth Issues:**
- Verify redirect URI matches exactly
- Check Twitter API credentials
- Ensure OAuth 2.0 is enabled in Twitter app

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Create PostgreSQL Database
1. Go to Render dashboard
2. Click "New" → "PostgreSQL"
3. Name: `autoreach-db`
4. Plan: Free
5. Note the connection string

### 2. Create Redis Instance
1. Click "New" → "Redis"
2. Name: `autoreach-redis`
3. Plan: Free
4. Note the connection string

### 3. Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Root Directory: `backend`
4. Runtime: Python 3
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add all environment variables listed above

### 4. Deploy Frontend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Root Directory: `frontend`
4. Runtime: Node
5. Build Command: `npm ci && npm run build`
6. Start Command: `npm start`
7. Add environment variables listed above

## Monitoring and Maintenance

### Health Checks
- Backend health endpoint: `/health`
- Monitor service logs in Render dashboard
- Set up alerts for service failures

### Database Maintenance
- Regular backups are handled by Render
- Monitor database usage and upgrade plan if needed
- Consider connection pooling for high traffic

### Performance Optimization
- Enable caching where appropriate
- Monitor response times
- Consider upgrading to paid plans for better performance

## Support

For deployment issues:
1. Check Render documentation
2. Review service logs
3. Check GitHub repository issues
4. Contact Render support if needed
