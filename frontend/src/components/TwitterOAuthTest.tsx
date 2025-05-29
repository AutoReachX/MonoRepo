'use client';

import React, { useState, useEffect } from 'react';
import { twitterAuthService } from '@/lib/twitterAuthService';
import { authService } from '@/lib/authService';

interface TwitterOAuthTestProps {
  className?: string;
}

export default function TwitterOAuthTest({ className = '' }: TwitterOAuthTestProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [twitterStatus, setTwitterStatus] = useState<{
    connected: boolean;
    twitter_username?: string;
    twitter_user_id?: string;
  }>({ connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      await loadTwitterStatus();
    }
  };

  const loadTwitterStatus = async () => {
    try {
      setError(null);
      const status = await twitterAuthService.getTwitterStatus();
      setTwitterStatus(status);
    } catch (error: any) {
      setError(`Failed to load Twitter status: ${error.message}`);
    }
  };

  const handleConnectTwitter = async () => {
    if (!isAuthenticated) {
      setError('Please log in first to connect your Twitter account');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const authData = await twitterAuthService.initiateTwitterAuth();
      
      // Store oauth_token_secret for the callback
      sessionStorage.setItem('twitter_oauth_token_secret', authData.oauth_token_secret);
      sessionStorage.setItem('twitter_oauth_token', authData.oauth_token);
      
      setSuccess('Redirecting to Twitter for authorization...');
      
      // Redirect to Twitter authorization
      setTimeout(() => {
        window.location.href = authData.authorization_url;
      }, 1000);
      
    } catch (error: any) {
      setError(`Failed to connect Twitter: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleDisconnectTwitter = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await twitterAuthService.disconnectTwitter();
      setSuccess('Twitter account disconnected successfully');
      await loadTwitterStatus();
    } catch (error: any) {
      setError(`Failed to disconnect Twitter: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTwitterConnection = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loadTwitterStatus();
      setSuccess('Twitter status refreshed successfully');
    } catch (error: any) {
      setError(`Failed to test connection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🐦 Twitter OAuth Test
      </h2>

      {/* Authentication Status */}
      <div className="mb-4 p-3 rounded-md bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2">Authentication Status</h3>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">
            {isAuthenticated ? 'Logged in to AutoReach' : 'Not logged in'}
          </span>
        </div>
      </div>

      {/* Twitter Status */}
      <div className="mb-4 p-3 rounded-md bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2">Twitter Connection Status</h3>
        <div className="flex items-center space-x-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${twitterStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">
            {twitterStatus.connected ? 'Connected to Twitter' : 'Not connected to Twitter'}
          </span>
        </div>
        {twitterStatus.connected && (
          <div className="text-sm text-gray-600">
            <p>Username: @{twitterStatus.twitter_username}</p>
            <p>User ID: {twitterStatus.twitter_user_id}</p>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-green-700 text-sm">✅ {success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isAuthenticated ? (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-700 mb-2">Please log in to test Twitter OAuth</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            {!twitterStatus.connected ? (
              <button
                onClick={handleConnectTwitter}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Connecting...' : '🔗 Connect Twitter Account'}
              </button>
            ) : (
              <button
                onClick={handleDisconnectTwitter}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Disconnecting...' : '🔌 Disconnect Twitter Account'}
              </button>
            )}

            <button
              onClick={testTwitterConnection}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Testing...' : '🔄 Refresh Status'}
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <h4 className="font-semibold text-blue-800 mb-2">Test Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Make sure you're logged in to AutoReach</li>
          <li>2. Click "Connect Twitter Account"</li>
          <li>3. You'll be redirected to Twitter for authorization</li>
          <li>4. After authorization, you'll be redirected back</li>
          <li>5. Check that the status shows "Connected to Twitter"</li>
        </ol>
      </div>
    </div>
  );
}
