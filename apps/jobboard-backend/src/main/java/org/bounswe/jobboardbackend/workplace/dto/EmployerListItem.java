package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerListItem {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Instant joinedAt;
}