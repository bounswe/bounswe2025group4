export type Profile = {
  userId: number;
  fullName: string;
  bio: string;
  phone?: string;
  location?: string;
  occupation?: string;
  profilePicture: string;
  skills: string[];
  interests: string[];
};

export type ProfileResponse = Profile & {
  id: number;
};

export type WorkExperience = {
  id: number;
  userId: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type Education = {
  id: number;
  userId: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
};

export type FullProfileResponse = {
  id: number;
  userId: number;
  profile: ProfileResponse;
  experience: WorkExperience[];
  education: Education[];
  badges: Badge[];
};
