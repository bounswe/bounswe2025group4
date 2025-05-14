import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '../types/api';

interface ApiErrorResponse {
  error: string;
  message: string;
  status: string;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        for (const key in params) {
          if (Object.prototype.hasOwnProperty.call(params, key)) {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((item) => searchParams.append(key, String(item)));
            } else if (
              value !== undefined &&
              value !== null &&
              String(value).length > 0
            ) {
              // Ensure empty strings are not added
              searchParams.set(key, String(value));
            }
          }
        }
        return searchParams.toString();
      },
    });

    const ignoredEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/reset-password',
      '/auth/forgot-password',
    ];

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        if (ignoredEndpoints.includes(config.url || '')) {
          return config;
        }
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        // For ignored endpoints (auth endpoints), return the error response data directly
        if (ignoredEndpoints.includes(error.config?.url || '')) {
          if (error.response?.data) {
            return Promise.reject(error.response.data);
          }
        }

        const originalRequest = error.config!;

        // Handle 401 and token refresh for non-auth endpoints
        if (
          error.response?.status === 401 &&
          !originalRequest.headers['X-Retry'] &&
          !ignoredEndpoints.includes(error.config?.url || '')
        ) {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              // No tokens found, redirect to login
              window.location.href = '/login';
              return Promise.reject(new Error('No auth tokens found'));
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }

        // For all other errors, return a consistent error response format
        if (error.response?.data) {
          return Promise.reject({
            data: null,
            error: error.response.data.error || 'Unknown Error',
            message:
              error.response.data.message || 'An unexpected error occurred',
            status: error.response.data.status || error.response.status,
          });
        }

        // For network errors or other issues where response is not available
        return Promise.reject({
          data: null,
          error: 'Network Error',
          message: 'Unable to connect to the server',
          status: 'NETWORK_ERROR',
        });
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
      const config: AxiosRequestConfig = {
        method,
        url,
        data,
        params,
        headers: {},
      };

      if (data instanceof FormData) {
        // Setting Content-Type to undefined/null for FormData
        // allows Axios to correctly set it to 'multipart/form-data' with the boundary,
        // overriding any default Content-Type like 'application/json'.
        config.headers = { ...config.headers, 'Content-Type': undefined };
      }

      const response = await this.client.request<T>(config);
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
