package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSkillRequestDto {
    private String name;
    private String level;
}