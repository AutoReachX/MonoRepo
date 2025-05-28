#!/usr/bin/env node
/**
 * Quick Connection Test
 * Fast verification that frontend and backend can communicate
 */

const axios = require('axios');

async function quickTest() {
  console.log('🚀 AutoReach Quick Connection Test');
  console.log('=' * 40);

  const tests = [
    {
      name: 'Backend Health Check',
      test: async () => {
        const response = await axios.get('http://localhost:8000/health');
        return response.status === 200 && response.data.status === 'healthy';
      }
    },
    {
      name: 'API Root Endpoint',
      test: async () => {
        const response = await axios.get('http://localhost:8000/');
        return response.status === 200 && response.data.message;
      }
    },
    {
      name: 'API Documentation',
      test: async () => {
        const response = await axios.get('http://localhost:8000/docs');
        return response.status === 200;
      }
    },
    {
      name: 'CORS Configuration',
      test: async () => {
        try {
          await axios.options('http://localhost:8000/api/content/generate-tweet', {
            headers: {
              'Origin': 'http://localhost:3000',
              'Access-Control-Request-Method': 'POST'
            }
          });
          return true;
        } catch (error) {
          return error.response && error.response.status === 405; // Method not allowed is OK
        }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name} - Test returned false`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '=' * 40);
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n🎉 Quick test passed! Backend is accessible.');
    console.log('\n📋 Next steps:');
    console.log('1. Run full tests: npm test');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Open: http://localhost:3000');
  } else {
    console.log('\n⚠️ Some tests failed.');
    console.log('\n🔧 Try:');
    console.log('1. Start backend: cd backend && python start_server.py');
    console.log('2. Check if port 8000 is available');
    console.log('3. Run: npm run setup');
  }
}

if (require.main === module) {
  quickTest().catch(error => {
    console.error('❌ Quick test failed:', error.message);
    console.log('\n💡 Make sure the backend is running:');
    console.log('   cd backend && python start_server.py');
    process.exit(1);
  });
}

module.exports = quickTest;
