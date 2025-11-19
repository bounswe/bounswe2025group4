package org.bounswe.jobboardbackend.jobpost.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceBriefResponse;
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
    
    // Workplace information
    private WorkplaceBriefResponse workplace;
    
    private boolean remote;
    private boolean inclusiveOpportunity;
    private boolean nonProfit;
    private Integer minSalary;
    private Integer maxSalary;
    private String contact;
    private LocalDateTime postedDate;
}

