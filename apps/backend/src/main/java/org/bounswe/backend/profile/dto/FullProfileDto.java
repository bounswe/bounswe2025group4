package org.bounswe.backend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.backend.user.dto.UserDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FullProfileDto {
    private ProfileDto profile;
    private List<ExperienceDto> experience;
    private List<EducationDto> education;
    private List<BadgeDto> badges;
}
