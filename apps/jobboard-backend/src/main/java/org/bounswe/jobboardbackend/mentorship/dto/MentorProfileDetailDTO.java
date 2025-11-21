package org.bounswe.jobboardbackend.mentorship.dto;

import java.util.List;

public record MentorProfileDetailDTO(
        String id,
        String username,
        List<String> expertise,
        int currentMentees,
        int maxMentees,
        float averageRating,
        int reviewCount,
        List<MentorReviewDTO> reviews
) {}