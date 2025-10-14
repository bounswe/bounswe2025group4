package org.bounswe.jobboardbackend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSkillRequestDto {
    @NotBlank(message = "Skill name is required")
    private String name;

    private String level; // optional: e.g., BEGINNER/INTERMEDIATE/ADVANCED
}