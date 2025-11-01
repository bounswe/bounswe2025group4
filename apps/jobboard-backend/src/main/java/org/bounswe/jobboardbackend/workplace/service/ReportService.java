package org.bounswe.jobboardbackend.workplace.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.ReviewReportCreate;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceReportCreate;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReport;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.model.WorkplaceReport;
import org.bounswe.jobboardbackend.workplace.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.workplace.model.enums.WorkplaceReportReason;
import org.bounswe.jobboardbackend.workplace.model.enums.ReviewReportReason;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReportRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceReportRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final WorkplaceRepository workplaceRepository;
    private final ReviewRepository reviewRepository;
    private final WorkplaceReportRepository workplaceReportRepository;
    private final ReviewReportRepository reviewReportRepository;

    @Transactional
    public void reportWorkplace(Long workplaceId, WorkplaceReportCreate req, User reporter) {
        Workplace wp = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));
        WorkplaceReport report = WorkplaceReport.builder()
                .workplace(wp)
                .createdBy(reporter)
                .reasonType(WorkplaceReportReason.valueOf(req.getReasonType().toUpperCase()))
                .description(req.getDescription())
                .status(ReportStatus.PENDING)
                .build();
        workplaceReportRepository.save(report);
    }

    @Transactional
    public void reportReview(Long workplaceId, Long reviewId, ReviewReportCreate req, User reporter) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));
        if (!review.getWorkplace().getId().equals(workplaceId))
            throw new NoSuchElementException("Review does not belong to workplace");
        ReviewReport report = ReviewReport.builder()
                .review(review)
                .createdBy(reporter)
                .reasonType(ReviewReportReason.valueOf(req.getReasonType().toUpperCase()))
                .description(req.getDescription())
                .status(ReportStatus.PENDING)
                .build();
        reviewReportRepository.save(report);
    }
}
