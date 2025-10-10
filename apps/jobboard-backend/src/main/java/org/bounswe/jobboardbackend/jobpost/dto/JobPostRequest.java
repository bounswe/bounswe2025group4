package org.bounswe.jobboardbackend.jobpost.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Description cannot be empty")
    @Size(max = 1000)
    private String description;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Location is required")
    private String location;

    private boolean remote;

    private String ethicalTags; // comma-separated, optional

    private boolean inclusiveOpportunity; // targeted toward candidates with disabilities

    private Integer minSalary;
    private Integer maxSalary;

    @NotBlank(message = "Contact information is required")
    private String contact;
}

