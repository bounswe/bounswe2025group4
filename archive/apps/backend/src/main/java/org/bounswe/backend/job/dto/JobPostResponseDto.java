package org.bounswe.backend.job.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostResponseDto {

    private Long id;
    private Long employerId;
    private String title;
    private String description;
    private String company;
    private String location;
    private boolean remote;
    private String ethicalTags;
    private Integer minSalary;
    private Integer maxSalary;
    private String contact;
    private LocalDateTime postedDate;
}

