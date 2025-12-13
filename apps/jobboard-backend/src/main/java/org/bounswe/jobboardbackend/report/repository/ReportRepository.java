package org.bounswe.jobboardbackend.report.repository;

import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.bounswe.jobboardbackend.auth.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByEntityTypeAndStatus(ReportableEntityType entityType, ReportStatus status, Pageable pageable);

    Optional<Report> findByEntityTypeAndEntityId(ReportableEntityType entityType, Long entityId);

    Optional<Report> findByEntityTypeAndEntityIdAndCreatedBy(ReportableEntityType entityType, Long entityId, User createdBy);

    List<Report> findAllByEntityTypeAndEntityId(ReportableEntityType entityType, Long entityId);

    void deleteAllByEntityTypeAndEntityIdIn(ReportableEntityType entityType, List<Long> entityIds);

    long countByEntityTypeAndEntityIdAndStatus(ReportableEntityType entityType, Long entityId, ReportStatus status);
}
