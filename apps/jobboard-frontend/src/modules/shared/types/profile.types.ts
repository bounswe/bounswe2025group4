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
  userId: number;
  badgeType: string;
  name: string;
  description: string;
  criteria: string;
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
  skills: Skill[];
  interests: Interest[];
  badges?: Badge[];
}

import type { ActivityType, ActivityResponse } from './api.types';

/**
 * Activity display data for UI rendering
 */
export interface ActivityDisplay {
  id: number;
  type: ActivityType;
  icon: string; // Lucide icon name
  text: string; // Human-readable description
  date: string; // Relative time (e.g., "2 days ago")
  clickable: boolean;
  navigationUrl?: string;
  rawData: ActivityResponse; // Original API response
}

export interface Post {
  id: number;
  title: string;
  replies: number;
  likes: number;
  date: string;
}
