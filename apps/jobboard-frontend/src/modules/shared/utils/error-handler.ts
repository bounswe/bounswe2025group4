import { AxiosError } from 'axios';

/**
 * Type for API error response data
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Type guard to check if error is an AxiosError with response data
 */
export function isAxiosErrorWithResponse(
  error: unknown
): error is AxiosError<ApiErrorResponse> {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  
  const axiosError = error as AxiosError;
  return (
    'response' in axiosError &&
    axiosError.response !== undefined &&
    'data' in axiosError.response
  );
}

/**
 * Extract error message from various error types
 * @param error - The error to extract message from
 * @param defaultMessage - Default message if no error message found
 * @returns The error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (isAxiosErrorWithResponse(error)) {
    return error.response?.data?.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}

