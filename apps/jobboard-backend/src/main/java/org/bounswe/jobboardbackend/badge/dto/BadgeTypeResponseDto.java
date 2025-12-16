package org.bounswe.jobboardbackend.badge.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO for returning badge type information.
 * Used to show all available badges in the system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Represents a type of badge available in the system")
public class BadgeTypeResponseDto {

    /**
     * The enum type name (e.g., "FIRST_VOICE", "THOUGHT_LEADER")
     */
    @Schema(description = "The enum type name", example = "FIRST_VOICE")
    private String type;

    /**
     * Display name (e.g., "First Voice", "Thought Leader")
     */
    @Schema(description = "Display name of the badge", example = "First Voice")
    private String name;

    /**
     * Badge description
     */
    @Schema(description = "Description of what the badge represents", example = "Awarded for posting for the first time")
    private String description;

    /**
     * Human-readable criteria
     */
    @Schema(description = "Criteria required to earn this badge", example = "Post 1 time")
    private String criteria;

    /**
     * Numeric threshold to earn this badge
     */
    @Schema(description = "Numeric threshold value for the criteria", example = "1")
    private int threshold;
}
