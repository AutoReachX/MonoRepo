/**
 * Unit tests for validation hooks.
 * Tests validation logic, debouncing, and error handling.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useFormValidation,
  useContentValidation,
  useFieldValidation,
  useValidationSchemas
} from '@/hooks/useValidation';
import { ValidationUtils, ContentValidation } from '@/lib/validation';

// Mock the validation utilities
jest.mock('@/lib/validation', () => ({
  ValidationUtils: {
    validateRequired: jest.fn(),
    validateLength: jest.fn(),
    validateEmail: jest.fn()
  },
  ContentValidation: {
    validateTopic: jest.fn(),
    validateContent: jest.fn(),
    getContentStats: jest.fn()
  },
  FormValidation: {
    validateFormData: jest.fn()
  },
  ValidationSchemas: {
    contentGeneration: {},
    userRegistration: {},
    userLogin: {}
  }
}));

describe('useFormValidation', () => {
  const mockValidationSchema = {
    topic: jest.fn(),
    style: jest.fn()
  };

  const initialData = {
    topic: '',
    style: 'engaging'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema)
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.validationState.errors).toEqual({});
    expect(result.current.validationState.isValid).toBe(true);
    expect(result.current.validationState.isValidating).toBe(false);
    expect(result.current.validationState.hasValidated).toBe(false);
  });

  it('should update field value', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema)
    );

    act(() => {
      result.current.updateField('topic', 'AI trends');
    });

    expect(result.current.data.topic).toBe('AI trends');
  });

  it('should validate field on change when enabled', () => {
    mockValidationSchema.topic.mockReturnValue({ isValid: true });

    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema, {
        validateOnChange: true,
        debounceDelay: 0
      })
    );

    act(() => {
      result.current.updateField('topic', 'AI trends');
    });

    expect(mockValidationSchema.topic).toHaveBeenCalledWith('AI trends');
  });

  it('should debounce validation when delay is set', () => {
    mockValidationSchema.topic.mockReturnValue({ isValid: true });
    const mockFormValidation = require('@/lib/validation').FormValidation;
    mockFormValidation.validateFormData.mockReturnValue({});

    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema, {
        validateOnChange: true,
        debounceDelay: 500
      })
    );

    act(() => {
      result.current.updateField('topic', 'AI trends');
    });

    // Validation should not be called immediately
    expect(mockFormValidation.validateFormData).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFormValidation.validateFormData).toHaveBeenCalled();
  });

  it('should validate field on blur when enabled', () => {
    mockValidationSchema.topic.mockReturnValue({ isValid: true });

    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema, {
        validateOnBlur: true
      })
    );

    act(() => {
      result.current.handleFieldBlur('topic');
    });

    expect(mockValidationSchema.topic).toHaveBeenCalledWith('');
  });

  it('should validate all fields', () => {
    const mockFormValidation = require('@/lib/validation').FormValidation;
    mockFormValidation.validateFormData.mockReturnValue({
      topic: 'Topic is required'
    });

    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema)
    );

    let isValid;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.validationState.errors.topic).toBe('Topic is required');
    expect(result.current.validationState.hasValidated).toBe(true);
  });

  it('should reset validation state', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema)
    );

    // Set some validation state
    act(() => {
      result.current.validateAll();
    });

    act(() => {
      result.current.resetValidation();
    });

    expect(result.current.validationState.errors).toEqual({});
    expect(result.current.validationState.isValid).toBe(true);
    expect(result.current.validationState.hasValidated).toBe(false);
  });

  it('should reset form data', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, mockValidationSchema)
    );

    act(() => {
      result.current.updateField('topic', 'Changed value');
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.validationState.errors).toEqual({});
  });
});

describe('useContentValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate topic', () => {
    const mockValidationResult = { isValid: true };
    (ContentValidation.validateTopic as jest.Mock).mockReturnValue(mockValidationResult);

    const { result } = renderHook(() => useContentValidation());

    let validationResult;
    act(() => {
      validationResult = result.current.validateTopic('AI trends');
    });

    expect(ContentValidation.validateTopic).toHaveBeenCalledWith('AI trends');
    expect(validationResult).toEqual(mockValidationResult);
    expect(result.current.validationResults.topic).toEqual(mockValidationResult);
  });

  it('should validate content', () => {
    const mockValidationResult = { isValid: true };
    (ContentValidation.validateContent as jest.Mock).mockReturnValue(mockValidationResult);

    const { result } = renderHook(() => useContentValidation());

    let validationResult;
    act(() => {
      validationResult = result.current.validateContent('Test content');
    });

    expect(ContentValidation.validateContent).toHaveBeenCalledWith('Test content');
    expect(validationResult).toEqual(mockValidationResult);
    expect(result.current.validationResults.content).toEqual(mockValidationResult);
  });

  it('should get content stats', () => {
    const mockStats = { length: 12, wordCount: 2 };
    (ContentValidation.getContentStats as jest.Mock).mockReturnValue(mockStats);

    const { result } = renderHook(() => useContentValidation());

    const stats = result.current.getContentStats('Test content');

    expect(ContentValidation.getContentStats).toHaveBeenCalledWith('Test content');
    expect(stats).toEqual(mockStats);
  });

  it('should clear validation for specific field', () => {
    const { result } = renderHook(() => useContentValidation());

    // Set validation result
    act(() => {
      result.current.validateTopic('AI trends');
    });

    act(() => {
      result.current.clearValidation('topic');
    });

    expect(result.current.validationResults.topic).toBeUndefined();
  });

  it('should clear all validation', () => {
    const { result } = renderHook(() => useContentValidation());

    // Set validation results
    act(() => {
      result.current.validateTopic('AI trends');
      result.current.validateContent('Test content');
    });

    act(() => {
      result.current.clearValidation();
    });

    expect(result.current.validationResults).toEqual({});
  });
});

describe('useFieldValidation', () => {
  const mockValidator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with valid state', () => {
    const { result } = renderHook(() =>
      useFieldValidation(mockValidator)
    );

    expect(result.current.result.isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
  });

  it('should validate immediately when debounce is 0', () => {
    const mockResult = { isValid: false, error: 'Invalid input' };
    mockValidator.mockReturnValue(mockResult);

    const { result } = renderHook(() =>
      useFieldValidation(mockValidator, 0)
    );

    act(() => {
      result.current.validate('test value');
    });

    expect(mockValidator).toHaveBeenCalledWith('test value');
    expect(result.current.result).toEqual(mockResult);
  });

  it('should debounce validation when delay is set', () => {
    const mockResult = { isValid: false, error: 'Invalid input' };
    mockValidator.mockReturnValue(mockResult);

    const { result } = renderHook(() =>
      useFieldValidation(mockValidator, 500)
    );

    act(() => {
      result.current.validate('test value');
    });

    expect(result.current.isValidating).toBe(false);
    expect(mockValidator).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockValidator).toHaveBeenCalledWith('test value');
    expect(result.current.result).toEqual(mockResult);
  });

  it('should clear validation', () => {
    const { result } = renderHook(() =>
      useFieldValidation(mockValidator)
    );

    act(() => {
      result.current.clearValidation();
    });

    expect(result.current.result.isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
  });
});

describe('useValidationSchemas', () => {
  it('should return validation schemas', () => {
    const { result } = renderHook(() => useValidationSchemas());

    expect(result.current).toHaveProperty('contentGeneration');
    expect(result.current).toHaveProperty('userRegistration');
    expect(result.current).toHaveProperty('userLogin');
  });
});
