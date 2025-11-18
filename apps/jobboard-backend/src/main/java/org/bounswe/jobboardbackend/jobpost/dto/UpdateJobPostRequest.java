package org.bounswe.jobboardbackend.jobpost.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobPostRequest {

    @Size(max = 100)
    private String title;

    @Size(max = 1000)
    private String description;

    private Long workplaceId;

    private Boolean remote;

    private Boolean inclusiveOpportunity;

    private Boolean nonProfit;

    private Integer minSalary;
    private Integer maxSalary;

    private String contact;
}

