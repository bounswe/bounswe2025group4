package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.Size;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceUpdateRequest {
    private String companyName;
    private String sector;
    private String location;
    @Size(max = 300)
    private String shortDescription;
    @Size(max = 4000)
    private String detailedDescription;
    private List<String> ethicalTags;
    private String website;
}