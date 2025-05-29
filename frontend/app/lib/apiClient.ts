import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants';
import { storage, IStorage } from './storage';

// API Client following Single Responsibility and Dependency Inversion principles
export class ApiClient {
  private client: AxiosInstance;
  private storage: IStorage;

  constructor(storageAdapter: IStorage = storage) {
    this.storage = storageAdapter;
    this.client = this.createClient();
    this.setupInterceptors();
  }

  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleUnauthorized(): void {
    this.storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private handleError(error: AxiosError): Error {
    if (!error.response) {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    switch (error.response.status) {
      case 401:
        return new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 400:
        return new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      default:
        const responseData = error.response.data as { message?: string } | undefined;
        return new Error(responseData?.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  // Public API methods
  get instance(): AxiosInstance {
    return this.client;
  }

  async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for backward compatibility
export default apiClient;
