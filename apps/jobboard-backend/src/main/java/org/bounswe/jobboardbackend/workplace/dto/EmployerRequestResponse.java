package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Details of an employer request")
public class EmployerRequestResponse {
    @Schema(description = "Request ID", example = "200")
    private Long id;

    @Schema(description = "Workplace ID", example = "10")
    private Long workplaceId;

    @Schema(description = "Company name", example = "Acme Corp")
    private String workplaceCompanyName;

    @Schema(description = "ID of the user who created the request", example = "55")
    private Long createdByUserId;

    @Schema(description = "Username of the requester", example = "jdoe")
    private String username;

    @Schema(description = "Name and Surname of the requester", example = "John Doe")
    private String nameSurname;

    @Schema(description = "Status of the request", example = "PENDING")
    private String status; // EmployerRequestStatus

    @Schema(description = "Optional note from the requester", example = "I am the new HR manager.")
    private String note;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    @Schema(description = "Last update timestamp")
    private Instant updatedAt;
}