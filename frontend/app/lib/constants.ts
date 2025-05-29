// Navigation configuration
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Content', path: '/content' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Settings', path: '/settings' },
  { name: 'Auth', path: '/auth' },
  { name: 'Test API', path: '/test-connection' },
] as const;

// Content generation options - synchronized with backend
export const CONTENT_TONES = [
  { value: 'engaging', label: 'Engaging' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'informative', label: 'Informative' },
  { value: 'helpful', label: 'Helpful' },
] as const;

export const CONTENT_LENGTHS = [
  { value: 'short', label: 'Short (1-2 sentences)' },
  { value: 'medium', label: 'Medium (3-5 sentences)' },
  { value: 'long', label: 'Long (6+ sentences)' },
] as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Twitter Constants
export const TWITTER_CONSTANTS = {
  MAX_TWEET_LENGTH: 280,
  MAX_THREAD_TWEETS: 25,
  DEFAULT_THREAD_SIZE: 3,
  MAX_HASHTAGS_RECOMMENDED: 3,
  MAX_MENTIONS_RECOMMENDED: 5,
} as const;

// Content Generation
export const CONTENT_CONSTANTS = {
  DEFAULT_STYLE: 'engaging',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_STYLES: [
    'engaging',
    'professional',
    'casual',
    'educational',
    'humorous',
    'informative',
    'helpful'
  ],
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' }
  ],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_TOPIC_LENGTH: 3,
  MAX_TOPIC_LENGTH: 200,
  MIN_CONTENT_LENGTH: 1,
  MAX_CONTENT_LENGTH: 2000,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 5000, // 5 seconds
  LOADING_SPINNER_DELAY: 200, // milliseconds
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  DRAFT_CONTENT: 'draftContent',
  THEME: 'theme',
} as const;

// Content Generation Modes
export const CONTENT_MODES = {
  NEW_TWEET: 'new_tweet',
  REPLY: 'reply',
  THREAD: 'thread',
  REWRITE: 'rewrite',
} as const;

// Post Status
export const POST_STATUS = {
  PENDING: 'pending',
  POSTED: 'posted',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERATION_FAILED: 'Content generation failed. Please try again.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CONTENT_GENERATED: 'Content generated successfully!',
  CONTENT_SAVED: 'Content saved successfully!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  HASHTAG: /#\w+/g,
  MENTION: /@\w+/g,
  URL: /https?:\/\/[^\s]+/g,
} as const;

// Export types for TypeScript
export type ContentStyle = typeof CONTENT_CONSTANTS.SUPPORTED_STYLES[number];
export type ContentMode = typeof CONTENT_MODES[keyof typeof CONTENT_MODES];
export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS];
export type NavigationItem = typeof NAVIGATION_ITEMS[number];
export type SupportedLanguage = typeof CONTENT_CONSTANTS.SUPPORTED_LANGUAGES[number];

// Utility function to get error message by status code
export const getErrorMessageByStatus = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.GENERATION_FAILED;
    default:
      return ERROR_MESSAGES.GENERIC_ERROR;
  }
};
