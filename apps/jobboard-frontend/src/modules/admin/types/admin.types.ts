export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IGNORED';

export type ReportableEntityType =
  | 'WORKPLACE'
  | 'REVIEW'
  | 'REVIEW_REPLY'
  | 'FORUM_POST'
  | 'FORUM_COMMENT'
  | 'JOB_POST'
  | 'JOB_APPLICATION'
  | 'PROFILE'
  | 'MENTOR';

export type ReportReasonType = 'SPAM' | 'FAKE' | 'OFFENSIVE' | 'HARASSMENT' | 'MISINFORMATION' | 'OTHER';

export interface ReportListItem {
  id: number;
  entityType: ReportableEntityType;
  entityId: number;
  entityName: string;
  createdByUserId: number;
  createdByUsername: string;
  reasonType: ReportReasonType;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetails extends ReportListItem {
  // Additional details if needed
}

export interface ResolveReportRequest {
  status: ReportStatus;
  adminNote?: string;
  deleteContent?: boolean;
  banUser?: boolean;
  banReason?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
