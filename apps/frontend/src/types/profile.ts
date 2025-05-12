export interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string; // ISO format date
  endDate?: string; // ISO format date, can be null for current jobs
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Profile {
  fullName: string;
  phone: string;
  location: string;
  occupation: string;
  bio: string;
  profilePicture: string;
  skills: string[];
  interests: string[];
}

export interface ProfileResponse extends Profile {
  id: number;
  userId: number;
}

export interface FullProfile {
  profile: Profile;
  experience: Experience[];
  education: Education[];
  badges: Badge[];
}

export interface FullProfileResponse {
  id: number;
  profile: ProfileResponse;
  experience: Experience[];
  education: Education[];
  badges: Badge[];
  userId: number;
}
