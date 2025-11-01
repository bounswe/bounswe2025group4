package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceBriefResponse {
    private Long id;
    private String companyName;
    private String imageUrl;
    private String sector;
    private String location;
    private String shortDescription;
    private Double overallAvg;            // nullable
    private List<String> ethicalTags;    // names
    private Map<String, Double> ethicalAverages; // policy -> avg
}