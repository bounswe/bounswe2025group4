package org.bounswe.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfilePictureRequestDto {

    @NotBlank(message = "Profile picture URL must not be blank")
    private String profilePicture;
}
