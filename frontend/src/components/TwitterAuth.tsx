'use client';

import React, { useState, useEffect } from 'react';
import { twitterAuthService, TwitterStatus } from '../lib/twitterAuthService';
import { authService } from '../lib/authService';

interface TwitterAuthProps {
  onStatusChange?: (status: TwitterStatus) => void;
}

export default function TwitterAuth({ onStatusChange }: TwitterAuthProps) {
  const [twitterStatus, setTwitterStatus] = useState<TwitterStatus>({ connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (authService.isAuthenticated()) {
      loadTwitterStatus();
    }
  }, []);

  const loadTwitterStatus = async () => {
    try {
      setError(null);
      const status = await twitterAuthService.getTwitterStatus();
      setTwitterStatus(status);
      onStatusChange?.(status);
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

    try {
      const authData = await twitterAuthService.initiateTwitterAuth();
      
      // Store oauth_token_secret for the callback
      sessionStorage.setItem('twitter_oauth_token_secret', authData.oauth_token_secret);
      sessionStorage.setItem('twitter_oauth_token', authData.oauth_token);
      
      // Redirect to Twitter authorization
      window.location.href = authData.authorization_url;
    } catch (error: any) {
      setError(`Failed to connect Twitter: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleDisconnectTwitter = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await twitterAuthService.disconnectTwitter();
      const newStatus = { connected: false };
      setTwitterStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error: any) {
      setError(`Failed to disconnect Twitter: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-800">Please log in to connect your Twitter account</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-twitter-blue rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Twitter</p>
            {twitterStatus.connected ? (
              <p className="text-sm text-gray-500">@{twitterStatus.twitter_username}</p>
            ) : (
              <p className="text-sm text-gray-500">Not connected</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {twitterStatus.connected ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
              <button
                onClick={handleDisconnectTwitter}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not connected
              </span>
              <button
                onClick={handleConnectTwitter}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-white bg-twitter-blue rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {twitterStatus.connected && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800">
              Twitter account connected successfully! You can now create and schedule tweets.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
