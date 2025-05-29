/**
 * Custom hooks for error handling following SOLID and KISS principles.
 * Provides consistent error handling across components.
 */

import { useState, useCallback, useRef } from 'react';
import {
  ErrorHandler,
  ContentErrorHandler,
  AuthErrorHandler,
  NetworkErrorHandler,
  RetryHandler,
  ApiError,
  withErrorHandling
} from '@/lib/errorHandling';
import { API_CONFIG } from '@/lib/constants';

export interface ErrorState {
  error: ApiError | null;
  isError: boolean;
  errorId: string | null;
}

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
}

/**
 * Hook for general error handling with retry logic
 */
export function useErrorHandling(maxRetries: number = API_CONFIG.RETRY_ATTEMPTS) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorId: null
  });

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    maxRetries,
    canRetry: true
  });

  const errorIdRef = useRef<number>(0);

  // Handle error with optional retry capability
  const handleError = useCallback((error: unknown, context?: string) => {
    const apiError = ErrorHandler.handleApiError(error, {
      logError: true,
      fallbackMessage: `Error in ${context || 'operation'}`
    });

    const errorId = `error_${++errorIdRef.current}_${Date.now()}`;

    setErrorState({
      error: apiError,
      isError: true,
      errorId
    });

    // Determine if error is retryable
    const canRetry = RetryHandler.isRetryableError(error) && retryState.retryCount < maxRetries;

    setRetryState(prev => ({
      ...prev,
      canRetry,
      isRetrying: false
    }));

    return apiError;
  }, [maxRetries, retryState.retryCount]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorId: null
    });

    setRetryState(prev => ({
      ...prev,
      isRetrying: false,
      retryCount: 0,
      canRetry: true
    }));
  }, []);

  // Retry failed operation
  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!retryState.canRetry || retryState.isRetrying) {
      return;
    }

    setRetryState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      const result = await RetryHandler.retryOperation(
        operation,
        maxRetries - retryState.retryCount,
        API_CONFIG.RETRY_DELAY
      );

      clearError();
      return result;
    } catch (error) {
      handleError(error, 'retry operation');
      throw error;
    }
  }, [retryState, maxRetries, handleError, clearError]);

  // Execute operation with error handling
  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | undefined> => {
    try {
      clearError();
      return await operation();
    } catch (error) {
      handleError(error, context);
      return undefined;
    }
  }, [handleError, clearError]);

  return {
    errorState,
    retryState,
    handleError,
    clearError,
    retry,
    executeWithErrorHandling
  };
}

/**
 * Hook for content-specific error handling
 */
export function useContentErrorHandling() {
  const { handleError: baseHandleError, ...baseHooks } = useErrorHandling();

  const handleContentError = useCallback((error: unknown, operation?: string) => {
    const apiError = ContentErrorHandler.handleGenerationError(error);
    return baseHandleError(apiError, `content ${operation || 'operation'}`);
  }, [baseHandleError]);

  const handleValidationError = useCallback((errors: unknown) => {
    const apiError = ContentErrorHandler.handleContentValidationError(errors);
    return baseHandleError(apiError, 'content validation');
  }, [baseHandleError]);

  return {
    ...baseHooks,
    handleContentError,
    handleValidationError
  };
}

/**
 * Hook for authentication error handling
 */
export function useAuthErrorHandling() {
  const { handleError: baseHandleError, ...baseHooks } = useErrorHandling();

  const handleAuthError = useCallback((error: unknown) => {
    const apiError = AuthErrorHandler.handleAuthError(error);
    return baseHandleError(apiError, 'authentication');
  }, [baseHandleError]);

  const handleTokenExpiration = useCallback(() => {
    AuthErrorHandler.handleTokenExpiration();
    // Clear error state since token expiration is handled
    baseHooks.clearError();
  }, [baseHooks]);

  return {
    ...baseHooks,
    handleAuthError,
    handleTokenExpiration
  };
}

/**
 * Hook for network error handling
 */
export function useNetworkErrorHandling() {
  const { handleError: baseHandleError, ...baseHooks } = useErrorHandling();

  const handleNetworkError = useCallback((error: unknown) => {
    const apiError = NetworkErrorHandler.handleNetworkError(error);
    return baseHandleError(apiError, 'network operation');
  }, [baseHandleError]);

  const handleRateLimitError = useCallback((error: unknown) => {
    const apiError = NetworkErrorHandler.handleRateLimitError(error);
    return baseHandleError(apiError, 'rate limited operation');
  }, [baseHandleError]);

  return {
    ...baseHooks,
    handleNetworkError,
    handleRateLimitError
  };
}

