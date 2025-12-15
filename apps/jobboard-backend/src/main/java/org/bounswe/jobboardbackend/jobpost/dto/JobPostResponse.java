package org.bounswe.jobboardbackend.jobpost.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceBriefResponse;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a job post")
public class JobPostResponse {

    @Schema(description = "Unique identifier of the job post", example = "10")
    private Long id;

    @Schema(description = "ID of the employer who posted the job", example = "5")
    private Long employerId;

    @Schema(description = "Title of the job post", example = "Senior Backend Engineer")
    private String title;

    @Schema(description = "Detailed description of the job", example = "We are looking for...")
    private String description;

    // Workplace information
    @Schema(description = "Details of the workplace offering the job")
    private WorkplaceBriefResponse workplace;

    @Schema(description = "Indicates if the job is remote", example = "true")
    private boolean remote;

    @Schema(description = "Indicates if the job is targeted toward candidates with disabilities", example = "true")
    private boolean inclusiveOpportunity;

    @Schema(description = "Indicates if this is a non-profit or volunteer position", example = "false")
    private boolean nonProfit;

    @Schema(description = "Minimum salary offered", example = "60000")
    private Integer minSalary;

    @Schema(description = "Maximum salary offered", example = "90000")
    private Integer maxSalary;

    @Schema(description = "Contact information for the job", example = "apply@example.com")
    private String contact;

    @Schema(description = "Date when the job was posted")
    private LocalDateTime postedDate;
}
