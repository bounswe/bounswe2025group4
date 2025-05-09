package org.bounswe.backend.profile.dto;

import jakarta.validation.constraints.Size;
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

    @Size(max = 1000, message = "Bio must be at most 1000 characters")
    private String bio;

    private String profilePicture;

    private List<String> skills;

    private List<String> interests;
}
