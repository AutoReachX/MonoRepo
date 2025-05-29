# Twitter OAuth Setup Guide for AutoReach

## 🎯 Overview
This guide will help you set up Twitter OAuth authentication for your AutoReach platform. The implementation uses OAuth 1.0a for posting tweets and OAuth 2.0 for reading data.

## 📋 Prerequisites
- Twitter Developer Account
- AutoReach backend and frontend running
- Access to environment variables

## 🔧 Step 1: Create Twitter Developer App

### 1.1 Go to Twitter Developer Portal
1. Visit [developer.twitter.com](https://developer.twitter.com)
2. Sign in with your Twitter account
3. Apply for a developer account if you don't have one

### 1.2 Create a New App
1. Go to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" or "New Project"
3. Fill in the required information:
   - **App Name**: `AutoReach-[YourName]` (must be unique)
   - **Description**: `AI-powered Twitter growth automation platform`
   - **Website URL**: `http://localhost:3000` (for development)
   - **Callback URL**: `http://localhost:3000/auth/twitter/callback`

### 1.3 Configure App Permissions
1. Go to your app settings
2. Navigate to "App permissions"
3. Select "Read and Write" permissions
4. Save changes

### 1.4 Generate API Keys
1. Go to "Keys and Tokens" tab
2. Generate/Copy the following:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token**
   - **Access Token** (generate if needed)
   - **Access Token Secret** (generate if needed)

## 🔐 Step 2: Update Environment Variables

### 2.1 Update backend/.env
```bash
# Twitter API v1.1 (OAuth 1.0a - Required for posting tweets)
TWITTER_API_KEY=your_actual_api_key_here
TWITTER_API_SECRET=your_actual_api_secret_here
TWITTER_ACCESS_TOKEN=your_actual_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_actual_access_token_secret_here

# Twitter API v2 (OAuth 2.0 - For reading data)
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_OAUTH_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 2.2 Update frontend/.env.local (create if doesn't exist)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚀 Step 3: Test the OAuth Flow

### 3.1 Start Your Services
```bash
# Terminal 1: Start backend
cd backend
python start_server.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 3.2 Test Authentication
1. Go to `http://localhost:3000`
2. Register/Login with a test account
3. Navigate to Settings or Profile page
4. Click "Connect Twitter Account"
5. You should be redirected to Twitter for authorization
6. After authorization, you should be redirected back with success message

## 🔍 Step 4: Verify Setup

### 4.1 Check Backend Logs
- Look for successful OAuth token exchange
- Verify no API key errors

### 4.2 Check Database
- Verify user record has Twitter fields populated:
  - `twitter_user_id`
  - `twitter_username`
  - `twitter_access_token`
  - `twitter_refresh_token`

### 4.3 Test API Endpoints
```bash
# Test Twitter status (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/auth/twitter/status
```

## 🛠️ Troubleshooting

### Common Issues:

#### 1. "Invalid API Key" Error
- Verify API keys are correctly copied
- Check for extra spaces or characters
- Ensure keys are for the correct app

#### 2. "Callback URL Mismatch" Error
- Verify callback URL in Twitter app matches exactly: `http://localhost:3000/auth/twitter/callback`
- Check for trailing slashes

#### 3. "OAuth Token Secret Not Found" Error
- This was fixed in the recent updates
- Ensure you're using the latest code

#### 4. CORS Errors
- Verify `FRONTEND_URL` is set correctly in backend/.env
- Check that frontend is running on the expected port

### Debug Steps:
1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify environment variables are loaded
4. Test with a fresh browser session (clear cookies/localStorage)

## 🔒 Security Notes

### For Production:
1. Use HTTPS URLs for all callback URLs
2. Store API keys securely (use environment variables)
3. Consider encrypting stored Twitter tokens
4. Implement token refresh logic
5. Add rate limiting for OAuth endpoints

### Environment Variables for Production:
```bash
TWITTER_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/twitter/callback
FRONTEND_URL=https://yourdomain.com
```

## 📚 Next Steps

After OAuth is working:
1. Test tweet posting functionality
2. Implement content generation with Twitter integration
3. Add scheduled posting features
4. Set up analytics tracking

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Check Twitter Developer Portal for app status
4. Review backend logs for detailed error messages

The OAuth implementation is now ready and should work with proper Twitter API credentials!
