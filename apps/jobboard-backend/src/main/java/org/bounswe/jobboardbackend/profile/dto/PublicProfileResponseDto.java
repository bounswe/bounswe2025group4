package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicProfileResponseDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String pronounSet;
    private String imageUrl;

    private List<EducationResponseDto> educations;
    private List<ExperienceResponseDto> experiences;
    private List<BadgeResponseDto> badges;
}