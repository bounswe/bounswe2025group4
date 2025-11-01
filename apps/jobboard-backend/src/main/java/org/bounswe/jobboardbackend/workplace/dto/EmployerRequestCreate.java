package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerRequestCreate {
    private String note;
}