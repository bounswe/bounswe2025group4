package org.bounswe.jobboardbackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;

@Data
public class CreateReportRequest {

    @Schema(description = "Type of the entity being reported", example = "WORKPLACE")
    @NotNull(message = "Entity type is required")
    private ReportableEntityType entityType;

    @Schema(description = "ID of the entity being reported", example = "123")
    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @Schema(description = "Reason for the report", example = "SPAM")
    @NotNull(message = "Reason type is required")
    private ReportReasonType reasonType;

    @Schema(description = "Detailed description of the issue", example = "This review contains spam links.")
    private String description;
}
