/**
 * Enhanced content generation hook following SOLID and KISS principles.
 * Integrates validation and error handling for better user experience.
 */

import { useState, useCallback } from 'react';
import { contentService, ContentRequest, GeneratedContent } from '@/lib/contentService';
import { useContentErrorHandling } from './useErrorHandling';
import { useContentValidation } from './useValidation';

export interface UseContentGenerationState {
  isLoading: boolean;
  content: GeneratedContent | null;
  isValidating: boolean;
  validationErrors: Record<string, string>;
}

export interface ContentGenerationOptions {
  validateBeforeGeneration?: boolean;
  autoRetry?: boolean;
  onSuccess?: (content: GeneratedContent) => void;
  onError?: (error: any) => void;
}

export function useContentGeneration(options: ContentGenerationOptions = {}) {
  const {
    validateBeforeGeneration = true,
    autoRetry = true,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<UseContentGenerationState>({
    isLoading: false,
    content: null,
    isValidating: false,
    validationErrors: {}
  });

  const {
    errorState,
    handleContentError,
    handleValidationError,
    clearError,
    retry
  } = useContentErrorHandling();

  const {
    validateTopic,
    validateContent,
    getContentStats,
    clearValidation
  } = useContentValidation();

  // Validate content request
  const validateRequest = useCallback((request: ContentRequest): boolean => {
    setState(prev => ({ ...prev, isValidating: true, validationErrors: {} }));

    const errors: Record<string, string> = {};

    // Validate topic
    const topicResult = validateTopic(request.topic);
    if (!topicResult.isValid && topicResult.error) {
      errors.topic = topicResult.error;
    }

    // Validate style if provided
    if (request.style && !['engaging', 'professional', 'casual', 'educational', 'humorous', 'informative', 'helpful'].includes(request.style)) {
      errors.style = 'Invalid content style';
    }

    // Validate user context if provided
    if (request.userContext) {
      const contextResult = validateContent(request.userContext);
      if (!contextResult.isValid && contextResult.error) {
        errors.userContext = contextResult.error;
      }
    }

    const hasErrors = Object.keys(errors).length > 0;

    setState(prev => ({
      ...prev,
      isValidating: false,
      validationErrors: errors
    }));

    if (hasErrors) {
      handleValidationError(errors);
    }

    return !hasErrors;
  }, [validateTopic, validateContent, handleValidationError]);

  // Generate content with validation and error handling
  const generateContent = useCallback(async (request: ContentRequest): Promise<GeneratedContent | undefined> => {
    // Clear previous errors
    clearError();
    clearValidation();

    // Validate request if enabled
    if (validateBeforeGeneration && !validateRequest(request)) {
      return undefined;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const content = await contentService.generateContent(request);

      setState(prev => ({
        ...prev,
        content,
        isLoading: false
      }));

      onSuccess?.(content);
      return content;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));

      const apiError = handleContentError(error, 'generation');
      onError?.(apiError);

      return undefined;
    }
  }, [
    validateBeforeGeneration,
    validateRequest,
    handleContentError,
    clearError,
    clearValidation,
    onSuccess,
    onError
  ]);

  // Generate tweet specifically
  const generateTweet = useCallback(async (
    topic: string,
    style?: string,
    userContext?: string
  ): Promise<GeneratedContent | undefined> => {
    return generateContent({
      type: 'tweet',
      topic,
      style: style || 'engaging',
      userContext
    });
  }, [generateContent]);

  // Generate thread specifically
  const generateThread = useCallback(async (
    topic: string,
    numTweets: number = 3,
    style?: string
  ): Promise<GeneratedContent | undefined> => {
    return generateContent({
      type: 'thread',
      topic,
      numTweets,
      style: style || 'informative'
    });
  }, [generateContent]);

  // Generate reply specifically
  const generateReply = useCallback(async (
    originalTweet: string,
    replyStyle?: string,
    userContext?: string
  ): Promise<GeneratedContent | undefined> => {
    return generateContent({
      type: 'reply',
      originalTweet,
      replyStyle: replyStyle || 'helpful',
      userContext
    });
  }, [generateContent]);

  // Clear all state
  const clearAll = useCallback(() => {
    setState({
      isLoading: false,
      content: null,
      isValidating: false,
      validationErrors: {}
    });
    clearError();
    clearValidation();
  }, [clearError, clearValidation]);

  // Get content statistics
  const getContentStatistics = useCallback((content: string) => {
    return getContentStats(content);
  }, [getContentStats]);

  return {
    // State
    ...state,
    errorState,

    // Actions
    generateContent,
    generateTweet,
    generateThread,
    generateReply,
    validateRequest,
    clearAll,
    clearError,

    // Utilities
    getContentStatistics
  };
}
