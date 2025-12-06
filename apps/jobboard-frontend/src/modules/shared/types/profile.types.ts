export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id: number;
  name: string;
  level?: string;
}

export interface Interest {
  id: number;
  name: string;
}

export interface Badge {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  criteria?: string;
  earnedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  imageUrl?: string;
  educations: Education[];
  experiences: Experience[];
  skills: Skill[];
  interests: Interest[];
  badges?: Badge[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  imageUrl?: string;
  educations: Education[];
  experiences: Experience[];
  badges?: Badge[];
}

export interface Activity {
  id: number;
  type: 'application' | 'forum' | 'comment' | 'like';
  text: string;
  date: string;
}

export interface Post {
  id: number;
  title: string;
  replies: number;
  likes: number;
  date: string;
}
