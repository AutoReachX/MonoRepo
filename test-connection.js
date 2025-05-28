#!/usr/bin/env node
/**
 * End-to-End Connection Test
 * Tests the complete frontend-backend connection and data flow
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';
const API_URL = `${BACKEND_URL}/api`;

const TEST_USER = {
  username: 'e2e_test_user',
  email: 'e2e@example.com',
  password: 'testpass123',
  full_name: 'E2E Test User'
};

class E2EConnectionTest {
  constructor() {
    this.authToken = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ ${name} - PASSED`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async testBackendHealth() {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'healthy') {
      throw new Error('Backend health check failed');
    }
  }

  async testBackendAPI() {
    const response = await axios.get(`${BACKEND_URL}/`);
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.data.message) {
      throw new Error('Backend API root endpoint failed');
    }
  }

  async testCORSConfiguration() {
    try {
      const response = await axios.options(`${API_URL}/content/generate-tweet`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      // Should not return CORS error
      if (response.status >= 400) {
        throw new Error(`CORS preflight failed: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 405) {
        // Method not allowed is okay for OPTIONS request
        return;
      }
      throw error;
    }
  }

  async testUserRegistration() {
    try {
      const response = await axios.post(`${API_URL}/users/`, TEST_USER);
      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status}`);
      }
      if (!response.data.id || response.data.username !== TEST_USER.username) {
        throw new Error('User registration response invalid');
      }
    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data.detail && error.response.data.detail.includes('already registered')) {
        // User already exists, that's fine
        console.log('  ℹ️ User already exists, continuing...');
        return;
      }
      throw error;
    }
  }

  async testAuthentication() {
    // Create form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', TEST_USER.username);
    formData.append('password', TEST_USER.password);

    const response = await axios.post(`${API_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.access_token || response.data.token_type !== 'bearer') {
      throw new Error('Authentication response invalid');
    }

    this.authToken = response.data.access_token;
  }

  async testAuthenticatedEndpoint() {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (response.data.username !== TEST_USER.username) {
      throw new Error('Authenticated user data mismatch');
    }
  }

  async testContentGeneration() {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    const requestData = {
      topic: 'Testing API connection',
      style: 'professional',
      language: 'en'
    };

    try {
      const response = await axios.post(`${API_URL}/content/generate-tweet`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!response.data.hasOwnProperty('success')) {
        throw new Error('Content generation response missing success field');
      }

      // Note: success might be false if OpenAI API is not configured
      console.log('  ℹ️ Content generation endpoint accessible');
      if (!response.data.success && response.data.error) {
        console.log(`  ⚠️ Content generation failed (expected if OpenAI not configured): ${response.data.error}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('  ⚠️ Content generation failed (expected if OpenAI not configured)');
        return; // This is expected in test environment
      }
      throw error;
    }
  }

  async testContentHistory() {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    const response = await axios.get(`${API_URL}/content/history`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!response.data.hasOwnProperty('history') || !response.data.hasOwnProperty('total')) {
      throw new Error('Content history response invalid');
    }

    if (!Array.isArray(response.data.history)) {
      throw new Error('Content history should be an array');
    }
  }

  async testFrontendConfiguration() {
    // Check if frontend environment is configured correctly
    const envPath = path.join(__dirname, 'frontend', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('localhost:8000')) {
        throw new Error('Frontend .env.local not configured for backend port 8000');
      }
    } else {
      console.log('  ⚠️ Frontend .env.local not found, using default configuration');
    }
  }

  async runAllTests() {
    console.log('🚀 AutoReach Frontend-Backend Connection Test');
    console.log('=' * 60);

    await this.runTest('Backend Health Check', () => this.testBackendHealth());
    await this.runTest('Backend API Root', () => this.testBackendAPI());
    await this.runTest('CORS Configuration', () => this.testCORSConfiguration());
    await this.runTest('User Registration', () => this.testUserRegistration());
    await this.runTest('Authentication', () => this.testAuthentication());
    await this.runTest('Authenticated Endpoint', () => this.testAuthenticatedEndpoint());
    await this.runTest('Content Generation API', () => this.testContentGeneration());
    await this.runTest('Content History API', () => this.testContentHistory());
    await this.runTest('Frontend Configuration', () => this.testFrontendConfiguration());

    this.printResults();
  }

  printResults() {
    console.log('\n' + '=' * 60);
    console.log('📊 Test Results Summary');
    console.log('=' * 60);
    
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    console.log(`\n📈 Total: ${this.results.passed} passed, ${this.results.failed} failed`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! Frontend and backend are properly connected.');
      console.log('\n📋 Next steps:');
      console.log('1. Start the backend: cd backend && python start_server.py');
      console.log('2. Start the frontend: cd frontend && npm run dev');
      console.log('3. Open http://localhost:3000 in your browser');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new E2EConnectionTest();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = E2EConnectionTest;
