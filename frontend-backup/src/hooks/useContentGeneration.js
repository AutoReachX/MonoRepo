/**
 * Custom hook for content generation operations.
 * Following Single Responsibility Principle by separating business logic from UI.
 */

import { useState, useCallback } from 'react';
import { contentService } from '../services/contentService';

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const generateTweet = useCallback(async (requestData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await contentService.generateTweet(requestData);
      setLastGenerated(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate tweet');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateThread = useCallback(async (requestData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await contentService.generateThread(requestData);
      setLastGenerated(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate thread');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateReply = useCallback(async (requestData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await contentService.generateReply(requestData);
      setLastGenerated(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate reply');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLastGenerated = useCallback(() => {
    setLastGenerated(null);
  }, []);

  return {
    isGenerating,
    error,
    lastGenerated,
    generateTweet,
    generateThread,
    generateReply,
    clearError,
    clearLastGenerated
  };
};
