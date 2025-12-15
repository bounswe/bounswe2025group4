package org.bounswe.jobboardbackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;

@Data
public class ResolveReportRequest {

    @Schema(description = "New status for the report (RESOLVED or REJECTED)", example = "RESOLVED")
    @NotNull(message = "Status is required")
    private ReportStatus status;

    @Schema(description = "Note explaining the resolution decision", example = "Review violates content policy.")
    private String adminNote;

    @Schema(description = "Whether to delete the reported content (e.g., delete review)", example = "true")
    private Boolean deleteContent;

    @Schema(description = "Whether to ban the user who created the content", example = "false")
    private Boolean banUser;

    @Schema(description = "Reason for banning the user (required if banUser is true)", example = "Repeated spam violations")
    private String banReason;
}
