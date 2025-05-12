package org.bounswe.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.bounswe.backend.common.enums.UserType;
import org.bounswe.backend.common.enums.MentorshipStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String bio;

    private UserType userType;

    private MentorshipStatus mentorshipStatus;
    
    private Integer maxMenteeCount;
}
