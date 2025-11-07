package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceDetailResponse {
    private Long id;
    private String companyName;
    private String imageUrl;
    private String sector;
    private String location;
    private String shortDescription;
    private String detailedDescription;
    private String website;
    private List<String> ethicalTags;
    private Double overallAvg;
    private Map<String, Double> ethicalAverages; // policy -> avg
    private List<ReviewResponse> recentReviews;  // includeReviews=true ise dolabilir
    private List<EmployerListItem> employers;
    private Long reviewCount;
    private Instant createdAt;
    private Instant updatedAt;
}