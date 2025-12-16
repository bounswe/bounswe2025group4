package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

/**
 * Public profile response DTO.
 * Note: Badges are now independent of Profile.
 * Use GET /api/badges/user/{userId} to get user badges.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Publicly available profile data")
public class PublicProfileResponseDto {
    @Schema(description = "User ID", example = "10")
    private Long userId;

    @Schema(description = "First name", example = "John")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    private String lastName;

    @Schema(description = "Biography", example = "A limited bio.")
    private String bio;

    @Schema(description = "Pronouns", example = "MALE")
    private String pronounSet;

    @Schema(description = "URL of profile image", example = "https://example.com/image.jpg")
    private String imageUrl;

    private List<EducationResponseDto> educations;
    private List<ExperienceResponseDto> experiences;
}