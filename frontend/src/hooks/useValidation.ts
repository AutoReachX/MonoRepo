/**
 * Custom hooks for validation following SOLID and KISS principles.
 * Provides reusable validation logic across components.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ValidationUtils,
  ContentValidation,
  FormValidation,
  ValidationResult,
  FieldValidationResult,
  ValidationSchemas
} from '@/lib/validation';
import { UI_CONSTANTS } from '@/lib/constants';

export interface UseValidationOptions {
  debounceDelay?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  hasValidated: boolean;
}

/**
 * Hook for form validation with real-time feedback
 */
export function useFormValidation<T extends Record<string, unknown>>(
  initialData: T,
  validationSchema: Record<keyof T, (value: unknown) => FieldValidationResult>,
  options: UseValidationOptions = {}
) {
  const {
    debounceDelay = UI_CONSTANTS.DEBOUNCE_DELAY,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValid: true,
    isValidating: false,
    hasValidated: false
  });

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((dataToValidate: T) => {
      setValidationState(prev => ({ ...prev, isValidating: true }));
      
      const errors = FormValidation.validateFormData(dataToValidate, validationSchema);
      const hasErrors = Object.values(errors).some(error => error !== undefined);
      
      setValidationState({
        errors: errors as Record<string, string>,
        isValid: !hasErrors,
        isValidating: false,
        hasValidated: true
      });
    }, debounceDelay),
    [validationSchema, debounceDelay]
  );

  // Validate specific field
  const validateField = useCallback(
    (fieldName: keyof T, value: unknown) => {
      const validator = validationSchema[fieldName];
      if (!validator) return;

      const result = validator(value);
      
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: result.isValid ? '' : (result.error || '')
        },
        hasValidated: true
      }));
    },
    [validationSchema]
  );

  // Update field value
  const updateField = useCallback(
    (fieldName: keyof T, value: unknown) => {
      const newData = { ...data, [fieldName]: value };
      setData(newData);

      if (validateOnChange) {
        if (debounceDelay > 0) {
          debouncedValidate(newData);
        } else {
          validateField(fieldName, value);
        }
      }
    },
    [data, validateOnChange, debounceDelay, debouncedValidate, validateField]
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    (fieldName: keyof T) => {
      if (validateOnBlur) {
        validateField(fieldName, data[fieldName]);
      }
    },
    [validateOnBlur, validateField, data]
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    const errors = FormValidation.validateFormData(data, validationSchema);
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    
    setValidationState({
      errors: errors as Record<string, string>,
      isValid: !hasErrors,
      isValidating: false,
      hasValidated: true
    });

    return !hasErrors;
  }, [data, validationSchema]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      errors: {},
      isValid: true,
      isValidating: false,
      hasValidated: false
    });
  }, []);

  // Reset form data
  const resetForm = useCallback(() => {
    setData(initialData);
    resetValidation();
  }, [initialData, resetValidation]);

  return {
    data,
    validationState,
    updateField,
    handleFieldBlur,
    validateField,
    validateAll,
    resetValidation,
    resetForm,
    setData
  };
}

/**
 * Hook for content validation (tweets, threads, etc.)
 */
export function useContentValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, FieldValidationResult>>({});

  const validateTopic = useCallback((topic: string) => {
    const result = ContentValidation.validateTopic(topic);
    setValidationResults(prev => ({ ...prev, topic: result }));
    return result;
  }, []);

  const validateContent = useCallback((content: string) => {
    const result = ContentValidation.validateContent(content);
    setValidationResults(prev => ({ ...prev, content: result }));
    return result;
  }, []);

  const getContentStats = useCallback((content: string) => {
    return ContentValidation.getContentStats(content);
  }, []);

  const clearValidation = useCallback((field?: string) => {
    if (field) {
      setValidationResults(prev => {
        const newResults = { ...prev };
        delete newResults[field];
        return newResults;
      });
    } else {
      setValidationResults({});
    }
  }, []);

  return {
    validationResults,
    validateTopic,
    validateContent,
    getContentStats,
    clearValidation
  };
}

/**
 * Hook for real-time field validation
 */
export function useFieldValidation(
  validator: (value: unknown) => FieldValidationResult,
  debounceDelay: number = UI_CONSTANTS.DEBOUNCE_DELAY
) {
  const [result, setResult] = useState<FieldValidationResult>({ isValid: true });
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidate = useCallback(
    debounce((value: unknown) => {
      setIsValidating(true);
      const validationResult = validator(value);
      setResult(validationResult);
      setIsValidating(false);
    }, debounceDelay),
    [validator, debounceDelay]
  );

  const validate = useCallback((value: unknown) => {
    if (debounceDelay > 0) {
      debouncedValidate(value);
    } else {
      const validationResult = validator(value);
      setResult(validationResult);
    }
  }, [validator, debounceDelay, debouncedValidate]);

  const clearValidation = useCallback(() => {
    setResult({ isValid: true });
    setIsValidating(false);
  }, []);

  return {
    result,
    isValidating,
    validate,
    clearValidation
  };
}

/**
 * Hook for common validation schemas
 */
export function useValidationSchemas() {
  return useMemo(() => ({
    contentGeneration: ValidationSchemas.contentGeneration,
    userRegistration: ValidationSchemas.userRegistration,
    userLogin: ValidationSchemas.userLogin
  }), []);
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
