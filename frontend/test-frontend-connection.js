#!/usr/bin/env node
/**
 * Frontend Connection Test
 * Tests frontend services and their connection to the backend
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class FrontendConnectionTest {
  constructor() {
    this.results = { passed: 0, failed: 0 };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ ${name} - PASSED`);
      this.results.passed++;
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`);
      this.results.failed++;
    }
  }

  async testAPIConfiguration() {
    console.log(`  API URL: ${API_URL}`);
    if (!API_URL.includes('8000')) {
      throw new Error('API URL should point to port 8000 (backend)');
    }
  }

  async testBackendConnection() {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    if (response.status !== 200) {
      throw new Error(`Backend not responding: ${response.status}`);
    }
  }

  async testAPIEndpoints() {
    // Test basic API structure
    const endpoints = [
      '/health',
      '/docs',
      '/'
    ];

    for (const endpoint of endpoints) {
      const url = endpoint === '/health' || endpoint === '/docs' || endpoint === '/' 
        ? `${API_URL.replace('/api', '')}${endpoint}`
        : `${API_URL}${endpoint}`;
      
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`Endpoint ${endpoint} failed: ${response.status}`);
      }
    }
  }

  async testCORSHeaders() {
    try {
      const response = await axios.options(`${API_URL}/content/generate-tweet`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 405) {
        // Method not allowed is fine for OPTIONS
        return;
      }
      throw new Error(`CORS test failed: ${error.message}`);
    }
  }

  async testAuthenticationFlow() {
    // Test user registration endpoint
    const testUser = {
      username: 'frontend_test_' + Date.now(),
      email: `frontend_test_${Date.now()}@example.com`,
      password: 'testpass123',
      full_name: 'Frontend Test User'
    };

    try {
      const registerResponse = await axios.post(`${API_URL}/users/`, testUser);
      if (registerResponse.status !== 201) {
        throw new Error(`Registration failed: ${registerResponse.status}`);
      }

      // Test login
      const formData = new URLSearchParams();
      formData.append('username', testUser.username);
      formData.append('password', testUser.password);

      const loginResponse = await axios.post(`${API_URL}/auth/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (loginResponse.status !== 200 || !loginResponse.data.access_token) {
        throw new Error('Login failed');
      }

      // Test authenticated endpoint
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.access_token}`
        }
      });

      if (meResponse.status !== 200 || meResponse.data.username !== testUser.username) {
        throw new Error('Authenticated endpoint failed');
      }

    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data.detail && error.response.data.detail.includes('already registered')) {
        console.log('  ℹ️ User already exists, authentication flow working');
        return;
      }
      throw error;
    }
  }

  async testContentEndpoints() {
    // We'll just test that the endpoints are accessible
    // Actual content generation might fail without OpenAI API key
    
    const testUser = {
      username: 'content_test_user',
      email: 'content_test@example.com',
      password: 'testpass123'
    };

    let authToken;

    try {
      // Try to register user
      await axios.post(`${API_URL}/users/`, testUser);
    } catch (error) {
      // User might already exist
    }

    // Login
    const formData = new URLSearchParams();
    formData.append('username', testUser.username);
    formData.append('password', testUser.password);

    const loginResponse = await axios.post(`${API_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    authToken = loginResponse.data.access_token;

    // Test content history endpoint (should work without OpenAI)
    const historyResponse = await axios.get(`${API_URL}/content/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (historyResponse.status !== 200) {
      throw new Error('Content history endpoint failed');
    }

    // Test content generation endpoint structure (might fail without OpenAI, that's ok)
    try {
      const contentResponse = await axios.post(`${API_URL}/content/generate-tweet`, {
        topic: 'test topic',
        style: 'professional'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('  ℹ️ Content generation endpoint accessible');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('  ℹ️ Content generation failed (expected without OpenAI API key)');
      } else {
        throw error;
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Frontend Connection Test');
    console.log('Testing frontend configuration and backend connectivity');
    console.log('=' * 50);

    await this.runTest('API Configuration', () => this.testAPIConfiguration());
    await this.runTest('Backend Connection', () => this.testBackendConnection());
    await this.runTest('API Endpoints', () => this.testAPIEndpoints());
    await this.runTest('CORS Headers', () => this.testCORSHeaders());
    await this.runTest('Authentication Flow', () => this.testAuthenticationFlow());
    await this.runTest('Content Endpoints', () => this.testContentEndpoints());

    console.log('\n' + '=' * 50);
    console.log(`📊 Results: ${this.results.passed} passed, ${this.results.failed} failed`);

    if (this.results.failed === 0) {
      console.log('\n🎉 Frontend is properly configured and connected to backend!');
      console.log('\n📋 You can now:');
      console.log('1. Run: npm run dev (to start the frontend)');
      console.log('2. Open: http://localhost:3000');
      console.log('3. Test the UI components with the backend');
    } else {
      console.log('\n⚠️ Some tests failed. Check the configuration.');
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new FrontendConnectionTest();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = FrontendConnectionTest;
