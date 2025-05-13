export type UserType = 'EMPLOYER' | 'JOB_SEEKER';
export type MentorshipRole = 'MENTOR' | 'MENTEE';

export interface User {
  id: number;
  username: string;
  email: string;
  userType: UserType;
  mentorshipStatus: MentorshipRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  bio: string;
  userType: UserType;
  mentorshipStatus: MentorshipRole;
}

export interface RegisterProfileInfoData {
  fullName: string;
  phone: string;
  location: string;
  occupation: string;
  bio: string;
}

export type RegisterData = RegisterCredentials & RegisterProfileInfoData;

export interface AuthResponse {
  token: string;
  username: string;
  userType: UserType;
  mentorshipStatus: MentorshipRole;
  id: number;
}

export interface AuthError {
  message: string;
  code?: string;
}
