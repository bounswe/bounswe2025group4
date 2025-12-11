package org.bounswe.jobboardbackend.report.repository;

import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // Find all reports by status
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    // Find reports by entity type and status
    Page<Report> findByEntityTypeAndStatus(ReportableEntityType entityType, ReportStatus status, Pageable pageable);

    // Find report by entity type and entity ID
    Optional<Report> findByEntityTypeAndEntityId(ReportableEntityType entityType, Long entityId);

    // Find report by entity type, entity ID, and creator (for duplicate check)
    Optional<Report> findByEntityTypeAndEntityIdAndCreatedBy(ReportableEntityType entityType, Long entityId,
            org.bounswe.jobboardbackend.auth.model.User createdBy);

    // Find all reports for a specific entity
    List<Report> findAllByEntityTypeAndEntityId(ReportableEntityType entityType, Long entityId);

    // Delete all reports for specific entities (for cascade delete)
    void deleteAllByEntityTypeAndEntityIdIn(ReportableEntityType entityType, List<Long> entityIds);

    // Count pending reports for an entity
    long countByEntityTypeAndEntityIdAndStatus(ReportableEntityType entityType, Long entityId, ReportStatus status);
}
