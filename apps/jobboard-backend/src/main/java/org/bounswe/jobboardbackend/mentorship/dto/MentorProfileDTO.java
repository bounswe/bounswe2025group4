package org.bounswe.jobboardbackend.mentorship.dto;

import java.util.List;

public record MentorProfileDTO(
        String id,
        String username,
        List<String> expertise,
        int currentMentees,
        int maxMentees,
        float averageRating,
        int reviewCount
) {}