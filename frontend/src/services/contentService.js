/**
 * Content service for API communication.
 * Following Single Responsibility Principle and KISS.
 */

import { apiClient } from './apiClient';

class ContentService {
  /**
   * Generate a tweet using AI
   * @param {Object} requestData - Tweet generation request
   * @returns {Promise<Object>} Generated tweet response
   */
  async generateTweet(requestData) {
    try {
      const response = await apiClient.post('/content/generate-tweet', requestData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to generate tweet');
    }
  }

  /**
   * Generate a Twitter thread using AI
   * @param {Object} requestData - Thread generation request
   * @returns {Promise<Object>} Generated thread response
   */
  async generateThread(requestData) {
    try {
      const response = await apiClient.post('/content/generate-thread', requestData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to generate thread');
    }
  }

  /**
   * Generate a reply to a tweet using AI
   * @param {Object} requestData - Reply generation request
   * @returns {Promise<Object>} Generated reply response
   */
  async generateReply(requestData) {
    try {
      const response = await apiClient.post('/content/generate-reply', requestData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to generate reply');
    }
  }

  /**
   * Get content generation history
   * @param {number} skip - Number of items to skip
   * @param {number} limit - Number of items to return
   * @returns {Promise<Object>} Content history response
   */
  async getContentHistory(skip = 0, limit = 20) {
    try {
      const response = await apiClient.get('/content/history', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch content history');
    }
  }

  /**
   * Validate tweet content
   * @param {string} content - Tweet content to validate
   * @returns {Object} Validation result
   */
  validateTweetContent(content) {
    const errors = [];
    const maxLength = 280;
    
    if (!content || !content.trim()) {
      errors.push('Tweet content cannot be empty');
    }
    
    if (content.length > maxLength) {
      errors.push(`Tweet content exceeds ${maxLength} characters`);
    }
    
    // Check for excessive hashtags
    const hashtags = (content.match(/#\w+/g) || []).length;
    if (hashtags > 3) {
      errors.push('Tweet contains too many hashtags (max 3 recommended)');
    }
    
    // Check for excessive mentions
    const mentions = (content.match(/@\w+/g) || []).length;
    if (mentions > 5) {
      errors.push('Tweet contains too many mentions (max 5 recommended)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      characterCount: content.length,
      remainingCharacters: maxLength - content.length
    };
  }

  /**
   * Handle API errors consistently
   * @private
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Processed error
   */
  _handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 400 && data.detail) {
        return new Error(data.detail.message || data.detail);
      }
      
      if (status === 401) {
        return new Error('Authentication required. Please log in.');
      }
      
      if (status === 403) {
        return new Error('Access denied. You do not have permission for this action.');
      }
      
      if (status === 422 && data.detail) {
        // Validation errors
        const validationErrors = Array.isArray(data.detail) 
          ? data.detail.map(err => err.msg).join(', ')
          : data.detail;
        return new Error(`Validation error: ${validationErrors}`);
      }
      
      if (status >= 500) {
        return new Error('Server error. Please try again later.');
      }
      
      return new Error(data.detail || defaultMessage);
    }
    
    if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    }
    
    // Other errors
    return new Error(error.message || defaultMessage);
  }
}

// Export singleton instance
export const contentService = new ContentService();
