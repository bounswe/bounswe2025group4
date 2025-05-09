export type UserType = 'EMPLOYER' | 'JOB_SEEKER';
export type MentorshipRole = 'MENTOR' | 'MENTEE';

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  userType: UserType;
  mentorType: MentorshipRole;
}
