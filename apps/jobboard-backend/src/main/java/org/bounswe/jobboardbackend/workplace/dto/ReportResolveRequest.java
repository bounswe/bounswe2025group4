package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResolveRequest {
    @NotBlank
    private String action; // RESOLVE | REJECT
    @Size(max = 1000)
    private String adminNote;
}