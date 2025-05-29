import { apiClient } from './apiClient';

export interface TwitterAuthResponse {
  authorization_url: string;
  oauth_token: string;
  oauth_token_secret: string;
}

export interface TwitterStatus {
  connected: boolean;
  twitter_username?: string;
  twitter_user_id?: string;
}

export interface TwitterCallbackData {
  oauth_token: string;
  oauth_verifier: string;
  oauth_token_secret: string;
  [key: string]: unknown;
}

class TwitterAuthService {
  /**
   * Initiate Twitter OAuth flow
   * Returns authorization URL and OAuth tokens
   */
  async initiateTwitterAuth(): Promise<TwitterAuthResponse> {
    try {
      const response = await apiClient.get<TwitterAuthResponse>('/auth/twitter/login');
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to initiate Twitter auth: ${errorMessage}`);
    }
  }

  /**
   * Handle Twitter OAuth callback
   * Exchange OAuth verifier for access tokens
   */
  async handleTwitterCallback(callbackData: TwitterCallbackData): Promise<{
    message: string;
    twitter_username?: string;
    twitter_user_id?: string;
  }> {
    try {
      const response = await apiClient.post<{
        message: string;
        twitter_username?: string;
        twitter_user_id?: string;
      }>('/auth/twitter/callback', callbackData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle Twitter callback: ${errorMessage}`);
    }
  }

  /**
   * Get Twitter connection status
   */
  async getTwitterStatus(): Promise<TwitterStatus> {
    try {
      const response = await apiClient.get<TwitterStatus>('/auth/twitter/status');
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to get Twitter status: ${errorMessage}`);
    }
  }

  /**
   * Disconnect Twitter account
   */
  async disconnectTwitter(): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>('/auth/twitter/disconnect');
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to disconnect Twitter: ${errorMessage}`);
    }
  }

  /**
   * Start Twitter OAuth flow
   * Opens Twitter authorization in a new window
   */
  async startTwitterOAuth(): Promise<{
    oauth_token: string;
    oauth_token_secret: string;
  }> {
    const authData = await this.initiateTwitterAuth();

    // Store oauth_token_secret for later use
    sessionStorage.setItem('twitter_oauth_token_secret', authData.oauth_token_secret);

    // Open Twitter authorization in a new window
    const authWindow = window.open(
      authData.authorization_url,
      'twitter_auth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );

    return new Promise((resolve, reject) => {
      // Listen for the callback
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Twitter authorization was cancelled'));
        }
      }, 1000);

      // Listen for messages from the popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          authWindow?.close();
          resolve({
            oauth_token: authData.oauth_token,
            oauth_token_secret: authData.oauth_token_secret
          });
        } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          authWindow?.close();
          reject(new Error(event.data.error || 'Twitter authorization failed'));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  /**
   * Complete Twitter OAuth flow with verifier
   */
  async completeTwitterOAuth(oauth_verifier: string): Promise<{
    message: string;
    twitter_username?: string;
    twitter_user_id?: string;
  }> {
    const oauth_token_secret = sessionStorage.getItem('twitter_oauth_token_secret');
    if (!oauth_token_secret) {
      throw new Error('OAuth token secret not found. Please restart the authentication process.');
    }

    // Extract oauth_token from URL if needed
    const urlParams = new URLSearchParams(window.location.search);
    const oauth_token = urlParams.get('oauth_token');

    if (!oauth_token) {
      throw new Error('OAuth token not found in callback URL');
    }

    const result = await this.handleTwitterCallback({
      oauth_token,
      oauth_verifier,
      oauth_token_secret
    });

    // Clean up stored token
    sessionStorage.removeItem('twitter_oauth_token_secret');

    return result;
  }
}

export const twitterAuthService = new TwitterAuthService();
export default twitterAuthService;
