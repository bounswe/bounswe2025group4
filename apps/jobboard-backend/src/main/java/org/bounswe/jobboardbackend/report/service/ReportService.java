package org.bounswe.jobboardbackend.report.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.report.dto.CreateReportRequest;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.repository.ReportRepository;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final WorkplaceRepository workplaceRepository;
    private final ReviewRepository reviewRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ProfileRepository profileRepository;
    private final MentorProfileRepository mentorProfileRepository;

    @Transactional
    public ReportResponse createReport(CreateReportRequest request, User reporter) {
        validateEntityExists(request.getEntityType(), request.getEntityId());

        reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(
                request.getEntityType(),
                request.getEntityId(),
                reporter).ifPresent(existing -> {
                    throw new HandleException(ErrorCode.BAD_REQUEST, "You have already reported this content");
                });

        Report report = Report.builder()
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .reasonType(request.getReasonType())
                .description(request.getDescription())
                .createdBy(reporter)
                .status(ReportStatus.PENDING)
                .build();

        Report saved = reportRepository.save(report);

        String entityName = getEntityName(saved.getEntityType(), saved.getEntityId());
        return ReportResponse.from(saved, entityName);
    }

    public Page<ReportResponse> listReports(ReportStatus status, ReportableEntityType entityType, Pageable pageable) {
        Page<Report> reports;

        if (entityType != null && status != null) {
            reports = reportRepository.findByEntityTypeAndStatus(entityType, status, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }

        return reports.map(report -> {
            String entityName = getEntityName(report.getEntityType(), report.getEntityId());
            return ReportResponse.from(report, entityName);
        });
    }

    public ReportResponse getReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Report not found"));

        String entityName = getEntityName(report.getEntityType(), report.getEntityId());
        return ReportResponse.from(report, entityName);
    }

    private String getEntityName(ReportableEntityType entityType, Long entityId) {
        return switch (entityType) {
            case WORKPLACE -> workplaceRepository.findById(entityId)
                    .map(Workplace::getCompanyName)
                    .orElse("Unknown Workplace");
            case REVIEW -> reviewRepository.findById(entityId)
                    .map(r -> "Review on " + r.getWorkplace().getCompanyName())
                    .orElse("Unknown Review");
            case FORUM_POST -> forumPostRepository.findById(entityId)
                    .map(ForumPost::getTitle)
                    .orElse("Unknown Forum Post");
            case FORUM_COMMENT -> forumCommentRepository.findById(entityId)
                    .map(c -> "Comment on: " + c.getPost().getTitle())
                    .orElse("Unknown Comment");
            case JOB_POST -> jobPostRepository.findById(entityId)
                    .map(JobPost::getTitle)
                    .orElse("Unknown Job Post");
            case JOB_APPLICATION -> "Job Application #" + entityId;
            case REVIEW_REPLY -> "Review Reply #" + entityId;
            case PROFILE -> profileRepository.findById(entityId)
                    .map(p -> "Profile: " + p.getUser().getUsername())
                    .orElse("Unknown Profile");
            case MENTOR -> mentorProfileRepository.findById(entityId)
                    .map(m -> "Mentor: " + m.getUser().getUsername())
                    .orElse("Unknown Mentor");
        };
    }

    private void validateEntityExists(ReportableEntityType entityType, Long entityId) {
        boolean exists = switch (entityType) {
            case WORKPLACE -> workplaceRepository.existsById(entityId);
            case REVIEW -> reviewRepository.existsById(entityId);
            case FORUM_POST -> forumPostRepository.existsById(entityId);
            case FORUM_COMMENT -> forumCommentRepository.existsById(entityId);
            case JOB_POST -> jobPostRepository.existsById(entityId);
            case JOB_APPLICATION -> jobApplicationRepository.existsById(entityId);
            case REVIEW_REPLY -> reviewReplyRepository.existsById(entityId);
            case PROFILE -> profileRepository.existsById(entityId);
            case MENTOR -> mentorProfileRepository.existsById(entityId);
        };

        if (!exists) {
            throw new HandleException(ErrorCode.NOT_FOUND,
                    "The " + entityType.name().toLowerCase().replace('_', ' ')
                            + " you are trying to report does not exist");
        }
    }
}
