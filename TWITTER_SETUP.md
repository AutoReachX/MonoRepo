# Twitter Authentication Setup Guide

This guide will help you set up Twitter OAuth authentication for AutoReach.

## 🐦 Twitter Developer Account Setup

### 1. Create Twitter Developer Account
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign in with your Twitter account
3. Apply for a developer account
4. Complete the application process (may take a few hours to approve)

### 2. Create a Twitter App
1. Once approved, go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" or "New Project"
3. Fill in your app details:
   - **App Name**: AutoReach (or your preferred name)
   - **Description**: AI-powered Twitter growth platform
   - **Website URL**: `http://localhost:3000` (for development)
   - **Callback URL**: `http://localhost:3000/auth/twitter/callback`

### 3. Get API Credentials
After creating your app, you'll need to get several credentials:

#### OAuth 1.0a Credentials (Required for posting tweets)
1. Go to your app settings
2. Navigate to "Keys and Tokens" tab
3. Copy the following:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
4. Generate Access Token and Secret:
   - Click "Generate" under "Access Token and Secret"
   - Copy **Access Token** and **Access Token Secret**

#### OAuth 2.0 Credentials (Optional, for future features)
1. In the same "Keys and Tokens" tab
2. Copy:
   - **Client ID**
   - **Client Secret**
   - **Bearer Token**

## 🔧 AutoReach Configuration

### 1. Update Environment Variables
Edit `backend/.env` file with your Twitter credentials:

```env
# Twitter API v1.1 (OAuth 1.0a - Required for posting tweets)
TWITTER_API_KEY=your_actual_api_key_here
TWITTER_API_SECRET=your_actual_api_secret_here
TWITTER_ACCESS_TOKEN=your_actual_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_actual_access_token_secret_here

# Twitter API Credentials (OAuth 2.0 - Optional)
TWITTER_CLIENT_ID=your_actual_client_id_here
TWITTER_CLIENT_SECRET=your_actual_client_secret_here
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
TWITTER_OAUTH_REDIRECT_URI=http://localhost:3000/auth/twitter/callback
```

### 2. Restart Backend
After updating the environment variables:
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 Testing Twitter Authentication

### 1. Test Connection
1. Go to `http://localhost:3000/test-connection`
2. Click "Run Connection Tests"
3. All tests should pass ✅

### 2. Test Twitter Auth Flow
1. Go to `http://localhost:3000/settings`
2. In the "Connected Accounts" section, click "Connect" next to Twitter
3. You'll be redirected to Twitter for authorization
4. After authorizing, you'll be redirected back to AutoReach
5. Your Twitter account should now show as "Connected" ✅

## 🔍 Troubleshooting

### Common Issues

#### "Invalid API Key" Error
- Double-check your `TWITTER_API_KEY` and `TWITTER_API_SECRET`
- Make sure there are no extra spaces or quotes
- Regenerate keys if necessary

#### "Callback URL Mismatch" Error
- Ensure your Twitter app's callback URL is exactly: `http://localhost:3000/auth/twitter/callback`
- Check that `TWITTER_OAUTH_REDIRECT_URI` in `.env` matches

#### "App Permissions" Error
- Go to your Twitter app settings
- Under "App Permissions", ensure you have "Read and Write" permissions
- Regenerate access tokens after changing permissions

#### "Authentication Failed" Error
- Make sure you're logged into AutoReach before trying to connect Twitter
- Clear browser cache and try again
- Check backend logs for detailed error messages

### Debug Steps
1. Check backend logs in terminal
2. Open browser developer tools (F12) and check console for errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly using the Swagger docs at `http://localhost:8000/docs`

## 📋 API Endpoints

The following Twitter auth endpoints are available:

- `GET /api/auth/twitter/login` - Initiate Twitter OAuth flow
- `POST /api/auth/twitter/callback` - Handle OAuth callback
- `GET /api/auth/twitter/status` - Check connection status
- `DELETE /api/auth/twitter/disconnect` - Disconnect Twitter account

## 🎯 Next Steps

Once Twitter authentication is working:

1. **Test Tweet Creation**: Try creating content in the Content page
2. **Schedule Posts**: Set up scheduled tweets
3. **View Analytics**: Check your Twitter growth metrics
4. **Production Setup**: When ready for production, update callback URLs to your live domain

## 🔒 Security Notes

- Never commit your actual API keys to version control
- Use environment variables for all sensitive credentials
- Regenerate tokens if they're ever compromised
- Consider using different Twitter apps for development and production

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Twitter's [API documentation](https://developer.twitter.com/en/docs)
3. Check AutoReach logs for detailed error messages
4. Ensure all dependencies are installed correctly

Happy tweeting! 🚀
