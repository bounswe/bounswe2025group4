// All types that must be matched with backend
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  bio: string;
  userType: 'EMPLOYER' | 'JOB_SEEKER' | 'MENTOR';
}
export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  userType: 'EMPLOYER' | 'JOB_SEEKER' | 'MENTOR';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  token: AuthTokens;
  username: string;
  userType: 'EMPLOYER' | 'JOB_SEEKER' | 'MENTOR';
  id: number;
}

export interface AuthError {
  message: string;
  code?: string;
}
