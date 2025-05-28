# AutoReach Frontend-Backend Connection Testing

This document provides comprehensive testing for the AutoReach frontend-backend connection to ensure data flows correctly and safely between components.

## Overview

The testing suite verifies:
- ✅ Backend API endpoints are accessible
- ✅ Frontend services connect to correct backend URLs
- ✅ Authentication flow works end-to-end
- ✅ Content generation APIs function properly
- ✅ CORS configuration allows frontend requests
- ✅ Error handling works correctly
- ✅ Data validation is enforced

## Quick Start

### 1. Install Dependencies

```bash
# Install test dependencies
npm install

# Setup backend (if not already done)
cd backend
python -m venv venv
venv/Scripts/activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
cd ..

# Setup frontend (if not already done)
cd frontend
npm install
cd ..
```

### 2. Run Complete Test Suite

```bash
# Run all tests (backend + frontend + integration)
npm test
```

### 3. Run Individual Test Suites

```bash
# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# Integration tests only
npm run test:integration
```

## Test Components

### 1. Backend Integration Tests (`backend/tests/test_integration.py`)

Tests the backend API functionality:
- Health check endpoints
- User registration and authentication
- Content generation endpoints
- CORS configuration
- API documentation accessibility

**Run:** `cd backend && python tests/test_integration.py`

### 2. Frontend Connection Tests (`frontend/test-frontend-connection.js`)

Tests frontend configuration and backend connectivity:
- API URL configuration
- Backend connection
- CORS headers
- Authentication flow
- Content endpoints accessibility

**Run:** `cd frontend && node test-frontend-connection.js`

### 3. End-to-End Integration Tests (`test-connection.js`)

Tests complete data flow between frontend and backend:
- Full authentication workflow
- Content generation API calls
- Error handling
- Data validation

**Run:** `node test-connection.js`

### 4. Comprehensive Test Runner (`run-connection-tests.js`)

Orchestrates all tests with backend server management:
- Starts backend server automatically
- Runs all test suites in sequence
- Provides comprehensive reporting
- Handles cleanup

**Run:** `node run-connection-tests.js`

## Configuration Verification

### Backend Configuration

The tests verify:
- ✅ FastAPI server runs on port 8000
- ✅ CORS allows frontend origins (localhost:3000, localhost:3001)
- ✅ Database connection works
- ✅ API endpoints are properly configured
- ✅ Authentication system functions

### Frontend Configuration

The tests verify:
- ✅ API URL points to backend (http://localhost:8000/api)
- ✅ Axios client is properly configured
- ✅ Authentication service works
- ✅ Content service connects to backend
- ✅ Error handling is implemented

## Test Scenarios

### Authentication Flow
1. User registration
2. User login with credentials
3. Token storage and usage
4. Authenticated API calls
5. Token validation
6. Logout functionality

### Content Generation Flow
1. Authenticated user makes content request
2. Backend validates request
3. Content service processes request
4. Response returned to frontend
5. Error handling for invalid requests

### Error Handling
1. Network errors
2. Authentication failures
3. Validation errors
4. Server errors
5. CORS issues

## Expected Results

### ✅ All Tests Pass
When all tests pass, you'll see:
```
🎉 ALL TESTS PASSED! 🎉
✅ Your AutoReach frontend and backend are properly connected!

📋 Next Steps:
1. Backend is running on: http://localhost:8000
2. Start frontend with: cd frontend && npm run dev
3. Open your browser to: http://localhost:3000
4. API documentation: http://localhost:8000/docs
```

### ⚠️ Common Issues and Solutions

#### Backend Not Starting
```bash
# Check if virtual environment exists
cd backend
ls venv/

# Recreate if missing
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
```

#### Port Conflicts
```bash
# Check what's running on port 8000
netstat -an | findstr :8000  # Windows
lsof -i :8000               # macOS/Linux

# Kill process if needed
taskkill /PID <pid> /F      # Windows
kill -9 <pid>               # macOS/Linux
```

#### CORS Errors
- Verify frontend URL in `backend/app/core/config.py`
- Check `ALLOWED_HOSTS` includes your frontend URL
- Restart backend after config changes

#### API URL Mismatch
- Check `frontend/.env.local` has correct backend URL
- Verify `frontend/src/lib/constants.ts` API_CONFIG
- Restart frontend after changes

#### Database Connection Issues
- Check `backend/.env` DATABASE_URL
- Verify database is accessible
- Run `cd backend && python test_db_connection.py`

## Manual Testing

After automated tests pass, manually verify:

1. **Start Backend:**
   ```bash
   cd backend
   python start_server.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test in Browser:**
   - Open http://localhost:3000
   - Try user registration
   - Test content generation
   - Check network tab for API calls

## API Documentation

When backend is running, access:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## Troubleshooting

### Debug Mode
Set environment variables for detailed logging:
```bash
# Backend
export DEBUG=true

# Frontend
export NODE_ENV=development
```

### Network Debugging
Use browser developer tools:
1. Open Network tab
2. Try API calls
3. Check request/response details
4. Verify CORS headers

### Backend Logs
Check backend console output for:
- Request details
- Error messages
- Database queries
- Authentication attempts

## Security Notes

The tests use temporary test users and data. In production:
- Use strong passwords
- Implement rate limiting
- Use HTTPS
- Validate all inputs
- Implement proper error handling
- Use environment variables for secrets

## Next Steps

After successful testing:
1. Deploy backend to production
2. Configure production environment variables
3. Update frontend API URLs for production
4. Set up monitoring and logging
5. Implement additional security measures
