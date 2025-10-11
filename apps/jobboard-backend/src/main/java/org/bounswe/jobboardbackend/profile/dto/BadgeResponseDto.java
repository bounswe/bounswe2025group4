package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponseDto {
    private Long id;
    private String name;
    private String description;
    private String icon;      // optional icon url/name
    private String criteria;  // e.g., "Forum 100 posts"
    private Instant earnedAt;
}