'use client';

import React, { useState } from 'react';
import { authService, TwitterOAuth2InitResponse, TwitterOAuth2CallbackResponse } from '@/lib/authService';
import TwitterOAuth2Login from '@/components/TwitterOAuth2Login';

interface TestResult {
  success?: boolean;
  user?: TwitterOAuth2CallbackResponse['user'];
  authorization_url?: string;
  state?: string;
  code_verifier?: string;
}

export default function TestTwitterOAuth2Page() {
  const [result, setResult] = useState<TestResult | TwitterOAuth2InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testOAuth2Init = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await authService.initiateTwitterOAuth2();
      setResult(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Twitter OAuth 2.0 Test
          </h1>
          <p className="text-gray-600">
            Test the Twitter OAuth 2.0 implementation for user authentication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual Test */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Manual API Test
            </h2>

            <button
              onClick={testOAuth2Init}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 mb-4"
            >
              {isLoading ? 'Testing...' : 'Test OAuth 2.0 Init'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                <h3 className="font-medium">Error:</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <h3 className="font-medium mb-2">Success:</h3>
                <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Component Test */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Component Test
            </h2>

            <TwitterOAuth2Login
              onError={handleTwitterError}
            />

            {result && 'success' in result && result.success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <h3 className="font-medium mb-2">Login Success:</h3>
                <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(result.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Endpoints
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">POST /api/auth/oauth2/twitter/init</h3>
              <p className="text-sm text-gray-600">Initialize Twitter OAuth 2.0 flow</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {`{ "redirect_uri": "http://localhost:3000/auth/twitter/oauth2-callback" }`}
              </code>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">POST /api/auth/oauth2/twitter/callback</h3>
              <p className="text-sm text-gray-600">Handle Twitter OAuth 2.0 callback</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {`{ "code": "...", "state": "...", "code_verifier": "..." }`}
              </code>
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Environment Check
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Backend URL:</span>
              <span className="font-mono">http://127.0.0.1:8000</span>
            </div>
            <div className="flex justify-between">
              <span>Frontend URL:</span>
              <span className="font-mono">http://localhost:3000</span>
            </div>
            <div className="flex justify-between">
              <span>OAuth Callback:</span>
              <span className="font-mono">http://localhost:3000/auth/twitter/oauth2-callback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
