'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../lib/authService';

function TwitterOAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{
    id: number;
    username: string;
    twitter_username: string;
    twitter_user_id: string;
    full_name?: string;
    is_active: boolean;
  } | null>(null);

  const handleTwitterOAuth2Callback = useCallback(async () => {
    try {
      // Get OAuth parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Twitter authorization failed: ${error}`);
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing OAuth parameters in callback URL');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      // Get stored OAuth state and code verifier
      const storedState = sessionStorage.getItem('twitter_oauth2_state');
      const codeVerifier = sessionStorage.getItem('twitter_oauth2_code_verifier');

      if (!storedState || !codeVerifier) {
        setStatus('error');
        setMessage('OAuth state not found. Please restart the authentication process.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (state !== storedState) {
        setStatus('error');
        setMessage('Invalid OAuth state. Possible security issue.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      // Complete the OAuth flow
      const result = await authService.handleTwitterOAuth2Callback({
        code,
        state,
        code_verifier: codeVerifier
      });

      // Clean up stored tokens
      sessionStorage.removeItem('twitter_oauth2_state');
      sessionStorage.removeItem('twitter_oauth2_code_verifier');

      setStatus('success');
      setMessage('Successfully logged in with Twitter!');
      setUser(result.user);

      // Redirect to dashboard after success
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error: unknown) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to authenticate with Twitter');
      setTimeout(() => router.push('/'), 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    handleTwitterOAuth2Callback();
  }, [handleTwitterOAuth2Callback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Twitter Authentication
          </h2>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing Twitter authentication...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              {user && (
                <div className="bg-gray-50 rounded-md p-3 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>Welcome, {user.full_name || user.username}!</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    @{user.twitter_username}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Failed</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to home page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Twitter Authentication
          </h2>
          <div className="bg-white shadow-md rounded-lg p-6 mt-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwitterOAuth2CallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TwitterOAuth2CallbackContent />
    </Suspense>
  );
}
