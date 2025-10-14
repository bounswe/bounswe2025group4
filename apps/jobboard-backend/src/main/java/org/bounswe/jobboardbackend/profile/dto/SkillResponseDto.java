package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillResponseDto {
    private Long id;
    private String name;
    private String level;
}