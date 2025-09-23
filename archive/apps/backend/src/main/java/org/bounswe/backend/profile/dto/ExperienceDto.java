package org.bounswe.backend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDto {
    private Long id;
    private String company;
    private String position;
    private String description;
    private String startDate;
    private String endDate;
}
