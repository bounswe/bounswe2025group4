package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.ReviewReport;
import org.bounswe.jobboardbackend.workplace.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {
    Page<ReviewReport> findByReview_Id(Long reviewId, Pageable pageable);

    Page<ReviewReport> findByStatus(ReportStatus status, Pageable pageable);
}