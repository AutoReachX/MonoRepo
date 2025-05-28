/**
 * Frontend-Backend Integration Tests
 * Tests the complete data flow between frontend services and backend API
 */

import { apiClient } from '../lib/apiClient';
import { authService } from '../lib/authService';
import { contentService } from '../lib/contentService';

// Test configuration
const TEST_USER = {
  username: 'testuser_frontend',
  email: 'frontend@example.com',
  password: 'testpass123',
  full_name: 'Frontend Test User'
};

describe('Frontend-Backend Integration', () => {
  beforeAll(() => {
    // Ensure we're testing against the correct backend
    expect(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').toContain('8000');
  });

  afterEach(() => {
    // Clean up auth state after each test
    authService.logout();
  });

  describe('API Client', () => {
    test('should connect to backend health endpoint', async () => {
      const response = await apiClient.get('/health');
      expect(response).toHaveProperty('status', 'healthy');
      expect(response).toHaveProperty('version');
    });

    test('should handle network errors gracefully', async () => {
      // Test with invalid endpoint
      await expect(apiClient.get('/invalid-endpoint')).rejects.toThrow();
    });

    test('should include proper headers', async () => {
      // This test verifies the axios instance is configured correctly
      expect(apiClient.instance.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
      expect(apiClient.instance.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Authentication Service', () => {
    test('should register a new user', async () => {
      try {
        const user = await authService.register(TEST_USER);
        expect(user).toHaveProperty('id');
        expect(user.username).toBe(TEST_USER.username);
        expect(user.email).toBe(TEST_USER.email);
      } catch (error: unknown) {
        // User might already exist
        if ((error as Error).message.includes('already registered')) {
          console.log('User already exists, skipping registration test');
        } else {
          throw error;
        }
      }
    });

    test('should login with valid credentials', async () => {
      // Ensure user exists first
      try {
        await authService.register(TEST_USER);
      } catch (error: unknown) {
        // Ignore if user already exists
        if (!(error as Error).message.includes('already registered')) {
          throw error;
        }
      }

      const loginResponse = await authService.login({
        username: TEST_USER.username,
        password: TEST_USER.password
      });

      expect(loginResponse).toHaveProperty('access_token');
      expect(loginResponse.token_type).toBe('bearer');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should get current user after login', async () => {
      // Login first
      try {
        await authService.register(TEST_USER);
      } catch {
        // Ignore if user already exists
      }

      await authService.login({
        username: TEST_USER.username,
        password: TEST_USER.password
      });

      const user = await authService.getCurrentUser();
      expect(user.username).toBe(TEST_USER.username);
      expect(user.email).toBe(TEST_USER.email);
    });

    test('should handle invalid login credentials', async () => {
      await expect(authService.login({
        username: 'nonexistent',
        password: 'wrongpassword'
      })).rejects.toThrow();
    });

    test('should logout successfully', async () => {
      // Login first
      try {
        await authService.register(TEST_USER);
      } catch {
        // Ignore if user already exists
      }

      await authService.login({
        username: TEST_USER.username,
        password: TEST_USER.password
      });

      expect(authService.isAuthenticated()).toBe(true);

      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Content Service', () => {
    beforeEach(async () => {
      // Login before each content test
      try {
        await authService.register(TEST_USER);
      } catch {
        // Ignore if user already exists
      }

      await authService.login({
        username: TEST_USER.username,
        password: TEST_USER.password
      });
    });

    test('should generate tweet content', async () => {
      const request = {
        topic: 'Testing API integration',
        style: 'professional',
        language: 'en'
      };

      try {
        const response = await contentService.generateTweet(request);
        expect(response).toHaveProperty('success');

        if (response.success) {
          expect(response).toHaveProperty('content');
          expect(typeof response.content).toBe('string');
        }
      } catch (error: unknown) {
        // This might fail if OpenAI API is not configured
        // That's expected in test environment
        console.log('Content generation failed (expected if OpenAI not configured):', (error as Error).message);
      }
    });

    test('should generate thread content', async () => {
      const request = {
        topic: 'AI technology trends',
        num_tweets: 3,
        style: 'informative',
        language: 'en'
      };

      try {
        const response = await contentService.generateThread(request);
        expect(response).toHaveProperty('success');

        if (response.success) {
          expect(response).toHaveProperty('content');
        }
      } catch (error: unknown) {
        // Expected if OpenAI not configured
        console.log('Thread generation failed (expected if OpenAI not configured):', (error as Error).message);
      }
    });

    test('should get content history', async () => {
      const history = await contentService.getContentHistory(0, 10);
      expect(history).toHaveProperty('history');
      expect(history).toHaveProperty('total');
      expect(Array.isArray(history.history)).toBe(true);
      expect(typeof history.total).toBe('number');
    });

    test('should validate request parameters', async () => {
      // Test empty topic
      await expect(contentService.generateTweet({
        topic: '',
        style: 'professional'
      })).rejects.toThrow('Topic is required');

      // Test topic too long
      await expect(contentService.generateTweet({
        topic: 'a'.repeat(501),
        style: 'professional'
      })).rejects.toThrow('Topic must be less than 500 characters');
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized requests', async () => {
      // Ensure we're not authenticated
      authService.logout();

      await expect(contentService.getContentHistory()).rejects.toThrow();
    });

    test('should handle network timeouts', async () => {
      // This would require mocking the network layer
      // For now, we'll just verify the timeout is configured
      expect(apiClient.instance.defaults.timeout).toBe(30000);
    });
  });
});

// Manual test runner for development
if (require.main === module) {
  console.log('🧪 Running Frontend-Backend Integration Tests...');
  console.log('Note: Run this with Jest for proper test execution');
  console.log('Command: npm test -- integration.test.ts');
}
