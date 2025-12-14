import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { normalizeApiError, type NormalizedApiError } from '../utils/error-handler';

/**
 * Base API URL - must be set via VITE_API_URL environment variable
 * Appends /api if not already present
 * Defaults to http://localhost:8080/api if not set
 */
const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

console.log('[API Client] Base URL:', API_BASE_URL);

/**
 * Create axios instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (increased for slower connections)
});

/**
 * Request interceptor to attach JWT token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    // Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle 401 errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipAuthRedirect?: boolean;
    };

    // Attach normalized error for downstream hooks/UI
    (error as unknown as { normalizedError: NormalizedApiError }).normalizedError = normalizeApiError(error);

    // If 401 Unauthorized and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If skipAuthRedirect is set, just reject without redirecting
      if (originalRequest.skipAuthRedirect) {
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the session
        const { restoreSession, isAuthenticated, clearSession } =
          useAuthStore.getState();

        // Try to restore session
        restoreSession();

        // If still authenticated after restore, retry the request
        if (isAuthenticated) {
          const token = useAuthStore.getState().accessToken;
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }

        // If not authenticated, clear session and redirect to login
        clearSession();

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // If refresh fails, clear session
        useAuthStore.getState().clearSession();

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Silently handle 404 errors for mentorship mentor profile checks (expected when user doesn't have a profile)
    // Check if this is a mentorship mentor profile request that expects 404
    if (error.response?.status === 404 && originalRequest.url?.includes('/mentorship/mentor/')) {
      // Return a custom error that maintains the structure but won't trigger excessive logging
      const silentError = error;
      // Mark this error as expected/silent
      (silentError as unknown as { isExpected404: boolean }).isExpected404 = true;
      return Promise.reject(silentError);
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

/**
 * API client helper methods
 */
export const api = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  patch: apiClient.patch,
  delete: apiClient.delete,
};

export default apiClient;

