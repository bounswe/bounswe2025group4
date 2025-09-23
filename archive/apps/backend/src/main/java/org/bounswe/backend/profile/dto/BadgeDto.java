package org.bounswe.backend.profile.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private LocalDateTime earnedAt;
}
