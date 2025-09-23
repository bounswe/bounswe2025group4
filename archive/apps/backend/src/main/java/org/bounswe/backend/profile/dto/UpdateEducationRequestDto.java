package org.bounswe.backend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEducationRequestDto {
    private String school;
    private String degree;
    private String field;
    private String startDate;
    private String endDate;
}
