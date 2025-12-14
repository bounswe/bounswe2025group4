package org.bounswe.jobboardbackend.jobpost.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating a new job post")
public class CreateJobPostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    @Schema(description = "Title of the job post", example = "Senior Backend Engineer")
    private String title;

    @NotBlank(message = "Description cannot be empty")
    @Size(max = 5000)
    @Schema(description = "Detailed description of the job", example = "We are looking for an experienced Java developer...")
    private String description;

    @NotNull(message = "Workplace ID is required")
    @Schema(description = "ID of the workplace offering the job", example = "10")
    private Long workplaceId;

    @Schema(description = "Whether the job is remote", example = "true")
    private boolean remote;

    @Schema(description = "Targeted toward candidates with disabilities or special needs", example = "true")
    private boolean inclusiveOpportunity; // targeted toward candidates with disabilities

    @Schema(description = "Indicates if this is a non-profit or volunteer position", example = "false")
    private boolean nonProfit; // indicates if this is a non-profit/volunteer position

    @Schema(description = "Minimum salary offered", example = "60000")
    private Integer minSalary;

    @Schema(description = "Maximum salary offered", example = "90000")
    private Integer maxSalary;

    @NotBlank(message = "Contact information is required")
    @Schema(description = "Contact information (email, phone, or link)", example = "apply@example.com")
    private String contact;
}
