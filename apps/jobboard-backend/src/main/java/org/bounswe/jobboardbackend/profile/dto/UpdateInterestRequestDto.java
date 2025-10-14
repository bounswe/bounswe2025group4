package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateInterestRequestDto {
    private String name;
}