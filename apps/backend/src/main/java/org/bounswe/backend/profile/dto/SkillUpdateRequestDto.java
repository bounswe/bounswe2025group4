package org.bounswe.backend.profile.dto;

import lombok.Data;

import java.util.List;

@Data
public class SkillUpdateRequestDto {
    private List<String> skills;
}
