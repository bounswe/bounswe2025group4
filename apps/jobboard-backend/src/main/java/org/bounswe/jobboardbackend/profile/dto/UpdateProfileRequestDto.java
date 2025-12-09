package org.bounswe.jobboardbackend.profile.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequestDto {
    private String firstName; // optional (partial update)
    private String lastName;  // optional
    private String bio;       // optional
    private String gender;
}