package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Brief summary of a workplace")
public class WorkplaceBriefResponse {
    @Schema(description = "Workplace ID", example = "1")
    private Long id;

    @Schema(description = "Company name", example = "Acme Corp")
    private String companyName;

    @Schema(description = "Image URL", example = "https://example.com/logo.png")
    private String imageUrl;

    @Schema(description = "Sector", example = "Technology")
    private String sector;

    @Schema(description = "Location", example = "Remote")
    private String location;

    @Schema(description = "Short description", example = "Brief info.")
    private String shortDescription;

    @Schema(description = "Overall average rating", example = "4.2")
    private Double overallAvg; // nullable

    @Schema(description = "Ethical tags")
    private List<String> ethicalTags; // names

    @Schema(description = "Ethical policy averages")
    private Map<String, Double> ethicalAverages; // policy -> avg

    @Schema(description = "Total reviews count", example = "50")
    private Long reviewCount;
}