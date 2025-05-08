import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiResponse } from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_tokens');
        if (token) {
          const parsedToken = JSON.parse(token);
          if (parsedToken && parsedToken.accessToken) {
            config.headers.Authorization = `Bearer ${parsedToken.accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config!;

        // Handle 401 and token refresh
        if (
          error.response?.status === 401 &&
          !originalRequest.headers['X-Retry']
        ) {
          try {
            const authTokens = localStorage.getItem('auth_tokens');
            if (!authTokens) {
              // No tokens found, redirect to login
              window.location.href = '/login';
              return Promise.reject(new Error('No auth tokens found'));
            }

            const parsedTokens = JSON.parse(authTokens);
            const refreshToken = parsedTokens?.refreshToken;

            if (!refreshToken) {
              // No refresh token found, redirect to login
              localStorage.removeItem('auth_tokens');
              window.location.href = '/login';
              return Promise.reject(new Error('No refresh token'));
            }

            const { data } = await this.client.post<{
              accessToken: string;
              refreshToken?: string;
            }>('/auth/refresh', {
              refreshToken,
            });

            // Update tokens in localStorage
            const newAuthTokens = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || refreshToken, // Keep old refresh token if new one isn't provided
            };
            localStorage.setItem('auth_tokens', JSON.stringify(newAuthTokens));

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            originalRequest.headers['X-Retry'] = 'true';

            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('auth_tokens');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<T>({
        method,
        url,
        data,
        params,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw {
          message: error.response.data.message || 'An error occurred',
          status: error.response.status,
          errors: error.response.data.errors,
        } as ApiError;
      }
      throw error;
    }
  }

  // HTTP method wrappers
  public async get<T>(url: string, params?: Record<string, unknown>) {
    return this.request<T>('GET', url, undefined, params);
  }

  public async post<T>(url: string, data: unknown) {
    return this.request<T>('POST', url, data);
  }

  public async put<T>(url: string, data: unknown) {
    return this.request<T>('PUT', url, data);
  }

  public async patch<T>(url: string, data: unknown) {
    return this.request<T>('PATCH', url, data);
  }

  public async delete<T>(url: string) {
    return this.request<T>('DELETE', url);
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
