import { ApiClient } from './apiClient';
import { STORAGE_KEYS } from './constants';
import { storage } from './storage';

// Types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  twitter_username?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

// Twitter OAuth 2.0 Types
export interface TwitterOAuth2InitRequest {
  redirect_uri?: string;
}

export interface TwitterOAuth2InitResponse {
  authorization_url: string;
  state: string;
  code_verifier: string;
}

export interface TwitterOAuth2CallbackRequest {
  code: string;
  state: string;
  code_verifier: string;
}

export interface TwitterOAuth2CallbackResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    twitter_username: string;
    twitter_user_id: string;
    full_name?: string;
    is_active: boolean;
  };
}

// Authentication Service
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this.validateLoginRequest(credentials);

    // Backend expects form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.apiClient.instance.post<LoginResponse>('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store the token
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token);

    return response.data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    this.validateRegisterRequest(userData);
    return this.apiClient.post<User>('/users/', userData as unknown as Record<string, unknown>);
  }

  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>('/auth/me');
  }

  async logout(): Promise<void> {
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  isAuthenticated(): boolean {
    return !!storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getToken(): string | null {
    return storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Twitter OAuth 2.0 Methods
  async initiateTwitterOAuth2(redirect_uri?: string): Promise<TwitterOAuth2InitResponse> {
    const request: TwitterOAuth2InitRequest = {
      redirect_uri: redirect_uri || 'http://localhost:3000/auth/twitter/oauth2-callback'
    };

    const response = await this.apiClient.instance.post<TwitterOAuth2InitResponse>(
      '/auth/oauth2/twitter/init',
      request
    );

    return response.data;
  }

  async handleTwitterOAuth2Callback(callbackData: TwitterOAuth2CallbackRequest): Promise<TwitterOAuth2CallbackResponse> {
    const response = await this.apiClient.instance.post<TwitterOAuth2CallbackResponse>(
      '/auth/oauth2/twitter/callback',
      callbackData
    );

    // Store the JWT token
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token);

    return response.data;
  }

  // Validation methods
  private validateLoginRequest(request: LoginRequest): void {
    if (!request.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!request.password?.trim()) {
      throw new Error('Password is required');
    }
  }

  private validateRegisterRequest(request: RegisterRequest): void {
    if (!request.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!request.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!request.password?.trim()) {
      throw new Error('Password is required');
    }
    if (request.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Please enter a valid email address');
    }
  }
}

// Export singleton instance
import { apiClient } from './apiClient';
export const authService = new AuthService(apiClient);
