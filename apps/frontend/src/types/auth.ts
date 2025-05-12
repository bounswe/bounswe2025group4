import { MentorshipRole, UserType } from './user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  bio: string;
  userType: UserType;
  mentorshipRole: MentorshipRole;
}

export interface AuthResponse {
  token: string;
  username: string;
  userType: UserType;
  mentorType: MentorshipRole;
  id: number;
}

export interface AuthError {
  message: string;
  code?: string;
}
