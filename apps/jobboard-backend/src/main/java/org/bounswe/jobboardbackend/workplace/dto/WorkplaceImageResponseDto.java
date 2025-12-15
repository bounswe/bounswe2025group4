package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response for workplace image upload")
public class WorkplaceImageResponseDto {
    @Schema(description = "Image URL", example = "https://example.com/logo.png")
    private String imageUrl;

    @Schema(description = "Update timestamp")
    private Instant updatedAt;
}