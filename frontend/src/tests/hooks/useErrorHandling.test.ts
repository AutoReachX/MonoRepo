/**
 * Unit tests for error handling hooks.
 * Tests error management, retry logic, and user feedback.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useErrorHandler,
  useRetryableOperation,
  useErrorBoundary,
  useToastNotifications
} from '@/hooks/useErrorHandling';
import { ErrorHandler } from '@/lib/errorHandling';

// Mock the error handling utilities
jest.mock('@/lib/errorHandling', () => ({
  ErrorHandler: {
    handleError: jest.fn(),
    getErrorMessage: jest.fn(),
    isRetryableError: jest.fn(),
    logError: jest.fn()
  }
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.errorHistory).toEqual([]);
  });

  it('should handle error correctly', () => {
    const mockError = new Error('Test error');
    const mockErrorMessage = 'Formatted error message';
    (ErrorHandler.getErrorMessage as jest.Mock).mockReturnValue(mockErrorMessage);

    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(mockError);
    });

    expect(ErrorHandler.handleError).toHaveBeenCalledWith(mockError);
    expect(ErrorHandler.getErrorMessage).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe(mockErrorMessage);
    expect(result.current.hasError).toBe(true);
    expect(result.current.errorHistory).toHaveLength(1);
  });

  it('should handle error with context', () => {
    const mockError = new Error('Test error');
    const context = { operation: 'content-generation', userId: '123' };

    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(mockError, context);
    });

    expect(ErrorHandler.handleError).toHaveBeenCalledWith(mockError, context);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandler());

    // Set error first
    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    // Set multiple errors
    act(() => {
      result.current.handleError(new Error('Error 1'));
      result.current.handleError(new Error('Error 2'));
    });

    act(() => {
      result.current.clearAllErrors();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.errorHistory).toEqual([]);
  });

  it('should get error by id', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    const errorId = result.current.errorHistory[0].id;
    const foundError = result.current.getErrorById(errorId);

    expect(foundError).toBeDefined();
    expect(foundError?.message).toBe('Formatted error message');
  });

  it('should limit error history size', () => {
    const { result } = renderHook(() => useErrorHandler({ maxHistorySize: 2 }));

    act(() => {
      result.current.handleError(new Error('Error 1'));
      result.current.handleError(new Error('Error 2'));
      result.current.handleError(new Error('Error 3'));
    });

    expect(result.current.errorHistory).toHaveLength(2);
    expect(result.current.errorHistory[0].message).toBe('Formatted error message'); // Error 2
    expect(result.current.errorHistory[1].message).toBe('Formatted error message'); // Error 3
  });
});

describe('useRetryableOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const mockOperation = jest.fn();
    const { result } = renderHook(() => useRetryableOperation(mockOperation));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  it('should execute operation successfully', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetryableOperation(mockOperation));

    let operationResult;
    await act(async () => {
      operationResult = await result.current.execute('test-arg');
    });

    expect(mockOperation).toHaveBeenCalledWith('test-arg');
    expect(operationResult).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should retry on retryable error', async () => {
    const mockError = new Error('Retryable error');
    (ErrorHandler.isRetryableError as jest.Mock).mockReturnValue(true);
    
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useRetryableOperation(mockOperation, { maxRetries: 3, retryDelay: 1000 })
    );

    const executePromise = act(async () => {
      return result.current.execute('test-arg');
    });

    // Fast-forward through retry delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const operationResult = await executePromise;

    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(operationResult).toBe('success');
    expect(result.current.retryCount).toBe(1);
  });

  it('should stop retrying after max attempts', async () => {
    const mockError = new Error('Persistent error');
    (ErrorHandler.isRetryableError as jest.Mock).mockReturnValue(true);
    (ErrorHandler.getErrorMessage as jest.Mock).mockReturnValue('Persistent error');
    
    const mockOperation = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => 
      useRetryableOperation(mockOperation, { maxRetries: 2, retryDelay: 100 })
    );

    await act(async () => {
      try {
        await result.current.execute('test-arg');
      } catch (error) {
        // Expected to throw after max retries
      }
    });

    // Fast-forward through all retry delays
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(result.current.retryCount).toBe(2);
    expect(result.current.canRetry).toBe(false);
    expect(result.current.error).toBe('Persistent error');
  });

  it('should not retry non-retryable errors', async () => {
    const mockError = new Error('Non-retryable error');
    (ErrorHandler.isRetryableError as jest.Mock).mockReturnValue(false);
    (ErrorHandler.getErrorMessage as jest.Mock).mockReturnValue('Non-retryable error');
    
    const mockOperation = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useRetryableOperation(mockOperation));

    await act(async () => {
      try {
        await result.current.execute('test-arg');
      } catch (error) {
        // Expected to throw immediately
      }
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.error).toBe('Non-retryable error');
  });

  it('should reset state', () => {
    const mockOperation = jest.fn();
    const { result } = renderHook(() => useRetryableOperation(mockOperation));

    // Set some state
    act(() => {
      result.current.setError('Test error');
      result.current.setRetryCount(2);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  it('should manually retry', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetryableOperation(mockOperation));

    await act(async () => {
      await result.current.retry('test-arg');
    });

    expect(mockOperation).toHaveBeenCalledWith('test-arg');
    expect(result.current.retryCount).toBe(1);
  });
});

describe('useErrorBoundary', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorBoundary());

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should capture error', () => {
    const { result } = renderHook(() => useErrorBoundary());

    const testError = new Error('Boundary error');

    act(() => {
      result.current.captureError(testError);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(testError);
  });

  it('should reset error boundary', () => {
    const { result } = renderHook(() => useErrorBoundary());

    // Set error first
    act(() => {
      result.current.captureError(new Error('Test error'));
    });

    act(() => {
      result.current.resetErrorBoundary();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useToastNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useToastNotifications());

    expect(result.current.notifications).toEqual([]);
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useToastNotifications());

    act(() => {
      result.current.addNotification({
        type: 'error',
        message: 'Test error message'
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('error');
    expect(result.current.notifications[0].message).toBe('Test error message');
  });

  it('should auto-remove notification after timeout', () => {
    const { result } = renderHook(() => useToastNotifications());

    act(() => {
      result.current.addNotification({
        type: 'success',
        message: 'Success message',
        duration: 3000
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should manually remove notification', () => {
    const { result } = renderHook(() => useToastNotifications());

    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Info message'
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useToastNotifications());

    act(() => {
      result.current.addNotification({ type: 'error', message: 'Error 1' });
      result.current.addNotification({ type: 'error', message: 'Error 2' });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });
});
