'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { twitterAuthService } from '@/lib/twitterAuthService';
import { authService } from '@/lib/authService';

export default function TwitterCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);

  useEffect(() => {
    handleTwitterCallback();
  }, [handleTwitterCallback]);

  const handleTwitterCallback = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setStatus('error');
        setMessage('You must be logged in to connect your Twitter account');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      // Get OAuth parameters from URL
      const oauth_token = searchParams.get('oauth_token');
      const oauth_verifier = searchParams.get('oauth_verifier');
      const denied = searchParams.get('denied');

      if (denied) {
        setStatus('error');
        setMessage('Twitter authorization was denied');
        setTimeout(() => router.push('/settings'), 3000);
        return;
      }

      if (!oauth_token || !oauth_verifier) {
        setStatus('error');
        setMessage('Missing OAuth parameters in callback URL');
        setTimeout(() => router.push('/settings'), 3000);
        return;
      }

      // Get stored oauth_token_secret
      const oauth_token_secret = sessionStorage.getItem('twitter_oauth_token_secret');
      if (!oauth_token_secret) {
        setStatus('error');
        setMessage('OAuth token secret not found. Please restart the authentication process.');
        setTimeout(() => router.push('/settings'), 3000);
        return;
      }

      // Complete the OAuth flow
      const result = await twitterAuthService.handleTwitterCallback({
        oauth_token,
        oauth_verifier,
        oauth_token_secret
      });

      // Clean up stored tokens
      sessionStorage.removeItem('twitter_oauth_token_secret');
      sessionStorage.removeItem('twitter_oauth_token');

      setStatus('success');
      setMessage(result.message);
      setTwitterUsername(result.twitter_username || null);

      // Redirect to settings page after success
      setTimeout(() => router.push('/settings'), 2000);

    } catch (error: unknown) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to connect Twitter account');
      setTimeout(() => router.push('/settings'), 3000);
    }
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading': return 'Connecting Twitter Account...';
      case 'success': return 'Twitter Connected Successfully!';
      case 'error': return 'Connection Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>

          <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusTitle()}
          </h2>

          <div className="mt-4 space-y-2">
            <p className="text-gray-600">{message}</p>

            {status === 'success' && twitterUsername && (
              <p className="text-sm text-gray-500">
                Connected as <span className="font-medium text-twitter-blue">@{twitterUsername}</span>
              </p>
            )}
          </div>

          {status === 'loading' && (
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Please wait while we connect your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-green-800">
                  You can now create and schedule tweets from AutoReach!
                </span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/settings')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Settings
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              {status === 'loading' && 'This may take a few seconds...'}
              {status === 'success' && 'Redirecting to settings...'}
              {status === 'error' && 'Redirecting in a few seconds...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
