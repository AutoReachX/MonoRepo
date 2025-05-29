# Backend Deployment Configuration

## Service Configuration

**Service Type**: Web Service
**Runtime**: Python 3.11
**Plan**: Free (can upgrade to paid for better performance)

## Build Configuration

**Root Directory**: `backend`
**Build Command**: 
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables

### Required Variables
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
REDIS_URL=redis://username:password@hostname:port
SECRET_KEY=your-super-secret-key-here-change-in-production
DEBUG=false
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Twitter API Variables
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_OAUTH_REDIRECT_URI=https://your-frontend-url.onrender.com/auth/twitter/oauth2-callback
```

### OpenAI API Variables
```
OPENAI_API_KEY=your_openai_api_key
```

### Optional Email Variables
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Health Check

**Health Check Path**: `/health`

The backend includes a health check endpoint that Render will use to monitor service health.

## Database Migrations

After the first deployment, you may need to run database migrations:

1. Go to your service in Render dashboard
2. Open the Shell tab
3. Run migration commands:
```bash
cd backend
python -c "from app.models import Base; from app.core.database import engine; Base.metadata.create_all(bind=engine)"
```

## CORS Configuration

The backend is configured to allow requests from your frontend. Make sure to update the `FRONTEND_URL` environment variable with your actual frontend URL after deployment.

## API Documentation

Once deployed, your API documentation will be available at:
- Swagger UI: `https://your-backend-url.onrender.com/docs`
- ReDoc: `https://your-backend-url.onrender.com/redoc`

## Performance Considerations

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- 512MB RAM limit
- Shared CPU

### Optimization Tips
1. **Database Connection Pooling**: Already configured in SQLAlchemy
2. **Caching**: Redis is available for caching
3. **Background Tasks**: Celery is configured for async tasks
4. **Monitoring**: Use Render's built-in monitoring

## Troubleshooting

### Common Build Issues

**Missing Dependencies**:
```bash
# Make sure all dependencies are in requirements.txt
pip freeze > requirements.txt
```

**Python Version Issues**:
- Render uses Python 3.11 by default
- Ensure your code is compatible

### Runtime Issues

**Database Connection Errors**:
- Verify DATABASE_URL is correct
- Check if database service is running
- Ensure database allows connections

**Import Errors**:
- Check that all modules are properly installed
- Verify Python path is correct

**Environment Variable Issues**:
- Double-check all required variables are set
- Ensure no typos in variable names
- Check that sensitive values are properly escaped

### Performance Issues

**Slow Response Times**:
- Check database query performance
- Monitor CPU and memory usage
- Consider upgrading to paid plan

**Service Timeouts**:
- Increase timeout settings if needed
- Optimize slow endpoints
- Use background tasks for long operations

## Security Considerations

1. **Secret Key**: Generate a strong, unique secret key
2. **Database Credentials**: Use strong passwords
3. **API Keys**: Keep Twitter and OpenAI keys secure
4. **CORS**: Only allow necessary origins
5. **HTTPS**: Render provides HTTPS by default

## Monitoring and Logging

### Built-in Monitoring
- Service health checks
- Resource usage metrics
- Error rate monitoring

### Custom Logging
The FastAPI app includes structured logging. Check logs in the Render dashboard for:
- Request/response logs
- Error messages
- Performance metrics

### Alerts
Set up alerts in Render for:
- Service downtime
- High error rates
- Resource usage spikes