/**
 * Hook for async operations with built-in error handling
 */
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { errorState, handleError, clearError } = useErrorHandling();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
      context?: string;
    }
  ) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await operation();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const apiError = handleError(error, options?.context);
      options?.onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    clearError();
  }, [clearError]);

  return {
    isLoading,
    data,
    errorState,
    execute,
    reset
  };
}

/**
 * Hook for creating error boundaries
 */
export function useErrorBoundary() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetErrorBoundary = useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    setHasError(true);
    setError(error);

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Here you could integrate with error reporting service
    // errorReportingService.captureException(error, errorInfo);
  }, []);

  return {
    hasError,
    error,
    resetErrorBoundary,
    captureError
  };
}

/**
 * Hook for managing error state with history
 */
export interface ErrorHistoryItem {
  id: string;
  message: string;
  timestamp: number;
  context?: any;
}

export interface UseErrorHandlerOptions {
  maxHistorySize?: number;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { maxHistorySize = 10 } = options;
  const [error, setError] = useState<string | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorHistoryItem[]>([]);
  const errorIdRef = useRef<number>(0);

  const handleError = useCallback((error: unknown, context?: any) => {
    const message = ErrorHandler.getErrorMessage(error);
    const errorId = `error_${++errorIdRef.current}_${Date.now()}`;

    // Process error through ErrorHandler
    ErrorHandler.handleError(error, context);

    setError(message);

    const errorItem: ErrorHistoryItem = {
      id: errorId,
      message,
      timestamp: Date.now(),
      context
    };

    setErrorHistory(prev => {
      const newHistory = [errorItem, ...prev];
      return newHistory.slice(0, maxHistorySize);
    });
  }, [maxHistorySize]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAllErrors = useCallback(() => {
    setError(null);
    setErrorHistory([]);
  }, []);

  const getErrorById = useCallback((id: string) => {
    return errorHistory.find(item => item.id === id);
  }, [errorHistory]);

  return {
    error,
    hasError: error !== null,
    errorHistory,
    handleError,
    clearError,
    clearAllErrors,
    getErrorById
  };
}

/**
 * Hook for retryable operations
 */
export interface UseRetryableOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export function useRetryableOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseRetryableOperationOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [canRetry, setCanRetry] = useState(true);

  const execute = useCallback(async (...args: T): Promise<R> => {
    setIsLoading(true);
    setError(null);

    let currentRetryCount = 0;

    while (currentRetryCount <= maxRetries) {
      try {
        const result = await operation(...args);
        setIsLoading(false);
        setRetryCount(currentRetryCount);
        return result;
      } catch (err) {
        const isRetryable = ErrorHandler.isRetryableError(err);

        if (!isRetryable || currentRetryCount >= maxRetries) {
          const message = ErrorHandler.getErrorMessage(err);
          setError(message);
          setIsLoading(false);
          setRetryCount(currentRetryCount);
          setCanRetry(false);
          throw err;
        }

        currentRetryCount++;
        setRetryCount(currentRetryCount);

        if (currentRetryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw new Error('Max retries exceeded');
  }, [operation, maxRetries, retryDelay]);

  const retry = useCallback(async (...args: T): Promise<R> => {
    setRetryCount(prev => prev + 1);
    return execute(...args);
  }, [execute]);

  const reset = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setCanRetry(true);
    setIsLoading(false);
  }, []);

  // Helper methods for testing
  const setError_ = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const setRetryCount_ = useCallback((count: number) => {
    setRetryCount(count);
  }, []);

  return {
    isLoading,
    error,
    retryCount,
    canRetry,
    execute,
    retry,
    reset,
    // Expose setters for testing
    setError: setError_,
    setRetryCount: setRetryCount_
  };
}

/**
 * Hook for toast notifications
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function useToastNotifications() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const notificationIdRef = useRef<number>(0);

  const addNotification = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = `toast_${++notificationIdRef.current}_${Date.now()}`;
    const newNotification: ToastNotification = {
      id,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}
