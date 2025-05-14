// src/types/mentor.ts
import { User } from './auth';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MentorProfile {
  id: number;
  user: User;
  capacity: number;
  currentMenteeCount: number;
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface CreateMentorProfileRequest {
  capacity: number;
  isAvailable: boolean;
}

export interface MentorshipRequest {
  id: number;
  mentor: User;
  mentee: User;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string | null;
  channelId: string | null;
}

export interface CreateMentorshipRequestRequest {
  mentorId: number;
  message: string;
}

export interface UpdateMentorProfileRequest {
  capacity: number;
  isAvailable: boolean;
}
