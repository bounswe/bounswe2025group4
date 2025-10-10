package org.bounswe.jobboardbackend.jobpost.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostResponse {

    private Long id;
    private Long employerId;
    private String title;
    private String description;
    private String company;
    private String location;
    private boolean remote;
    private String ethicalTags;
    private boolean isInclusiveOpportunity;
    private Integer minSalary;
    private Integer maxSalary;
    private String contact;
    private LocalDateTime postedDate;
}

