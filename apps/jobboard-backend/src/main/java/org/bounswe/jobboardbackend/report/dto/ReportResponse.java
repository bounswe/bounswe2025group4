package org.bounswe.jobboardbackend.report.dto;

import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;

import java.time.Instant;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private ReportableEntityType entityType;
    private Long entityId;
    private String entityName;
    private Long createdByUserId;
    private String createdByUsername;
    private ReportReasonType reasonType;
    private String description;
    private ReportStatus status;
    private String adminNote;
    private Instant createdAt;
    private Instant updatedAt;

    public static ReportResponse from(Report report, String entityName) {
        return ReportResponse.builder()
                .id(report.getId())
                .entityType(report.getEntityType())
                .entityId(report.getEntityId())
                .entityName(entityName)
                .createdByUserId(report.getCreatedBy().getId())
                .createdByUsername(report.getCreatedBy().getUsername())
                .reasonType(report.getReasonType())
                .description(report.getDescription())
                .status(report.getStatus())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
