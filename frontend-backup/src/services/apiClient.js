/**
 * API client configuration and setup.
 * Following Single Responsibility Principle for HTTP communication.
 */

import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      // Redirect to login page or trigger auth refresh
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
