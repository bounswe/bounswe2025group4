package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Detailed information about a workplace")
public class WorkplaceDetailResponse {
    @Schema(description = "Unique ID of the workplace", example = "1")
    private Long id;

    @Schema(description = "Company name", example = "Acme Corp")
    private String companyName;

    @Schema(description = "URL of the workplace image/logo", example = "https://example.com/logo.png")
    private String imageUrl;

    @Schema(description = "Industry sector", example = "Technology")
    private String sector;

    @Schema(description = "Location", example = "New York, NY")
    private String location;

    @Schema(description = "Short description", example = "Leading tech company.")
    private String shortDescription;

    @Schema(description = "Detailed description", example = "Acme Corp provides...")
    private String detailedDescription;

    @Schema(description = "Website URL", example = "https://www.acmecorp.com")
    private String website;

    @Schema(description = "Ethical tags associated with the workplace")
    private List<String> ethicalTags;

    @Schema(description = "Overall average rating", example = "4.5")
    private Double overallAvg;

    @Schema(description = "Average ratings per ethical policy")
    private Map<String, Double> ethicalAverages; // policy -> avg

    @Schema(description = "List of recent reviews")
    private List<ReviewResponse> recentReviews;

    @Schema(description = "List of associated employers")
    private List<EmployerListItem> employers;

    @Schema(description = "Total number of reviews", example = "150")
    private Long reviewCount;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    @Schema(description = "Last update timestamp")
    private Instant updatedAt;
}