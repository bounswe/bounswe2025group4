package org.bounswe.jobboardbackend.badge.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.Instant;

/**
 * DTO for returning badge information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Represents a badge earned by a user")
public class BadgeResponseDto {
    @Schema(description = "Unique identifier of the badge", example = "1")
    private Long id;

    @Schema(description = "ID of the user who earned the badge", example = "1")
    private Long userId;

    @Schema(description = "Type of the badge", example = "FIRST_VOICE")
    private String badgeType;

    @Schema(description = "Name of the badge", example = "First Voice")
    private String name;

    @Schema(description = "Description of the badge", example = "Earned by creating first post")
    private String description;

    @Schema(description = "Criteria to earn the badge", example = "Create 1 post")
    private String criteria;

    @Schema(description = "When the badge was earned")
    private Instant earnedAt;
}
