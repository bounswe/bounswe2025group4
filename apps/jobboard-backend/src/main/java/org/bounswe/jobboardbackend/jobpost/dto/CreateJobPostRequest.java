package org.bounswe.jobboardbackend.jobpost.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobPostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Description cannot be empty")
    @Size(max = 1000)
    private String description;

    @NotNull(message = "Workplace ID is required")
    private Long workplaceId;

    private boolean remote;

    private boolean inclusiveOpportunity; // targeted toward candidates with disabilities

    private Integer minSalary;
    private Integer maxSalary;

    @NotBlank(message = "Contact information is required")
    private String contact;
}

