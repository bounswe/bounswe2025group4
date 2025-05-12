export type UserType = 'EMPLOYER' | 'JOB_SEEKER';
export type MentorshipRole = 'MENTOR' | 'MENTEE';

export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  userType: UserType;
  mentorType: MentorshipRole;
}

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
