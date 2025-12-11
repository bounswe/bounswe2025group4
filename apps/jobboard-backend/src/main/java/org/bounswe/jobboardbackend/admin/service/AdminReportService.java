package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.admin.dto.BanUserRequest;
import org.bounswe.jobboardbackend.admin.service.AdminForumService;
import org.bounswe.jobboardbackend.admin.service.AdminJobApplicationService;
import org.bounswe.jobboardbackend.admin.service.AdminJobPostService;
import org.bounswe.jobboardbackend.admin.service.AdminMentorService;
import org.bounswe.jobboardbackend.admin.service.AdminProfileService;
import org.bounswe.jobboardbackend.admin.service.AdminUserService;
import org.bounswe.jobboardbackend.admin.service.AdminWorkplaceService;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.report.dto.ResolveReportRequest;
import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.repository.ReportRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final ReportRepository reportRepository;
    private final AdminWorkplaceService adminWorkplaceService;
    private final AdminForumService adminForumService;
    private final AdminJobPostService adminJobPostService;
    private final AdminJobApplicationService adminJobApplicationService;
    private final AdminProfileService adminProfileService;
    private final AdminMentorService adminMentorService;
    private final AdminUserService adminUserService;

    // Repositories for finding content creators
    private final WorkplaceRepository workplaceRepository;
    private final ReviewRepository reviewRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ProfileRepository profileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;

    @Transactional
    public void resolveReport(Long reportId, ResolveReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Report not found"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "Report has already been resolved");
        }

        // CRITICAL: Get creator ID BEFORE any deletion (content might get deleted,
        // making ID unretrievable)
        Long creatorId = null;
        if (Boolean.TRUE.equals(request.getBanUser())) {
            creatorId = getContentCreatorId(report.getEntityType(), report.getEntityId());
        }

        // Delete content BEFORE banning user to avoid double-deletion
        // (banUser deletes owned content, which would make deleteContent fail)
        if (Boolean.TRUE.equals(request.getDeleteContent())) {
            deleteReportedContent(report.getEntityType(), report.getEntityId());
        }

        // Ban user AFTER content deletion (owner ID was retrieved before deletion)
        if (Boolean.TRUE.equals(request.getBanUser()) && creatorId != null) {
            String banReason = request.getBanReason() != null
                    ? request.getBanReason()
                    : request.getAdminNote();
            adminUserService.banUser(creatorId, new BanUserRequest(banReason));
        }

        // Always save report for audit trail (don't delete even if content is deleted)
        report.setStatus(request.getStatus());
        report.setAdminNote(request.getAdminNote());
        reportRepository.save(report);
    }

    private void banContentCreator(Report report, String reason) {
        Long creatorId = getContentCreatorId(report.getEntityType(), report.getEntityId());

        if (creatorId == null) {
            // Skip banning if creator not found (e.g., Workplace has no owner)
            return;
        }

        BanUserRequest banRequest = new BanUserRequest();
        banRequest.setReason(reason != null ? reason : "Banned via report resolution");
        adminUserService.banUser(creatorId, banRequest);
    }

    private Long getContentCreatorId(ReportableEntityType entityType, Long entityId) {
        return switch (entityType) {
            case WORKPLACE -> employerWorkplaceRepository.findByWorkplace_IdAndRole(entityId, EmployerRole.OWNER)
                    .map(ew -> ew.getUser().getId())
                    .orElse(null);
            case REVIEW -> reviewRepository.findById(entityId)
                    .map(r -> r.getUser().getId())
                    .orElse(null);
            case FORUM_POST -> forumPostRepository.findById(entityId)
                    .map(p -> p.getAuthor().getId())
                    .orElse(null);
            case FORUM_COMMENT -> forumCommentRepository.findById(entityId)
                    .map(c -> c.getAuthor().getId())
                    .orElse(null);
            case JOB_POST -> jobPostRepository.findById(entityId)
                    .map(j -> j.getEmployer().getId())
                    .orElse(null);
            case JOB_APPLICATION -> jobApplicationRepository.findById(entityId)
                    .map(a -> a.getJobSeeker().getId())
                    .orElse(null);
            case REVIEW_REPLY -> reviewReplyRepository.findById(entityId)
                    .map(r -> r.getEmployerUser().getId())
                    .orElse(null);
            case PROFILE -> profileRepository.findById(entityId)
                    .map(p -> p.getUser().getId())
                    .orElse(null);
            case MENTOR -> mentorProfileRepository.findById(entityId)
                    .map(m -> m.getUser().getId())
                    .orElse(null);
            default -> throw new HandleException(ErrorCode.BAD_REQUEST,
                    "Unsupported entity type for creator lookup: " + entityType);
        };
    }

    private void deleteReportedContent(ReportableEntityType entityType, Long entityId) {
        switch (entityType) {
            case WORKPLACE -> adminWorkplaceService.deleteWorkplace(entityId, "Deleted via report resolution");
            case REVIEW -> adminWorkplaceService.deleteReview(entityId, "Deleted via report resolution");
            case FORUM_POST -> adminForumService.deletePost(entityId, "Deleted via report resolution");
            case FORUM_COMMENT -> adminForumService.deleteComment(entityId, "Deleted via report resolution");
            case JOB_POST -> adminJobPostService.deleteJobPost(entityId, "Deleted via report resolution");
            case JOB_APPLICATION -> adminJobApplicationService.deleteJobApplication(entityId, "Deleted via report resolution");
            case REVIEW_REPLY -> adminWorkplaceService.deleteReviewReply(entityId, "Deleted via report resolution");
            case PROFILE -> adminProfileService.deleteProfile(entityId, "Deleted via report resolution");
            case MENTOR -> adminMentorService.deleteMentor(entityId, "Deleted via report resolution");
            default -> throw new HandleException(ErrorCode.BAD_REQUEST, "Unsupported entity type for deletion: " + entityType);
        }  
    }
}
