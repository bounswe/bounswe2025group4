package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object for profile image upload")
public class ProfileImageResponseDto {
    @Schema(description = "URL of the uploaded image", example = "https://bucket.s3.amazonaws.com/image.jpg")
    private String imageUrl;

    @Schema(description = "Update timestamp", example = "2023-01-01T12:00:00Z")
    private Instant updatedAt;
}