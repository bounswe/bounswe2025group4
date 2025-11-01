package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkplaceCreateRequest {
    @NotBlank
    private String companyName;
    @NotBlank
    private String sector;
    @NotBlank
    private String location;
    @Size(max = 300)
    private String shortDescription;
    @Size(max = 4000)
    private String detailedDescription;
    private List<String> ethicalTags;
    private String website;
    //private String photoUrl; // logo
}