package org.bounswe.jobboardbackend.jobapplication.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response containing details of the uploaded CV")
public class CvUploadResponse {

    @Schema(description = "Public URL of the uploaded CV", example = "https://storage.example.com/cvs/123.pdf")
    private String cvUrl;

    @Schema(description = "Timestamp when the CV was uploaded")
    private LocalDateTime uploadedAt;
}
