package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiMessage {
    private String message;
    private String code;
    @Builder.Default
    private Instant timestamp = Instant.now();
}