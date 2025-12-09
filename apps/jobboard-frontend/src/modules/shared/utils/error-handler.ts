import { AxiosError, isAxiosError } from 'axios';

export interface ApiViolation {
  field?: string;
  message?: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  violations?: ApiViolation[];
  [key: string]: unknown;
}

export interface NormalizedApiError {
  status: number | null;
  code?: string;
  error?: string;
  message: string;
  path?: string;
  violations: ApiViolation[];
  friendlyMessage: string;
}

type FriendlyMap = Record<string, string>;

const friendlyErrorMap: FriendlyMap = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_UNAUTHORIZED: 'You need to sign in to continue',
  AUTHENTICATION_FAILED: 'Authentication failed',
  ACCESS_DENIED: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  RESOURCE_CONFLICT: 'This action conflicts with an existing resource',
  VALIDATION_FAILED: 'Some fields need your attention',
  JOB_POST_NOT_FOUND: 'Job post not found',
  JOB_APPLICATION_NOT_FOUND: 'Job application not found',
  APPLICATION_ALREADY_EXISTS: 'You already applied to this job',
  WORKPLACE_ALREADY_EXISTS: 'Workplace already exists',
  EMPLOYER_REQUEST_ALREADY_EXISTS: 'You already requested to join this workplace',
  MENTOR_PROFILE_ALREADY_EXISTS: 'You already created a mentor profile',
  MENTOR_PROFILE_NOT_FOUND: 'Mentor profile not found',
  REQUEST_ALREADY_PROCESSED: 'This request was already processed',
  REVIEW_ALREADY_EXISTS: 'You already posted a review',
  REVIEW_NOT_FOUND: 'Review not found',
  TOKEN_EXPIRED: 'Your session expired, please sign in again',
  INVALID_TOKEN: 'Your session is invalid, please sign in again',
};

const defaultFallback = 'Something went wrong. Please try again.';

export function normalizeApiError(
  error: unknown,
  fallbackMessage = defaultFallback
): NormalizedApiError {
  if (isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const data = axiosErr.response?.data ?? {};
    const code = data.code || data.error;
    const friendlyMessage = code && friendlyErrorMap[code]
      ? friendlyErrorMap[code]
      : data.message || fallbackMessage;

    return {
      status: data.status ?? axiosErr.response?.status ?? null,
      code,
      error: data.error,
      message: data.message || axiosErr.message || fallbackMessage,
      path: data.path,
      violations: Array.isArray(data.violations) ? data.violations : [],
      friendlyMessage,
    };
  }

  if (error instanceof Error) {
    return {
      status: null,
      code: undefined,
      error: undefined,
      message: error.message,
      path: undefined,
      violations: [],
      friendlyMessage: error.message || fallbackMessage,
    };
  }

  return {
    status: null,
    code: undefined,
    error: undefined,
    message: fallbackMessage,
    path: undefined,
    violations: [],
    friendlyMessage: fallbackMessage,
  };
}

export function getErrorMessage(error: unknown, defaultMessage = defaultFallback): string {
  return normalizeApiError(error, defaultMessage).friendlyMessage;
}

export function applyViolationsToForm(
  violations: ApiViolation[] | undefined,
  setFieldError?: (field: string, message: string) => void
): ApiViolation[] {
  if (!violations || violations.length === 0) {
    return [];
  }

  const unmapped: ApiViolation[] = [];

  violations.forEach((violation) => {
    if (violation.field && setFieldError) {
      setFieldError(violation.field, violation.message || defaultFallback);
    } else {
      unmapped.push(violation);
    }
  });

  return unmapped;
}
