import { createReport, mapReportReason } from '@shared/services/report.service';
import type { ReportReasonType } from '@/modules/shared/components/report/ReportModal';

export async function reportWorkplace(workplaceId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return createReport({
        entityType: 'WORKPLACE',
        entityId: workplaceId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

export async function reportWorkplaceReview(
    workplaceId: number,
    reviewId: number,
    message: string,
    reason: ReportReasonType = 'OTHER',
) {
    return createReport({
        entityType: 'REVIEW',
        entityId: reviewId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

// Stubs for future integration
export async function reportForumComment(commentId: number, message: string) {
    // POST /api/forum/comments/{commentId}/report
    console.log('Reporting forum comment', commentId, message);
    return Promise.resolve();
}

export async function reportJobPost(jobId: number, message: string) {
    // POST /api/jobs/{jobId}/report
    console.log('Reporting job post', jobId, message);
    return Promise.resolve();
}

export async function reportUserProfile(userId: number, message: string) {
    // POST /api/profile/{userId}/report
    console.log('Reporting user profile', userId, message);
    return Promise.resolve();
}
