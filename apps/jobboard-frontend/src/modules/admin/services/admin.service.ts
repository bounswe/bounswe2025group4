import { api } from '@shared/lib/api-client';
import type {
  ReportListItem,
  ReportDetails,
  ResolveReportRequest,
  ReportStatus,
  ReportableEntityType,
  Page,
} from '../types/admin.types';

/**
 * Get all reports with filters
 * GET /api/admin/report
 */
export async function getReports(
  status?: ReportStatus,
  entityType?: ReportableEntityType,
  page: number = 0,
  size: number = 20,
): Promise<Page<ReportListItem>> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (entityType) params.append('entityType', entityType);
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await api.get<Page<ReportListItem>>(`/admin/report?${params.toString()}`);
  return response.data;
}

/**
 * Get report details by ID
 * GET /api/admin/report/{id}
 */
export async function getReportDetails(id: number): Promise<ReportDetails> {
  const response = await api.get<ReportDetails>(`/admin/report/${id}`);
  return response.data;
}

/**
 * Resolve a report
 * POST /api/admin/report/{id}/resolve
 */
export async function resolveReport(id: number, request: ResolveReportRequest): Promise<void> {
  await api.post(`/admin/report/${id}/resolve`, request);
}
