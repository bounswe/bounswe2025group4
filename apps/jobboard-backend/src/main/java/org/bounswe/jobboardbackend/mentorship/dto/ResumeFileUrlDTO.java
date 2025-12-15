package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing the URL of the resume file")
public class ResumeFileUrlDTO {

    @Schema(description = "Public URL of the file", example = "https://storage.example.com/resumes/123.pdf")
    String fileUrl;
}
