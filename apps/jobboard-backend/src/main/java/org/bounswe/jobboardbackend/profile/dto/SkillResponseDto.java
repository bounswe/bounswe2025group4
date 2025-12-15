package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Skill details")
public class SkillResponseDto {
    @Schema(description = "ID of the skill", example = "1")
    private Long id;

    @Schema(description = "Name of the skill", example = "Java")
    private String name;

    @Schema(description = "Level of proficiency", example = "ADVANCED")
    private String level;
}