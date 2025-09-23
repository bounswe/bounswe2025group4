package org.bounswe.backend.profile.dto;

import lombok.Data;

import java.util.List;

@Data
public class InterestUpdateRequestDto {
    private List<String> interests;
}
