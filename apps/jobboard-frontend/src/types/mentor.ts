export interface Mentor {
  id: string;
  name: string;
  title: string;
  bio: string;
  rating: number;
  reviews: number;
  mentees: number;
  capacity: number;
  tags: string[];
  experience: string;
  education: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  hourlyRate?: number;
  availability: string;
  languages: string[];
  specialties: string[];
  achievements: string[];
  profileImage?: string;
}

export interface MentorshipReview {
  id: string;
  menteeName: string;
  menteeAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  mentorshipDuration: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  goals: string[];
  expectedDuration: string;
}
