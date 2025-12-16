package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Information about an employer associated with a workplace")
public class EmployerListItem {
    @Schema(description = "User ID", example = "101")
    private Long userId;

    @Schema(description = "Username", example = "admin_acme")
    private String username;

    @Schema(description = "Name and Surname", example = "Admin User")
    private String nameSurname;

    @Schema(description = "Email address", example = "admin@acme.com")
    private String email;

    @Schema(description = "Role in the workplace", example = "HR Manager")
    private String role;

    @Schema(description = "Date joined", example = "2022-01-01T00:00:00Z")
    private Instant joinedAt;
}