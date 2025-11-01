package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCreateRequest {
    @Size(max = 255)
    private String title;

    @Size(max = 4000)
    private String content;

    private Map<String, @Min(1) @Max(5) Integer> ethicalPolicyRatings; // policy -> 1..5

    private boolean isAnonymous;
}