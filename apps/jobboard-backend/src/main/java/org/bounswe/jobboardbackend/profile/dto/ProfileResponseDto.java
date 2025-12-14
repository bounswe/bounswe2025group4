package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.Instant;
import java.util.List;

/**
 * Profile response DTO.
 * Note: Badges are now independent of Profile.
 * Use GET /api/badges/user/{userId} to get user badges.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Full Profile data for a user")
public class ProfileResponseDto {
    @Schema(description = "Unique ID of the profile", example = "1")
    private Long id;

    @Schema(description = "User ID", example = "10")
    private Long userId;

    @Schema(description = "First name", example = "John")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    private String lastName;

    @Schema(description = "Biography", example = "A detailed bio.")
    private String bio;

    @Schema(description = "Pronouns", example = "MALE")
    private String pronounSet;

    @Schema(description = "URL of profile image", example = "https://example.com/image.jpg")
    private String imageUrl;

    private List<EducationResponseDto> educations;
    private List<ExperienceResponseDto> experiences;
    private List<SkillResponseDto> skills;
    private List<InterestResponseDto> interests;

    @Schema(description = "Creation timestamp", example = "2023-01-01T12:00:00Z")
    private Instant createdAt;

    @Schema(description = "Last update timestamp", example = "2023-01-02T12:00:00Z")
    private Instant updatedAt;
}