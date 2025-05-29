'use client';

import React, { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { authService, LoginResponse } from '../lib/authService';
import { contentService } from '../lib/contentService';
import { HealthCheckResponse, ContentHistoryResponse } from '../types/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function ConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending' },
    { name: 'API Configuration', status: 'pending' },
    { name: 'Authentication Test', status: 'pending' },
    { name: 'Content Service Test', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const updateTest = (index: number, status: TestResult['status'], message?: string) => {
    setTests(prev => prev.map((test, i) =>
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);

    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    try {
      // Test 1: Backend Health Check
      try {
        // Use the API health endpoint
        const health = await apiClient.get<HealthCheckResponse>('/health');
        if (health && health.status === 'healthy') {
          updateTest(0, 'success', `Backend is healthy (API: ${health.api || 'ready'})`);
        } else {
          updateTest(0, 'error', 'Backend health check failed');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateTest(0, 'error', `Backend not accessible: ${errorMessage}`);
      }

      // Test 2: API Configuration
      try {
        const baseURL = apiClient.instance.defaults.baseURL;
        if (baseURL?.includes('8000')) {
          updateTest(1, 'success', `API URL: ${baseURL}`);
        } else {
          updateTest(1, 'error', `Incorrect API URL: ${baseURL}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateTest(1, 'error', `API configuration error: ${errorMessage}`);
      }

      // Test 3: Authentication Test
      try {
        const testUser = {
          username: `test_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'testpass123',
          full_name: 'Test User'
        };

        // Try to register (might fail if user exists)
        try {
          await authService.register(testUser);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          if (!errorMessage.includes('already registered')) {
            throw error;
          }
        }

        // Try to login
        const loginResult: LoginResponse = await authService.login({
          username: testUser.username,
          password: testUser.password
        });

        if (loginResult.access_token) {
          setAuthToken(loginResult.access_token);
          updateTest(2, 'success', 'Authentication successful');
        } else {
          updateTest(2, 'error', 'Login failed');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateTest(2, 'error', `Authentication failed: ${errorMessage}`);
      }

      // Test 4: Content Service Test
      try {
        if (authService.isAuthenticated()) {
          const history: ContentHistoryResponse = await contentService.getContentHistory(0, 5);
          updateTest(3, 'success', `Content history retrieved (${history.total || 0} items)`);
        } else {
          updateTest(3, 'error', 'Not authenticated for content test');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateTest(3, 'error', `Content service failed: ${errorMessage}`);
      }

    } catch (error: unknown) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testContentGeneration = async () => {
    if (!authService.isAuthenticated()) {
      alert('Please run authentication test first');
      return;
    }

    try {
      const result = await contentService.generateTweet({
        topic: 'Testing AutoReach connection',
        style: 'professional',
        language: 'en'
      });

      if (result.success && result.content) {
        alert(`Content generated successfully:\n\n${result.content}`);
      } else {
        alert(`Content generation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Content generation error: ${errorMessage}`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Frontend-Backend Connection Test
      </h2>

      <div className="space-y-4 mb-6">
        {tests.map((test, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
            <span className="text-2xl">{getStatusIcon(test.status)}</span>
            <div className="flex-1">
              <div className={`font-medium ${getStatusColor(test.status)}`}>
                {test.name}
              </div>
              {test.message && (
                <div className="text-sm text-gray-600 mt-1">
                  {test.message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
        </button>

        <button
          onClick={testContentGeneration}
          disabled={isRunning || !authService.isAuthenticated()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Content Generation
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Connection Status</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</div>
          <div>Authentication: {authService.isAuthenticated() ? '✅ Authenticated' : '❌ Not authenticated'}</div>
          {authToken && (
            <div className="break-all">Token: {authToken.substring(0, 20)}...</div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>This component tests the connection between the Next.js frontend and FastAPI backend.</p>
        <p>Make sure the backend is running on port 8000 before testing.</p>
      </div>
    </div>
  );
}
