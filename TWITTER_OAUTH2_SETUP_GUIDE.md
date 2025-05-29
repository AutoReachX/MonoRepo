# 🐦 Twitter OAuth 2.0 Setup Guide for AutoReach

This guide will help you properly set up Twitter OAuth 2.0 authentication for your AutoReach application.

## 🚨 Current Issues Fixed

✅ **Environment Variable Loading**: Fixed config to properly load `.env` file  
✅ **Redirect URI Configuration**: Updated to use correct OAuth 2.0 callback URL  
✅ **Frontend-Backend Consistency**: Aligned redirect URIs between frontend and backend  
✅ **Callback Flow**: Fixed to redirect users back to your app instead of staying on Twitter  

## 📋 Prerequisites

1. Twitter Developer Account
2. Twitter App created in the Developer Portal
3. OAuth 2.0 enabled for your Twitter App

## 🔧 Step 1: Configure Twitter Developer Portal

### 1.1 Go to Twitter Developer Portal
Visit: https://developer.twitter.com/en/portal/dashboard

### 1.2 Select Your App
- Click on your app name
- Go to "App settings" → "User authentication settings"

### 1.3 Configure OAuth 2.0 Settings
Set the following in your Twitter App settings:

**App permissions**: `Read`  
**Type of App**: `Web App, Automated App or Bot`  
**App info**:
- **Callback URI**: `http://localhost:3000/auth/twitter/oauth2-callback`
- **Website URL**: `http://localhost:3000`
- **Terms of service**: `http://localhost:3000/terms` (optional)
- **Privacy policy**: `http://localhost:3000/privacy` (optional)

### 1.4 Get Your Credentials
Go to "Keys and tokens" tab and copy:
- **Client ID** (OAuth 2.0)
- **Client Secret** (OAuth 2.0)
- **Bearer Token**

## 🔐 Step 2: Update Environment Variables

### 2.1 Edit `backend/.env`
Replace the placeholder values with your actual Twitter credentials:

```bash
# Twitter API Credentials (OAuth 2.0)
TWITTER_CLIENT_ID=your_actual_client_id_from_twitter
TWITTER_CLIENT_SECRET=your_actual_client_secret_from_twitter
TWITTER_BEARER_TOKEN=your_actual_bearer_token_from_twitter
TWITTER_OAUTH_REDIRECT_URI=http://localhost:3000/auth/twitter/oauth2-callback
```

**Important**: Replace `your_actual_*` with the real values from Twitter Developer Portal.

### 2.2 Verify Environment Loading
Run the test script to verify your environment variables are loading correctly:

```bash
cd backend
python test_env_loading.py
```

You should see all credentials marked as "✅ Set" and no placeholder warnings.

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

### 3.2 Test Authentication Flow
1. Go to `http://localhost:3000`
2. Click "Login with Twitter" or navigate to a page with Twitter OAuth
3. You should be redirected to Twitter for authorization
4. After authorizing, you should be redirected back to `http://localhost:3000/auth/twitter/oauth2-callback`
5. The callback page should process the authentication and redirect you to the dashboard
6. You should now be logged into your AutoReach app

## 🔍 Step 4: Troubleshooting

### Common Issues and Solutions

**Issue**: "Invalid redirect URI"
- **Solution**: Make sure the callback URI in Twitter Developer Portal exactly matches: `http://localhost:3000/auth/twitter/oauth2-callback`

**Issue**: "Client authentication failed"
- **Solution**: Verify your `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are correct

**Issue**: Environment variables not loading
- **Solution**: Run `python test_env_loading.py` to check if variables are properly set

**Issue**: Still redirected to Twitter after authorization
- **Solution**: Check that your callback page exists at `/auth/twitter/oauth2-callback`

### Debug Steps
1. Check backend logs for any OAuth errors
2. Verify frontend console for JavaScript errors
3. Ensure all environment variables are set correctly
4. Test the callback URL directly in browser

## 📝 Step 5: Production Setup

For production deployment:

1. Update callback URI to your production domain:
   ```
   https://yourdomain.com/auth/twitter/oauth2-callback
   ```

2. Update environment variables:
   ```bash
   TWITTER_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/twitter/oauth2-callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. Add production URLs to Twitter App settings in Developer Portal

## ✅ Verification Checklist

- [ ] Twitter App configured with correct callback URI
- [ ] Environment variables updated with real credentials
- [ ] `test_env_loading.py` shows all credentials as "Set"
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] OAuth flow redirects to Twitter
- [ ] After authorization, redirects back to your app
- [ ] User is successfully logged in

## 🆘 Need Help?

If you're still having issues:
1. Run the environment test script
2. Check the browser developer console for errors
3. Check backend logs for OAuth-related errors
4. Verify your Twitter App settings match this guide exactly
