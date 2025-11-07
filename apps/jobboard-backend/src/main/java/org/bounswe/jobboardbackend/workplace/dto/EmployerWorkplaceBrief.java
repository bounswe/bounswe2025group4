package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerWorkplaceBrief {
    // "OWNER" or "MANAGER"
    private String role;
    private WorkplaceBriefResponse workplace;
}