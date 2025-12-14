import { api } from '@shared/lib/api-client';
import type { ReportableEntityType, ReportReasonType } from '@modules/admin/types/admin.types';

/**
 * Create Report Request
 */
export interface CreateReportRequest {
  entityType: ReportableEntityType;
  entityId: number;
  reasonType: ReportReasonType;
  description?: string;
}

/**
 * Report Response
 */
export interface ReportResponse {
  id: number;
  entityType: ReportableEntityType;
  entityId: number;
  entityName: string;
  createdByUserId: number;
  createdByUsername: string;
  reasonType: ReportReasonType;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a report
 * POST /api/report
 */
export async function createReport(request: CreateReportRequest): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>('/report', request);
  return response.data;
}

/**
 * Map frontend ReportReasonType to backend ReportReasonType
 */
export function mapReportReason(reason: string): ReportReasonType {
  // Frontend uses: FAKE, SPAM, OFFENSIVE, OTHER
  // Backend uses: SPAM, FAKE, OFFENSIVE, HARASSMENT, MISINFORMATION, OTHER
  const mapping: Record<string, ReportReasonType> = {
    FAKE: 'FAKE',
    SPAM: 'SPAM',
    OFFENSIVE: 'OFFENSIVE',
    HARASSMENT: 'HARASSMENT',
    MISINFORMATION: 'MISINFORMATION',
    OTHER: 'OTHER',
  };
  return mapping[reason] || 'OTHER';
}
