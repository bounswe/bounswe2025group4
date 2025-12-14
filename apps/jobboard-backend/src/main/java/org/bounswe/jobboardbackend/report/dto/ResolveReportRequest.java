package org.bounswe.jobboardbackend.report.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;

@Data
public class ResolveReportRequest {

    @NotNull(message = "Status is required")
    private ReportStatus status;

    private String adminNote;

    private Boolean deleteContent;

    private Boolean banUser;

    private String banReason;
}
