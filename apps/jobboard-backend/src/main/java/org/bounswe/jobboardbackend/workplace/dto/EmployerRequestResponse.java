package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerRequestResponse {
    private Long id;
    private Long workplaceId;
    private Long createdByUserId;
    private String status; // EmployerRequestStatus
    private String note;
    private Instant createdAt;
    private Instant updatedAt;
}