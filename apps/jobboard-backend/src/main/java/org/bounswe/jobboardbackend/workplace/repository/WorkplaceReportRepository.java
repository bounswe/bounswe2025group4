package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.WorkplaceReport;
import org.bounswe.jobboardbackend.workplace.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkplaceReportRepository extends JpaRepository<WorkplaceReport, Long> {
    Page<WorkplaceReport> findByWorkplace_Id(Long workplaceId, Pageable pageable);

    Page<WorkplaceReport> findByStatus(ReportStatus status, Pageable pageable);
}