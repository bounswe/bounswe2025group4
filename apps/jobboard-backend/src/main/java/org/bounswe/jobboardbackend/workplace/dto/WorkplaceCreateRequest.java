package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating a new workplace")
public class WorkplaceCreateRequest {
    @Schema(description = "Name of the company", example = "Acme Corp")
    @NotBlank
    private String companyName;

    @Schema(description = "Industry sector", example = "Technology")
    @NotBlank
    private String sector;

    @Schema(description = "Location of headquarters", example = "San Francisco, CA")
    @NotBlank
    private String location;

    @Schema(description = "Short summary of the workplace", example = "Innovating the future.")
    @Size(max = 500)
    private String shortDescription;

    @Schema(description = "Detailed description", example = "Acme Corp is a leading provider of...")
    @Size(max = 4000)
    private String detailedDescription;

    @Schema(description = "List of ethical practice tags", example = "[\"Sustainability\", \"Diversity\"]")
    private List<String> ethicalTags;

    @Schema(description = "Company website URL", example = "https://www.acme.com")
    private String website;
    // private String photoUrl; // logo
}