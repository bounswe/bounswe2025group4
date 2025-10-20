package org.bounswe.jobboardbackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpRequestResponse {
    private String username;
    private String message;
    private String temporaryToken;
}