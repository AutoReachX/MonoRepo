/**
 * Frontend validation utilities following DRY and KISS principles.
 * Centralizes validation logic to eliminate code duplication.
 */

import {
  VALIDATION_RULES,
  REGEX_PATTERNS,
  CONTENT_CONSTANTS,
  TWITTER_CONSTANTS
} from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Base validation utilities
 */
export class ValidationUtils {
  /**
   * Validate required field
   */
  static validateRequired(value: unknown, fieldName: string = 'This field'): FieldValidationResult {
    if (value === null || value === undefined) {
      // If fieldName contains "is required" or similar, use it as is
      if (fieldName.toLowerCase().includes('required') || fieldName.toLowerCase().includes('error')) {
        return { isValid: false, error: fieldName };
      }
      return { isValid: false, error: `${fieldName} is required` };
    }

    if (typeof value === 'string' && !value.trim()) {
      if (fieldName.toLowerCase().includes('required') || fieldName.toLowerCase().includes('error')) {
        return { isValid: false, error: fieldName };
      }
      return { isValid: false, error: `${fieldName} is required` };
    }

    if (Array.isArray(value) && value.length === 0) {
      if (fieldName.toLowerCase().includes('required') || fieldName.toLowerCase().includes('error')) {
        return { isValid: false, error: fieldName };
      }
      return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
  }

  /**
   * Validate string length
   */
  static validateLength(
    value: string,
    minLength?: number,
    maxLength?: number
  ): FieldValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, error: 'Value must be a string' };
    }

    const length = value.length;

    if (minLength !== undefined && length < minLength) {
      return {
        isValid: false,
        error: `Must be at least ${minLength} characters long`
      };
    }

    if (maxLength !== undefined && length > maxLength) {
      return {
        isValid: false,
        error: `Must be no more than ${maxLength} characters long`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): FieldValidationResult {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (!REGEX_PATTERNS.EMAIL.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }

  /**
   * Validate pattern match
   */
  static validatePattern(value: string, pattern: RegExp, errorMessage: string = 'Invalid format'): FieldValidationResult {
    if (!pattern.test(value)) {
      return { isValid: false, error: errorMessage };
    }
    return { isValid: true };
  }

  /**
   * Validate numeric range
   */
  static validateRange(value: number, min: number, max: number): FieldValidationResult {
    if (value < min || value > max) {
      return { isValid: false, error: `Must be between ${min} and ${max}` };
    }
    return { isValid: true };
  }

  /**
   * Validate choice from options
   */
  static validateChoice(value: string, choices: readonly string[] | string[], errorMessage: string = 'Please select a valid option'): FieldValidationResult {
    if (!choices.includes(value)) {
      return { isValid: false, error: errorMessage };
    }
    return { isValid: true };
  }



  /**
   * Validate username
   */
  static validateUsername(username: string): FieldValidationResult {
    const requiredResult = this.validateRequired(username, 'Username');
    if (!requiredResult.isValid) return requiredResult;

    const lengthResult = this.validateLength(username, 3, 20);
    if (!lengthResult.isValid) return lengthResult;

    if (!REGEX_PATTERNS.USERNAME.test(username)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    return { isValid: true };
  }

  /**
   * Validate password
   */
  static validatePassword(password: string): FieldValidationResult {
    const requiredResult = this.validateRequired(password, 'Password');
    if (!requiredResult.isValid) return requiredResult;

    if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      return {
        isValid: false,
        error: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters long`
      };
    }

    if (!REGEX_PATTERNS.PASSWORD.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      };
    }

    return { isValid: true };
  }
}

/**
 * Content-specific validation utilities
 */
export class ContentValidation {
  /**
   * Validate topic for content generation
   */
  static validateTopic(topic: string): FieldValidationResult {
    const requiredResult = ValidationUtils.validateRequired(topic, 'Topic');
    if (!requiredResult.isValid) return requiredResult;

    const length = topic.length;
    if (length < VALIDATION_RULES.MIN_TOPIC_LENGTH) {
      return {
        isValid: false,
        error: `Topic must be at least ${VALIDATION_RULES.MIN_TOPIC_LENGTH} characters long`
      };
    }

    if (length > VALIDATION_RULES.MAX_TOPIC_LENGTH) {
      return {
        isValid: false,
        error: `Topic must be no more than ${VALIDATION_RULES.MAX_TOPIC_LENGTH} characters long`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate content for tweets
   */
  static validateContent(content: string): FieldValidationResult {
    const requiredResult = ValidationUtils.validateRequired(content, 'Content');
    if (!requiredResult.isValid) return requiredResult;

    const length = content.length;
    if (length > TWITTER_CONSTANTS.MAX_TWEET_LENGTH) {
      return {
        isValid: false,
        error: `Content must be no more than ${TWITTER_CONSTANTS.MAX_TWEET_LENGTH} characters long`
      };
    }

    const warnings: string[] = [];

    // Check for too many hashtags
    const hashtagCount = ContentValidation.countHashtags(content);
    if (hashtagCount > 3) {
      warnings.push('Consider using fewer hashtags for better engagement');
    }

    // Check for too many mentions
    const mentionCount = ContentValidation.countMentions(content);
    if (mentionCount > 5) {
      warnings.push('Too many mentions may reduce visibility');
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate content style
   */
  static validateStyle(style: string): FieldValidationResult {
    return ValidationUtils.validateChoice(
      style,
      CONTENT_CONSTANTS.SUPPORTED_STYLES,
      'Please select a valid style'
    );
  }

  /**
   * Validate language
   */
  static validateLanguage(language: string): FieldValidationResult {
    const supportedLanguages = CONTENT_CONSTANTS.SUPPORTED_LANGUAGES.map(lang => lang.code);
    return ValidationUtils.validateChoice(
      language,
      supportedLanguages,
      'Please select a valid language'
    );
  }

  /**
   * Validate thread size
   */
  static validateThreadSize(size: number): FieldValidationResult {
    if (size < 2) {
      return { isValid: false, error: 'Thread must have at least 2 tweets' };
    }
    if (size > TWITTER_CONSTANTS.MAX_THREAD_TWEETS) {
      return { isValid: false, error: `Thread cannot have more than ${TWITTER_CONSTANTS.MAX_THREAD_TWEETS} tweets` };
    }
    return { isValid: true };
  }



  /**
   * Count hashtags in content
   */
  static countHashtags(content: string): number {
    const matches = content.match(REGEX_PATTERNS.HASHTAG);
    return matches ? matches.length : 0;
  }

  /**
   * Count mentions in content
   */
  static countMentions(content: string): number {
    const matches = content.match(REGEX_PATTERNS.MENTION);
    return matches ? matches.length : 0;
  }

  /**
   * Count URLs in content
   */
  static countUrls(content: string): number {
    const matches = content.match(REGEX_PATTERNS.URL);
    return matches ? matches.length : 0;
  }

  /**
   * Get content statistics
   */
  static getContentStats(content: string) {
    const characterCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    return {
      characterCount,
      wordCount,
      hashtagCount: ContentValidation.countHashtags(content),
      mentionCount: ContentValidation.countMentions(content),
      urlCount: ContentValidation.countUrls(content),
      // Add properties expected by tests
      length: characterCount,
      remaining: TWITTER_CONSTANTS.MAX_TWEET_LENGTH - characterCount,
    };
  }
}

/**
 * Form validation utilities
 */
export class FormValidation {
  /**
   * Validate multiple fields and return combined result
   */
  static validateFields(
    validations: Array<() => FieldValidationResult>
  ): ValidationResult {
    const errors: string[] = [];

    for (const validation of validations) {
      const result = validation();
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate form data against schema
   */
  static validateFormData<T extends Record<string, unknown>>(
    data: T,
    schema: Record<keyof T, (value: unknown) => FieldValidationResult>
  ): Record<keyof T, string | undefined> {
    const errors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>;

    for (const [field, validator] of Object.entries(schema)) {
      const result = validator(data[field as keyof T]);
      if (!result.isValid && result.error) {
        errors[field as keyof T] = result.error;
      }
    }

    return errors;
  }

  /**
   * Validate single field
   */
  static validateField(
    value: unknown,
    validator: (value: unknown) => FieldValidationResult
  ): FieldValidationResult {
    return validator(value);
  }
}

/**
 * Real-time validation hook utilities
 */
export class ValidationHooks {
  /**
   * Debounced validation for real-time feedback
   */
  static createDebouncedValidator(
    validator: (value: unknown) => FieldValidationResult,
    delay: number = 300
  ) {
    let timeoutId: NodeJS.Timeout;

    return (value: unknown, callback: (result: FieldValidationResult) => void) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = validator(value);
        callback(result);
      }, delay);
    };
  }
}

/**
 * Common validation schemas for forms
 */
export const ValidationSchemas = {
  contentGeneration: {
    topic: (value: unknown) => ContentValidation.validateTopic(value as string),
    style: (value: unknown) => ContentValidation.validateStyle(value as string),
    language: (value: unknown) => ContentValidation.validateLanguage(value as string),
  },

  userRegistration: {
    username: (value: unknown) => ValidationUtils.validateUsername(value as string),
    email: (value: unknown) => ValidationUtils.validateEmail(value as string),
    password: (value: unknown) => ValidationUtils.validatePassword(value as string),
  },

  userLogin: {
    email: (value: unknown) => ValidationUtils.validateEmail(value as string),
    password: (value: unknown) => ValidationUtils.validateRequired(value, 'Password'),
  },
};

/**
 * Utility functions for common validation patterns
 */
export const validateContentGenerationForm = (data: {
  topic: string;
  style?: string;
  language?: string;
}) => {
  const errors: Record<string, string | undefined> = {};

  const topicValidation = ValidationSchemas.contentGeneration.topic(data.topic);
  if (!topicValidation.isValid && topicValidation.error) {
    errors.topic = topicValidation.error;
  }

  return errors;
};

export const validateUserRegistrationForm = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return FormValidation.validateFormData(data, ValidationSchemas.userRegistration);
};

export const validateUserLoginForm = (data: {
  email: string;
  password: string;
}) => {
  return FormValidation.validateFormData(data, ValidationSchemas.userLogin);
};
