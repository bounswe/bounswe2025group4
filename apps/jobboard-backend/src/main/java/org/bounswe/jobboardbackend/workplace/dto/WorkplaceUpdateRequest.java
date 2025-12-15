package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.Size;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating workplace details")
public class WorkplaceUpdateRequest {
    @Schema(description = "Company name", example = "Acme Inc.")
    private String companyName;

    @Schema(description = "Sector", example = "Finance")
    private String sector;

    @Schema(description = "Location", example = "London, UK")
    private String location;

    @Schema(description = "Short description", example = "Financial services.")
    @Size(max = 300)
    private String shortDescription;

    @Schema(description = "Detailed description", example = "Global financial institution...")
    @Size(max = 4000)
    private String detailedDescription;

    @Schema(description = "Ethical tags")
    private List<String> ethicalTags;

    @Schema(description = "Website URL", example = "https://www.acme.co.uk")
    private String website;
}