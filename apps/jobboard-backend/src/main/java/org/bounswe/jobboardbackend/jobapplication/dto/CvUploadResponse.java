package org.bounswe.jobboardbackend.jobapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvUploadResponse {

    private String cvUrl;
    private LocalDateTime uploadedAt;
}

