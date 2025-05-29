/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Frontend error handling utilities following DRY and KISS principles.
 * Centralizes error handling logic to eliminate code duplication.
 */

import { HTTP_STATUS, ERROR_MESSAGES, getErrorMessageByStatus } from './constants';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export interface ErrorResult {
  type: string;
  message: string;
  userMessage: string;
  context?: any;
  timestamp: number;
}

// Error type constants
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
} as const;

/**
 * Base error handling utilities
 */
export class ErrorHandler {
  /**
   * Main error handler that processes errors and returns structured result
   */
  static handleError(error: unknown, context?: any): ErrorResult {
    const message = this.getErrorMessage(error);
    const type = this.getErrorType(error);
    const userMessage = this.getUserFriendlyMessage(type);

    const result: ErrorResult = {
      type,
      message,
      userMessage,
      context,
      timestamp: Date.now()
    };

    this.logError(error, context);

    return result;
  }

  /**
   * Get error message from various error types
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return 'An unknown error occurred';
  }

  /**
   * Determine error type based on error content
   */
  static getErrorType(error: unknown): string {
    const message = this.getErrorMessage(error).toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorTypes.NETWORK;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorTypes.VALIDATION;
    }
    if (message.includes('unauthorized') || message.includes('auth')) {
      return ErrorTypes.AUTHENTICATION;
    }
    if (message.includes('forbidden')) {
      return ErrorTypes.AUTHORIZATION;
    }
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return ErrorTypes.RATE_LIMIT;
    }
    if (message.includes('server error') || message.includes('internal')) {
      return ErrorTypes.SERVER;
    }
    if (message.includes('bad request') || message.includes('client')) {
      return ErrorTypes.CLIENT;
    }

    return ErrorTypes.UNKNOWN;
  }

  /**
   * Get user-friendly message for error type
   */
  static getUserFriendlyMessage(errorType: string): string {
    switch (errorType) {
      case ErrorTypes.NETWORK:
        return 'Network error. Please check your connection.';
      case ErrorTypes.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorTypes.AUTHENTICATION:
        return 'Please log in to continue.';
      case ErrorTypes.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorTypes.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorTypes.SERVER:
        return 'Server error. Please try again later.';
      case ErrorTypes.CLIENT:
        return 'Invalid request. Please check your input.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    const type = this.getErrorType(error);
    const message = this.getErrorMessage(error).toLowerCase();

    // Network errors are retryable
    if (type === ErrorTypes.NETWORK) {
      return true;
    }

    // Timeout errors are retryable
    if (message.includes('timeout')) {
      return true;
    }

    // Server errors (5xx) are retryable
    if (type === ErrorTypes.SERVER || message.includes('server error')) {
      return true;
    }

    // Rate limit errors are retryable (after delay)
    if (type === ErrorTypes.RATE_LIMIT) {
      return true;
    }

    // Authentication, validation, and client errors are not retryable
    return false;
  }

  /**
   * Log error with context
   */
  static logError(error: unknown, context?: any): void {
    const message = this.getErrorMessage(error);
    const logData = {
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    };

    console.error('Error occurred:', logData);
  }

  /**
   * Handle API errors with consistent formatting
   */
  static handleApiError(
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): ApiError {
    const {
      showToast = false,
      logError = true,
      fallbackMessage = ERROR_MESSAGES.GENERIC_ERROR
    } = options;

    let apiError: ApiError;

    // Type guard for error objects
    const isErrorWithResponse = (err: unknown): err is { response: { status: number; data?: { message?: string; code?: string; details?: Record<string, unknown> } } } => {
      return typeof err === 'object' && err !== null && 'response' in err;
    };

    const isErrorWithRequest = (err: unknown): err is { request: unknown } => {
      return typeof err === 'object' && err !== null && 'request' in err;
    };

    const isErrorWithMessage = (err: unknown): err is { message: string } => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    if (isErrorWithResponse(error)) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;

      apiError = {
        message: data?.message || getErrorMessageByStatus(status),
        status,
        code: data?.code,
        details: data?.details
      };
    } else if (isErrorWithRequest(error)) {
      // Network error
      apiError = {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        code: 'NETWORK_ERROR'
      };
    } else {
      // Other error
      apiError = {
        message: isErrorWithMessage(error) ? error.message : fallbackMessage,
        code: 'UNKNOWN_ERROR'
      };
    }

    if (logError) {
      console.error('API Error:', apiError, error);
    }

    if (showToast) {
      // This would integrate with your toast system
      // toast.error(apiError.message);
    }

    return apiError;
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: Record<string, string> | string[] | unknown,
    options: ErrorHandlerOptions = {}
  ): ApiError {
    const { logError = true } = options;

    let message: string;

    if (Array.isArray(errors)) {
      message = errors.join(', ');
    } else if (typeof errors === 'object' && errors !== null) {
      message = Object.values(errors).join(', ');
    } else {
      message = ERROR_MESSAGES.VALIDATION_ERROR;
    }

    const apiError: ApiError = {
      message,
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      code: 'VALIDATION_ERROR',
      details: typeof errors === 'object' && errors !== null ? errors as Record<string, unknown> : undefined
    };

    if (logError) {
      console.warn('Validation Error:', apiError);
    }

    return apiError;
  }

  /**
   * Handle async operation errors
   */
  static async handleAsyncError<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      const apiError = this.handleApiError(error, options);
      return { error: apiError };
    }
  }

  /**
   * Create error boundary handler
   */
  static createErrorBoundaryHandler(
    fallbackComponent?: React.ComponentType<{ error: Error }>
  ) {
    return (error: Error, errorInfo: any) => {
      console.error('Error Boundary caught an error:', error, errorInfo);

      // Log to error reporting service
      // errorReportingService.captureException(error, errorInfo);

      return fallbackComponent;
    };
  }
}

