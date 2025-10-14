package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileImageResponseDto {
    private String imageUrl;
    private Instant updatedAt;
}