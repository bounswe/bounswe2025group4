package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.admin.dto.BanUserRequest;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.model.User;
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

        private final ReviewRepository reviewRepository;
        private final ForumPostRepository forumPostRepository;
        private final ForumCommentRepository forumCommentRepository;
        private final JobPostRepository jobPostRepository;
        private final JobApplicationRepository jobApplicationRepository;
        private final ReviewReplyRepository reviewReplyRepository;
        private final ProfileRepository profileRepository;
        private final MentorProfileRepository mentorProfileRepository;
        private final EmployerWorkplaceRepository employerWorkplaceRepository;
        private final UserRepository userRepository;

        @Transactional
        public void resolveReport(Long reportId, ResolveReportRequest request, Long adminUserId) {
                User adminUser = userRepository.findById(adminUserId)
                                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND,
                                                "Admin user not found"));

                Report report = reportRepository.findById(reportId)
                                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Report not found"));

                if (report.getStatus() != ReportStatus.PENDING) {
                        throw new HandleException(ErrorCode.BAD_REQUEST, "Report has already been resolved");
                }

                Long creatorId = null;
                if (Boolean.TRUE.equals(request.getBanUser())) {
                        creatorId = getContentCreatorId(report.getEntityType(), report.getEntityId());
                }

                if (Boolean.TRUE.equals(request.getDeleteContent())) {
                        deleteReportedContent(report.getEntityType(), report.getEntityId(), adminUser);
                }

                if (Boolean.TRUE.equals(request.getBanUser()) && creatorId != null) {
                        String banReason = request.getBanReason() != null
                                        ? request.getBanReason()
                                        : request.getAdminNote();
                        adminUserService.banUser(creatorId, new BanUserRequest(banReason));
                }

                report.setStatus(request.getStatus());
                report.setAdminNote(request.getAdminNote());
                reportRepository.save(report);
        }

        protected Long getContentCreatorId(ReportableEntityType entityType, Long entityId) {
                return switch (entityType) {
                        case WORKPLACE ->
                                employerWorkplaceRepository.findByWorkplace_IdAndRole(entityId, EmployerRole.OWNER)
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

        protected void deleteReportedContent(ReportableEntityType entityType, Long entityId, User adminUser) {
                switch (entityType) {
                        case WORKPLACE ->
                                adminWorkplaceService.deleteWorkplace(entityId, "Deleted via report resolution");
                        case REVIEW -> adminWorkplaceService.deleteReview(entityId, "Deleted via report resolution");
                        case FORUM_POST ->
                                adminForumService.deletePost(entityId, adminUser, "Deleted via report resolution");
                        case FORUM_COMMENT ->
                                adminForumService.deleteComment(entityId, adminUser, "Deleted via report resolution");
                        case JOB_POST -> adminJobPostService.deleteJobPost(entityId, "Deleted via report resolution");
                        case JOB_APPLICATION -> adminJobApplicationService.deleteJobApplication(entityId,
                                        "Deleted via report resolution");
                        case REVIEW_REPLY ->
                                adminWorkplaceService.deleteReviewReply(entityId, "Deleted via report resolution");
                        case PROFILE -> adminProfileService.deleteProfile(entityId, "Deleted via report resolution");
                        case MENTOR -> adminMentorService.deleteMentor(entityId, "Deleted via report resolution");
                        default -> throw new HandleException(ErrorCode.BAD_REQUEST,
                                        "Unsupported entity type for deletion: " + entityType);
                }
        }
}