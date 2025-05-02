package org.bounswe.backend.user.dto;

import lombok.*;
import org.bounswe.backend.common.enums.UserType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private UserType userType;
}
