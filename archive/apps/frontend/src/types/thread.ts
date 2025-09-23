// TypeScript types for Thread features

import { User } from './auth';

export interface Thread {
  id: number;
  title: string;
  body: string;
  creatorId: number;
  tags: string[];
  reported: boolean;
}

export interface CreateThreadRequest {
  title: string;
  body: string;
  tags: string[];
}

export interface Comment {
  id: number;
  body: string;
  author: User;
  reported: boolean;
}

export interface CreateCommentRequest {
  body: string;
}
