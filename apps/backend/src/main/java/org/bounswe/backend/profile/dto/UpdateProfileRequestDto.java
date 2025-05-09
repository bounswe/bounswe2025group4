package org.bounswe.backend.profile.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequestDto {

    private String fullName;

    private String phone;

    private String location;

    private String occupation;

    private String bio;

    private String profilePicture;

    private List<String> skills;

    private List<String> interests;
}
