package org.bounswe.backend.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostDto {

    private Long id;
    private Long employerId;

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

    private String ethicalTags; // Optional

    private Integer minSalary;

    private Integer maxSalary;
}
