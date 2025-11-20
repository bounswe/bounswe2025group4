package org.bounswe.jobboardbackend.mentorship.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateMentorProfileDTO(
        @NotEmpty(message = "Expertise list cannot be empty")
        List<String> expertise,

        @Min(value = 1, message = "You must be willing to mentor at least 1 person")
        int maxMentees
) {}
