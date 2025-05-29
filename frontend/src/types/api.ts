/**
 * Shared API types for AutoReach frontend
 * Ensures type consistency across the application
 * Follows Interface Segregation Principle
 */

// Base API response structure
export interface BaseApiResponse {
  success: boolean;
  error?: string;
}

// Content generation types
export interface ContentGenerationRequest {
  topic: string;
  style?: string;
  user_context?: string;
  language?: string;
}

export interface ThreadGenerationRequest {
  topic: string;
  num_tweets?: number;
  style?: string;
  language?: string;
}

export interface ReplyGenerationRequest {
  original_tweet: string;
  reply_style?: string;
  user_context?: string;
  language?: string;
}

export interface ContentResponse extends BaseApiResponse {
  content?: string;
  prompt?: string;
  tokens_used?: number;
}

// User types
export interface User {
  id: number;
  username?: string;
  email?: string;
  full_name?: string;
  twitter_username?: string;
  is_active: boolean;
  language_pref?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface UserUpdateRequest {
  full_name?: string;
  twitter_username?: string;
  language_pref?: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends BaseApiResponse {
  access_token?: string;
  token_type?: string;
  user?: User;
}

// Content history types
export interface ContentHistoryItem {
  id: number;
  mode: string;
  prompt: string;
  generated_text: string;
  created_at: string;
}

export interface ContentHistoryResponse extends BaseApiResponse {
  history?: ContentHistoryItem[];
  total?: number;
}

// Scheduled posts types
export interface ScheduledPost {
  id: number;
  content: string;
  scheduled_time: string;
  status: 'pending' | 'posted' | 'failed';
  tweet_id?: string;
  created_at: string;
}

export interface ScheduledPostCreateRequest {
  content: string;
  scheduled_time: string;
}

export interface ScheduledPostResponse extends BaseApiResponse {
  post?: ScheduledPost;
}

export interface ScheduledPostsListResponse extends BaseApiResponse {
  posts?: ScheduledPost[];
  total?: number;
}

// Tweet types
export interface Tweet {
  id: number;
  content: string;
  tweet_id: string;
  posted_at: string;
  type: 'tweet' | 'reply';
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  quotes_count: number;
}

export interface TweetCreateRequest {
  content: string;
  scheduled_at?: string;
}

export interface TweetResponse extends BaseApiResponse {
  tweet?: Tweet;
}

// Analytics types
export interface AnalyticsData {
  followers_count: number;
  following_count: number;
  tweets_count: number;
  engagement_rate: number;
  growth_rate: number;
  period: string;
}

export interface AnalyticsResponse extends BaseApiResponse {
  analytics?: AnalyticsData;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Pagination types
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends BaseApiResponse {
  items?: T[];
  total?: number;
  skip?: number;
  limit?: number;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  api: 'ready' | 'not_ready';
  database?: 'connected' | 'disconnected';
  timestamp?: string;
}

// Export utility types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type ContentStyle = 'engaging' | 'professional' | 'casual' | 'educational' | 'humorous' | 'informative' | 'helpful';
export type ContentMode = 'new_tweet' | 'reply' | 'thread' | 'rewrite';
export type PostStatus = 'pending' | 'posted' | 'failed' | 'cancelled';
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

// Type guards for runtime type checking
export const isApiError = (obj: unknown): obj is ApiError => {
  return typeof obj === 'object' && obj !== null && 'message' in obj;
};

export const isBaseApiResponse = (obj: unknown): obj is BaseApiResponse => {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
};

export const isContentResponse = (obj: unknown): obj is ContentResponse => {
  return isBaseApiResponse(obj) && ('content' in obj || 'error' in obj);
};

export const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'is_active' in obj;
};
