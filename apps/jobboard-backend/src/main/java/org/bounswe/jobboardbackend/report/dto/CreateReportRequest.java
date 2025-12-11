package org.bounswe.jobboardbackend.report.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;

@Data
public class CreateReportRequest {

    @NotNull(message = "Entity type is required")
    private ReportableEntityType entityType;

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @NotNull(message = "Reason type is required")
    private ReportReasonType reasonType;

    private String description;
}
