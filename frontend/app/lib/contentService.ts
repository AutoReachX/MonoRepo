import { ApiClient } from './apiClient';
import { ContentValidation, ValidationUtils } from './validation';
import { ContentErrorHandler } from './errorHandling';
import { TWITTER_CONSTANTS } from './constants';
import {
  ContentGenerationRequest,
  ThreadGenerationRequest,
  ReplyGenerationRequest,
  ContentResponse,
  ContentHistoryResponse,
} from '../types/api';

// Legacy types for backward compatibility
export interface ContentRequest {
  topic: string;
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
  includeEmojis: boolean;
}

export interface GeneratedContent {
  id: string;
  content: string;
  hashtags: string[];
  createdAt: string;
  status: 'draft' | 'scheduled' | 'published';
}

export interface ScheduleRequest {
  contentId: string;
  scheduledTime: string;
}

export interface ContentFilters {
  status?: 'draft' | 'scheduled' | 'published';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Content Service following Single Responsibility Principle
export class ContentService {
  constructor(private apiClient: ApiClient) {}

  // New backend API methods with error handling
  async generateTweet(request: ContentGenerationRequest): Promise<ContentResponse> {
    try {
      this.validateTweetRequest(request);
      return await this.apiClient.post<ContentResponse>('/content/generate-tweet', request as unknown as Record<string, unknown>);
    } catch (error) {
      throw ContentErrorHandler.handleGenerationError(error);
    }
  }

  async generateThread(request: ThreadGenerationRequest): Promise<ContentResponse> {
    try {
      this.validateThreadRequest(request);
      return await this.apiClient.post<ContentResponse>('/content/generate-thread', request as unknown as Record<string, unknown>);
    } catch (error) {
      throw ContentErrorHandler.handleGenerationError(error);
    }
  }

  async generateReply(request: ReplyGenerationRequest): Promise<ContentResponse> {
    try {
      this.validateReplyRequest(request);
      return await this.apiClient.post<ContentResponse>('/content/generate-reply', request as unknown as Record<string, unknown>);
    } catch (error) {
      throw ContentErrorHandler.handleGenerationError(error);
    }
  }

  async getContentHistory(skip: number = 0, limit: number = 50): Promise<ContentHistoryResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    return this.apiClient.get<ContentHistoryResponse>(`/content/history?${params}`);
  }

  // Legacy methods for backward compatibility
  async generateContent(request: ContentRequest): Promise<GeneratedContent> {
    this.validateContentRequest(request);
    // Convert legacy request to new format
    const newRequest: ContentGenerationRequest = {
      topic: request.topic,
      style: request.tone,
      user_context: `Length: ${request.length}, Include hashtags: ${request.includeHashtags}, Include emojis: ${request.includeEmojis}`
    };

    const response = await this.generateTweet(newRequest);

    // Convert response to legacy format
    return {
      id: Date.now().toString(),
      content: response.content || '',
      hashtags: [],
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
  }

  // TODO: Implement these methods when backend endpoints are ready
  // For now, these are removed to eliminate dead code
  //
  // Future implementations:
  // - getContent(): Use history endpoint with filtering
  // - getContentById(): Implement backend endpoint for single content retrieval
  // - updateContent(): Implement backend endpoint for content updates
  // - scheduleContent(): Use scheduled posts API
  // - deleteContent(): Implement backend endpoint for content deletion
  // - publishContent(): Use Twitter posting API

  // Private validation methods using centralized validation utilities
  private validateTweetRequest(request: ContentGenerationRequest): void {
    const topicValidation = ContentValidation.validateTopic(request.topic);
    if (!topicValidation.isValid) {
      throw new Error(topicValidation.error);
    }
  }

  private validateThreadRequest(request: ThreadGenerationRequest): void {
    const topicValidation = ContentValidation.validateTopic(request.topic);
    if (!topicValidation.isValid) {
      throw new Error(topicValidation.error);
    }

    if (request.num_tweets) {
      if (request.num_tweets < 2) {
        throw new Error('Thread must contain at least 2 tweets');
      }
      if (request.num_tweets > TWITTER_CONSTANTS.MAX_THREAD_TWEETS) {
        throw new Error(`Thread cannot exceed ${TWITTER_CONSTANTS.MAX_THREAD_TWEETS} tweets`);
      }
    }
  }

  private validateReplyRequest(request: ReplyGenerationRequest): void {
    const requiredValidation = ValidationUtils.validateRequired(request.original_tweet, 'Original tweet');
    if (!requiredValidation.isValid) {
      throw new Error(requiredValidation.error);
    }

    const lengthValidation = ValidationUtils.validateLength(
      request.original_tweet,
      1,
      TWITTER_CONSTANTS.MAX_TWEET_LENGTH
    );
    if (!lengthValidation.isValid) {
      throw new Error(lengthValidation.error);
    }
  }

  private validateContentRequest(request: ContentRequest): void {
    const topicValidation = ContentValidation.validateTopic(request.topic);
    if (!topicValidation.isValid) {
      throw new Error(topicValidation.error);
    }
  }

  // Removed unused validation methods to eliminate dead code

  private buildQueryParams(filters?: ContentFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
}

// Export singleton instance
import { apiClient } from './apiClient';
export const contentService = new ContentService(apiClient);
