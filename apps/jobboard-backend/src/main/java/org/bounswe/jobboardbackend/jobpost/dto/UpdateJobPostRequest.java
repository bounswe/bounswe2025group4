package org.bounswe.jobboardbackend.jobpost.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for updating an existing job post")
public class UpdateJobPostRequest {

    @Size(max = 100)
    @Schema(description = "New title of the job post (optional)", example = "Lead Backend Engineer")
    private String title;

    @Size(max = 5000)
    @Schema(description = "New description of the job (optional)", example = "Updated description...")
    private String description;

    @Schema(description = "New workplace ID (optional). Note: usually job posts shouldn't change workplace.", example = "10")
    private Long workplaceId;

    @Schema(description = "Update remote availability (optional)", example = "false")
    private Boolean remote;

    @Schema(description = "Update inclusive opportunity status (optional)", example = "true")
    private Boolean inclusiveOpportunity;

    @Schema(description = "Update non-profit status (optional)", example = "false")
    private Boolean nonProfit;

    @Schema(description = "Update minimum salary (optional)", example = "65000")
    private Integer minSalary;

    @Schema(description = "Update maximum salary (optional)", example = "95000")
    private Integer maxSalary;

    @Schema(description = "Update contact information (optional)", example = "hr@example.com")
    private String contact;
}
