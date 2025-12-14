import { apiClient } from '@shared/lib/api-client';
import type { ReportReasonType } from '@/modules/shared/components/report/ReportModal';

// Entity types matching backend enum
type ReportableEntityType = 
    | 'WORKPLACE' 
    | 'REVIEW' 
    | 'REVIEW_REPLY' 
    | 'FORUM_POST' 
    | 'FORUM_COMMENT' 
    | 'JOB_POST' 
    | 'JOB_APPLICATION' 
    | 'PROFILE' 
    | 'MENTOR';

// Unified report function
async function submitReport(
    entityType: ReportableEntityType,
    entityId: number,
    description: string,
    reasonType: ReportReasonType = 'OTHER'
) {
    return apiClient.post('/report', {
        entityType,
        entityId,
        reasonType,
        description,
    });
}

export async function reportWorkplace(workplaceId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return submitReport('WORKPLACE', workplaceId, message, reason);
}

export async function reportWorkplaceReview(
    _workplaceId: number,
    reviewId: number,
    message: string,
    reason: ReportReasonType = 'OTHER',
) {
    return submitReport('REVIEW', reviewId, message, reason);
}

export async function reportForumPost(postId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return submitReport('FORUM_POST', postId, message, reason);
}

export async function reportForumComment(commentId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return submitReport('FORUM_COMMENT', commentId, message, reason);
}

export async function reportJobPost(jobId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return submitReport('JOB_POST', jobId, message, reason);
}

export async function reportUserProfile(userId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return submitReport('PROFILE', userId, message, reason);
}
