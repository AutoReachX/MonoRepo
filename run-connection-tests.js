#!/usr/bin/env node
/**
 * Comprehensive Connection Test Runner
 * Orchestrates all tests to verify frontend-backend connection
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ConnectionTestRunner {
  constructor() {
    this.backendProcess = null;
    this.frontendProcess = null;
    this.testResults = {
      backend: { passed: 0, failed: 0 },
      frontend: { passed: 0, failed: 0 },
      integration: { passed: 0, failed: 0 }
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForServer(url, maxAttempts = 30) {
    console.log(`⏳ Waiting for server at ${url}...`);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(url);
        console.log(`✅ Server at ${url} is ready`);
        return true;
      } catch (error) {
        await this.sleep(1000);
      }
    }
    
    throw new Error(`Server at ${url} did not start within ${maxAttempts} seconds`);
  }

  async startBackend() {
    console.log('\n🚀 Starting backend server...');
    
    return new Promise((resolve, reject) => {
      const backendPath = path.join(__dirname, 'backend');
      
      // Check if virtual environment exists
      const venvPath = path.join(backendPath, 'venv');
      if (!fs.existsSync(venvPath)) {
        console.log('❌ Backend virtual environment not found. Please run setup first.');
        reject(new Error('Backend venv not found'));
        return;
      }

      // Start backend server
      const pythonPath = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');

      this.backendProcess = spawn(pythonPath, ['start_server.py'], {
        cwd: backendPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Uvicorn running')) {
          console.log('✅ Backend server started successfully');
          resolve();
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.log('Backend stderr:', data.toString());
      });

      this.backendProcess.on('error', (error) => {
        console.log('❌ Failed to start backend:', error.message);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Backend startup timeout'));
      }, 30000);
    });
  }

  async stopBackend() {
    if (this.backendProcess) {
      console.log('🛑 Stopping backend server...');
      this.backendProcess.kill();
      this.backendProcess = null;
    }
  }

  async runBackendTests() {
    console.log('\n🧪 Running backend tests...');
    
    try {
      // Wait for backend to be ready
      await this.waitForServer('http://localhost:8000/health');
      
      // Run Python integration tests
      const backendPath = path.join(__dirname, 'backend');
      const pythonPath = process.platform === 'win32' 
        ? path.join(backendPath, 'venv', 'Scripts', 'python.exe')
        : path.join(backendPath, 'venv', 'bin', 'python');

      return new Promise((resolve, reject) => {
        const testProcess = spawn(pythonPath, ['tests/test_integration.py'], {
          cwd: backendPath,
          stdio: 'inherit'
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Backend tests passed');
            this.testResults.backend.passed++;
            resolve();
          } else {
            console.log('❌ Backend tests failed');
            this.testResults.backend.failed++;
            resolve(); // Don't reject, continue with other tests
          }
        });

        testProcess.on('error', (error) => {
          console.log('❌ Backend test error:', error.message);
          this.testResults.backend.failed++;
          resolve();
        });
      });
    } catch (error) {
      console.log('❌ Backend test setup failed:', error.message);
      this.testResults.backend.failed++;
    }
  }

  async runFrontendTests() {
    console.log('\n🧪 Running frontend tests...');
    
    try {
      // Run frontend connection test
      const frontendPath = path.join(__dirname, 'frontend');
      
      return new Promise((resolve, reject) => {
        const testProcess = spawn('node', ['test-frontend-connection.js'], {
          cwd: frontendPath,
          stdio: 'inherit',
          env: { ...process.env, NEXT_PUBLIC_API_URL: 'http://localhost:8000/api' }
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Frontend tests passed');
            this.testResults.frontend.passed++;
            resolve();
          } else {
            console.log('❌ Frontend tests failed');
            this.testResults.frontend.failed++;
            resolve();
          }
        });

        testProcess.on('error', (error) => {
          console.log('❌ Frontend test error:', error.message);
          this.testResults.frontend.failed++;
          resolve();
        });
      });
    } catch (error) {
      console.log('❌ Frontend test setup failed:', error.message);
      this.testResults.frontend.failed++;
    }
  }

  async runIntegrationTests() {
    console.log('\n🧪 Running integration tests...');
    
    try {
      return new Promise((resolve, reject) => {
        const testProcess = spawn('node', ['test-connection.js'], {
          cwd: __dirname,
          stdio: 'inherit'
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Integration tests passed');
            this.testResults.integration.passed++;
            resolve();
          } else {
            console.log('❌ Integration tests failed');
            this.testResults.integration.failed++;
            resolve();
          }
        });

        testProcess.on('error', (error) => {
          console.log('❌ Integration test error:', error.message);
          this.testResults.integration.failed++;
          resolve();
        });
      });
    } catch (error) {
      console.log('❌ Integration test setup failed:', error.message);
      this.testResults.integration.failed++;
    }
  }

  printFinalResults() {
    console.log('\n' + '=' * 60);
    console.log('📊 FINAL TEST RESULTS');
    console.log('=' * 60);
    
    const totalPassed = this.testResults.backend.passed + 
                       this.testResults.frontend.passed + 
                       this.testResults.integration.passed;
    
    const totalFailed = this.testResults.backend.failed + 
                       this.testResults.frontend.failed + 
                       this.testResults.integration.failed;

    console.log(`Backend Tests:     ${this.testResults.backend.passed} passed, ${this.testResults.backend.failed} failed`);
    console.log(`Frontend Tests:    ${this.testResults.frontend.passed} passed, ${this.testResults.frontend.failed} failed`);
    console.log(`Integration Tests: ${this.testResults.integration.passed} passed, ${this.testResults.integration.failed} failed`);
    console.log(`\nTotal:             ${totalPassed} passed, ${totalFailed} failed`);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('\n✅ Your AutoReach frontend and backend are properly connected!');
      console.log('\n📋 Next Steps:');
      console.log('1. Backend is running on: http://localhost:8000');
      console.log('2. Start frontend with: cd frontend && npm run dev');
      console.log('3. Open your browser to: http://localhost:3000');
      console.log('4. API documentation: http://localhost:8000/docs');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
      console.log('\n🔧 Common issues:');
      console.log('- Backend not running: cd backend && python start_server.py');
      console.log('- Dependencies missing: Run setup scripts');
      console.log('- Port conflicts: Check if ports 8000/3000 are available');
      console.log('- Environment variables: Check .env files');
    }
  }

  async runAllTests() {
    console.log('🚀 AutoReach Connection Test Suite');
    console.log('Testing complete frontend-backend integration');
    console.log('=' * 60);

    try {
      // Start backend
      await this.startBackend();
      
      // Run all test suites
      await this.runBackendTests();
      await this.runFrontendTests();
      await this.runIntegrationTests();
      
    } catch (error) {
      console.log('❌ Test suite failed:', error.message);
    } finally {
      // Clean up
      await this.stopBackend();
      
      // Print results
      this.printFinalResults();
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated. Cleaning up...');
  process.exit(0);
});

// Run the test suite
if (require.main === module) {
  const runner = new ConnectionTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = ConnectionTestRunner;
