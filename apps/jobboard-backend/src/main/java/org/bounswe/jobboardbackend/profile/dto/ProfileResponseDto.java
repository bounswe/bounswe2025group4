package org.bounswe.jobboardbackend.profile.dto;

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
public class ProfileResponseDto {
    private Long id;
    private Long userId;

    private String firstName;
    private String lastName;
    private String bio;
    private String pronounSet;
    private String imageUrl;

    private List<EducationResponseDto> educations;
    private List<ExperienceResponseDto> experiences;
    private List<SkillResponseDto> skills;
    private List<InterestResponseDto> interests;

    private Instant createdAt;
    private Instant updatedAt;
}