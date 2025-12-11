import { AxiosError, isAxiosError } from 'axios';
import i18n from '../lib/i18n';

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
  VALIDATION_FAILED: 'Some fields need your attention',
  MALFORMED_JSON: 'Request format is invalid',
  METHOD_NOT_ALLOWED: 'This action is not allowed',
  ACCESS_DENIED: 'You do not have permission to perform this action',
  AUTHENTICATION_FAILED: 'Authentication failed',
  RESOURCE_CONFLICT: 'This action conflicts with an existing resource',
  NOT_FOUND: 'The requested resource was not found',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_VERIFIED: 'Please verify your email before continuing',
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_UNAUTHORIZED: 'You need to sign in to continue',
  USER_ALREADY_EXISTS: 'User already exists',
  USERNAME_ALREADY_USED: 'Username is already in use',
  EMAIL_ALREADY_USED: 'Email is already in use',
  ROLE_INVALID: 'Your account does not have the required role',
  EMPLOYER_ALREADY_ASSIGNED: 'Employer is already assigned to this workplace',
  EMPLOYER_REQUEST_ALREADY_EXISTS: 'You already requested to join this workplace',
  EMPLOYER_REQUEST_NOT_FOUND: 'Employer request not found',
  EMPLOYER_REQUEST_ALREADY_RESOLVED: 'This employer request was already processed',
  EMPLOYER_REQUEST_INVALID_ACTION: 'This action is not valid for the current employer request',
  EMPLOYER_REQUEST_NO_APPLICANT: 'No applicant is associated with this request',
  EMPLOYER_LINK_NOT_FOUND: 'Employer link not found',
  WORKPLACE_OWNER_MINIMUM_REQUIRED: 'At least one workplace owner is required',
  CURRENT_PASSWORD_INVALID: 'Current password is incorrect',
  PASSWORD_SAME_AS_OLD: 'New password must be different from the old one',
  PROFILE_NOT_FOUND: 'Profile not found',
  PROFILE_ALREADY_EXISTS: 'Profile already exists',
  WORKPLACE_NOT_FOUND: 'Workplace not found',
  WORKPLACE_ALREADY_EXISTS: 'Workplace already exists',
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_ALREADY_EXISTS: 'You already posted a review',
  REPLY_ALREADY_EXISTS: 'You already replied to this review',
  REPLY_NOT_FOUND: 'Reply not found',
  WORKPLACE_UNAUTHORIZED: 'You are not authorized for this workplace',
  VALIDATION_ERROR: 'Some fields failed validation',
  EDUCATION_NOT_FOUND: 'Education entry not found',
  EXPERIENCE_NOT_FOUND: 'Experience entry not found',
  SKILL_NOT_FOUND: 'Skill not found',
  INTEREST_NOT_FOUND: 'Interest not found',
  IMAGE_FILE_REQUIRED: 'Please upload an image file',
  IMAGE_CONTENT_TYPE_INVALID: 'Invalid image file type',
  IMAGE_UPLOAD_FAILED: 'Image upload failed. Please try again',
  INVALID_TOKEN: 'Your session is invalid, please sign in again',
  TOKEN_EXPIRED: 'Your session expired, please sign in again',
  BAD_REQUEST: 'Request is invalid. Please check your input',
  JOB_APPLICATION_NOT_FOUND: 'Job application not found',
  APPLICATION_ALREADY_EXISTS: 'You already applied to this job',
  MISSING_FILTER_PARAMETER: 'A required filter parameter is missing',
  JOB_POST_NOT_FOUND: 'Job post not found',
  JOB_POST_FORBIDDEN: 'You are not allowed to manage this job post',
  JOB_POST_CORRUPT: 'Job post data is corrupted. Please contact support',
  CHAT_NOT_LINKED_TO_REVIEW: 'Chat is not linked to the selected review',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  MENTORSHIP_NOT_ACTIVE: 'Mentorship is not active',
  RESUME_REVIEW_NOT_FOUND: 'Resume review not found',
  REQUEST_NOT_FOUND: 'Request not found',
  REVIEW_NOT_COMPLETED: 'Review is not completed yet',
  UNAUTHORIZED_REVIEW_ACCESS: 'You are not allowed to access this review',
  REQUEST_ALREADY_PROCESSED: 'This request was already processed',
  MENTOR_UNAVAILABLE: 'Mentor is not available',
  ACTIVE_MENTORSHIP_EXIST: 'An active mentorship already exists',
  MENTEE_CAPACITY_CONFLICT: 'Mentor capacity is full',
  MENTOR_PROFILE_NOT_FOUND: 'Mentor profile not found',
  MENTOR_PROFILE_ALREADY_EXISTS: 'You already created a mentor profile',
  RESUME_FILE_REQUIRED: 'Resume file is required',
  RESUME_FILE_CONTENT_TYPE_INVALID: 'Invalid resume file type',
  RESUME_FILE_UPLOAD_FAILED: 'Resume upload failed. Please try again',
  RESUME_FILE_NOT_FOUND: 'Resume file not found',
};

const defaultFallback = 'Something went wrong. Please try again.';
const defaultFallbackKey = 'errors.DEFAULT';

const errorTranslationMap: Record<string, string> = Object.keys(friendlyErrorMap).reduce(
  (acc, code) => {
    acc[code] = `errors.${code}`;
    return acc;
  },
  {} as Record<string, string>
);

function getDefaultFriendlyMessage(): string {
  const translated = i18n.t(defaultFallbackKey);
  return translated && translated !== defaultFallbackKey ? translated : defaultFallback;
}

function translateErrorCode(code?: string): string | undefined {
  if (!code) {
    return undefined;
  }

  const translationKey = errorTranslationMap[code];
  if (!translationKey) {
    return undefined;
  }

  const translated = i18n.t(translationKey);
  return translated && translated !== translationKey ? translated : undefined;
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage?: string
): NormalizedApiError {
  const resolvedFallback = fallbackMessage ?? getDefaultFriendlyMessage();

  if (isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const data = axiosErr.response?.data ?? {};
    const code = data.code || data.error;
    const friendlyMessage =
      translateErrorCode(code) ??
      (code ? friendlyErrorMap[code] : undefined) ??
      data.message ??
      resolvedFallback;

    return {
      status: data.status ?? axiosErr.response?.status ?? null,
      code,
      error: data.error,
      message: data.message || axiosErr.message || resolvedFallback,
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
      message: error.message || resolvedFallback,
      path: undefined,
      violations: [],
      friendlyMessage: error.message || resolvedFallback,
    };
  }

  return {
    status: null,
    code: undefined,
    error: undefined,
    message: resolvedFallback,
    path: undefined,
    violations: [],
    friendlyMessage: resolvedFallback,
  };
}

export function getErrorMessage(error: unknown, defaultMessage?: string): string {
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