/**
 * Specific error handlers for different scenarios
 */
export class ContentErrorHandler {
  /**
   * Handle content generation errors
   */
  static handleGenerationError(error: any): ApiError {
    return ErrorHandler.handleApiError(error, {
      fallbackMessage: ERROR_MESSAGES.GENERATION_FAILED,
      logError: true
    });
  }

  /**
   * Handle content validation errors
   */
  static handleContentValidationError(errors: any): ApiError {
    return ErrorHandler.handleValidationError(errors, {
      logError: true
    });
  }
}

/**
 * Authentication error handlers
 */
export class AuthErrorHandler {
  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): ApiError {
    const apiError = ErrorHandler.handleApiError(error, {
      logError: true
    });

    // Handle specific auth scenarios
    if (apiError.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear auth tokens
      localStorage.removeItem('authToken');

      // Redirect to login if needed
      // router.push('/login');
    }

    return apiError;
  }

  /**
   * Handle token expiration
   */
  static handleTokenExpiration(): void {
    localStorage.removeItem('authToken');
    // Show token expired message
    // toast.error(ERROR_MESSAGES.UNAUTHORIZED);
    // Redirect to login
    // router.push('/login');
  }
}

/**
 * Network error handlers
 */
export class NetworkErrorHandler {
  /**
   * Handle network connectivity issues
   */
  static handleNetworkError(error: any): ApiError {
    return ErrorHandler.handleApiError(error, {
      fallbackMessage: ERROR_MESSAGES.NETWORK_ERROR,
      logError: true
    });
  }

  /**
   * Handle rate limiting
   */
  static handleRateLimitError(error: any): ApiError {
    return ErrorHandler.handleApiError(error, {
      fallbackMessage: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      logError: true
    });
  }
}

/**
 * Error retry utilities
 */
export class RetryHandler {
  /**
   * Retry failed operations with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    if (!error.response) {
      return true; // Network errors are retryable
    }

    const status = error.response.status;
    return status >= 500 || status === HTTP_STATUS.TOO_MANY_REQUESTS;
  }
}

/**
 * Error logging utilities
 */
export class ErrorLogger {
  /**
   * Log error with timestamp and context
   */
  static log(error: unknown, context?: any): void {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);

    if (context) {
      console.error(`[ERROR] ${timestamp}`, message, 'Context:', context);
    } else {
      console.error(`[ERROR] ${timestamp}`, message);
    }
  }

  /**
   * Log warning with timestamp and context
   */
  static warn(message: string, context?: any): void {
    const timestamp = new Date().toISOString();

    if (context) {
      console.warn(`[WARN] ${timestamp}`, message, 'Context:', context);
    } else {
      console.warn(`[WARN] ${timestamp}`, message);
    }
  }

  /**
   * Log info message
   */
  static info(message: string, context?: any): void {
    const timestamp = new Date().toISOString();

    if (context) {
      console.log(`[INFO] ${timestamp}`, message, 'Context:', context);
    } else {
      console.log(`[INFO] ${timestamp}`, message);
    }
  }

  /**
   * Log debug message (only in development)
   */
  static debug(message: string, context?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();

      if (context) {
        console.log(`[DEBUG] ${timestamp}`, message, 'Context:', context);
      } else {
        console.log(`[DEBUG] ${timestamp}`, message);
      }
    }
  }

  /**
   * Log error to console with context (legacy method)
   */
  static logError(
    error: any,
    context: string,
    additionalData?: any
  ): void {
    console.group(`🚨 Error in ${context}`);
    console.error('Error:', error);
    if (additionalData) {
      console.error('Additional Data:', additionalData);
    }
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  /**
   * Log warning with context (legacy method)
   */
  static logWarning(
    message: string,
    context: string,
    additionalData?: any
  ): void {
    console.group(`⚠️ Warning in ${context}`);
    console.warn('Message:', message);
    if (additionalData) {
      console.warn('Additional Data:', additionalData);
    }
    console.groupEnd();
  }
}

/**
 * Utility functions for common error handling patterns
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: any) => void
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        ErrorHandler.handleApiError(error, { logError: true });
      }
      return undefined;
    }
  };
};

export const createAsyncErrorHandler = (
  defaultErrorMessage: string = ERROR_MESSAGES.GENERIC_ERROR
) => {
  return (error: any) => {
    return ErrorHandler.handleApiError(error, {
      fallbackMessage: defaultErrorMessage,
      logError: true
    });
  };
};

// Export commonly used error handlers
export const handleContentError = ContentErrorHandler.handleGenerationError;
export const handleAuthError = AuthErrorHandler.handleAuthError;
export const handleNetworkError = NetworkErrorHandler.handleNetworkError;
