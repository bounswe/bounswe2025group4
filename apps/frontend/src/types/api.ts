// Types for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  error?: Record<string, string[]>;
  message: string;
  status: number;
}
