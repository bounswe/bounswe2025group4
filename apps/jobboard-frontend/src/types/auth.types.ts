/**
 * User role types matching backend enum
 */
export type UserRole = 'ROLE_EMPLOYER' | 'ROLE_JOBSEEKER' | 'ROLE_ADMIN';

/**
 * User information extracted from JWT or API response
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  sub: string; // username
  userId: number;
  email: string;
  role: UserRole;
  iat: number; // issued at
  exp: number; // expiration
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Generic API message response
 */
export interface MessageResponse {
  message: string;
}

/**
 * Auth state managed by Zustand store
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

/**
 * Auth actions for Zustand store
 */
export interface AuthActions {
  login: (response: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  restoreSession: () => void;
  clearSession: () => void;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

