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
    private String name;
    private String description;
    private String icon;
    private String criteria;
    private Instant earnedAt;
}

