package org.bounswe.jobboardbackend.badge.dto;

import lombok.*;
import java.time.Instant;

/**
 * DTO for returning badge information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponseDto {
    private Long id;
    private Long userId;
    private String badgeType;
    private String name;
    private String description;
    private String criteria;
    private Instant earnedAt;
}

