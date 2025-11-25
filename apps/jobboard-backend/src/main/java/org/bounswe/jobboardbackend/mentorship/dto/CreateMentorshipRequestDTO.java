package org.bounswe.jobboardbackend.mentorship.dto;



import jakarta.validation.constraints.NotNull;

public record CreateMentorshipRequestDTO(
        @NotNull Long mentorId
) {}
