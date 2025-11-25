package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceRatingResponse {
    private Long workplaceId;
    private Double overallAvg;
    private Map<String, Double> ethicalAverages; // policy -> avg
    private Long reviewCount;
}