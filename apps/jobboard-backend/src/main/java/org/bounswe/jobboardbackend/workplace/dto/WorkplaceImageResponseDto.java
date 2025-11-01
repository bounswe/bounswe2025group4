package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceImageResponseDto {
    private String imageUrl;
    private Instant updatedAt;
}