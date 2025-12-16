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
    _workplaceId: number,
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

export async function reportForumPost(postId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return createReport({
        entityType: 'FORUM_POST',
        entityId: postId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

export async function reportForumComment(commentId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return createReport({
        entityType: 'FORUM_COMMENT',
        entityId: commentId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

export async function reportJobPost(jobId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return createReport({
        entityType: 'JOB_POST',
        entityId: jobId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

export async function reportUserProfile(userId: number, message: string, reason: ReportReasonType = 'OTHER') {
    return createReport({
        entityType: 'PROFILE',
        entityId: userId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}

export async function reportWorkplaceReviewReply(
    _workplaceId: number,
    _reviewId: number,
    replyId: number,
    message: string,
    reason: ReportReasonType = 'OTHER',
) {
    return createReport({
        entityType: 'REVIEW_REPLY',
        entityId: replyId,
        reasonType: mapReportReason(reason),
        description: message,
    });
}