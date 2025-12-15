package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Rating summary for a workplace")
public class WorkplaceRatingResponse {
    @Schema(description = "Workplace ID", example = "10")
    private Long workplaceId;

    @Schema(description = "Overall average rating", example = "4.5")
    private Double overallAvg;

    @Schema(description = "Breakdown of average ratings by ethical policy")
    private Map<String, Double> ethicalAverages; // policy -> avg

    @Schema(description = "Total number of reviews", example = "200")
    private Long reviewCount;
}