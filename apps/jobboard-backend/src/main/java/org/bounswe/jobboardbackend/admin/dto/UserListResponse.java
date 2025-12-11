package org.bounswe.jobboardbackend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.Role;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private Boolean isBanned;
    private String banReason;
    private Instant createdAt;
}
