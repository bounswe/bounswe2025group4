package org.bounswe.jobboardbackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "Unique identifier of the report", example = "1")
    private Long id;

    @Schema(description = "Type of the entity reported", example = "WORKPLACE")
    private ReportableEntityType entityType;

    @Schema(description = "ID of the entity reported", example = "101")
    private Long entityId;

    @Schema(description = "Name or summary of the entity reported", example = "Google Office")
    private String entityName;

    @Schema(description = "ID of the user who created the report", example = "50")
    private Long createdByUserId;

    @Schema(description = "Username of the user who created the report", example = "john_doe")
    private String createdByUsername;

    @Schema(description = "Reason for the report", example = "SPAM")
    private ReportReasonType reasonType;

    @Schema(description = "Detailed description of the issue", example = "This is a spam review.")
    private String description;

    @Schema(description = "Current status of the report", example = "PENDING")
    private ReportStatus status;

    @Schema(description = "Note added by admin during resolution", example = "Resolved by removing the review.")
    private String adminNote;

    @Schema(description = "Timestamp when the report was created")
    private Instant createdAt;

    @Schema(description = "Timestamp when the report was last updated")
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
