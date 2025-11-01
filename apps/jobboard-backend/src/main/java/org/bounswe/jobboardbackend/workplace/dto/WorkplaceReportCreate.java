package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceReportCreate {
    @NotBlank
    private String reasonType; // WorkplaceReportReason
    @Size(max = 2000)
    private String description;
}