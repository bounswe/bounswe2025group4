package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerRequestResolve {
    @NotBlank
    private String action; // APPROVE | REJECT
}