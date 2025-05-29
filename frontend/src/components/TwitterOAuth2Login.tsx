'use client';

import React, { useState } from 'react';
import { authService } from '@/lib/authService';
import { STORAGE_KEYS } from '@/lib/constants';

interface TwitterOAuth2LoginProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function TwitterOAuth2Login({ 
  onSuccess, 
  onError, 
  className = '' 
}: TwitterOAuth2LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize Twitter OAuth 2.0 flow
      const authData = await authService.initiateTwitterOAuth2();
      
      // Store OAuth state and code verifier for callback
      sessionStorage.setItem('twitter_oauth2_state', authData.state);
      sessionStorage.setItem('twitter_oauth2_code_verifier', authData.code_verifier);
      
      // Redirect to Twitter authorization
      window.location.href = authData.authorization_url;
    } catch (error: any) {
      const errorMessage = `Failed to start Twitter login: ${error.message}`;
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleTwitterLogin}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center px-4 py-3 border border-transparent 
          text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting to Twitter...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Continue with Twitter
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
