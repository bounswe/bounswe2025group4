package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

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
    private String imageUrl;

    private List<EducationResponseDto> educations;
    private List<ExperienceResponseDto> experiences;
    private List<SkillResponseDto> skills;
    private List<InterestResponseDto> interests;
    private List<BadgeResponseDto> badges;

    private Instant createdAt;
    private Instant updatedAt;
}