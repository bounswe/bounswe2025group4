package org.bounswe.jobboardbackend.badge.dto;

import lombok.*;

/**
 * DTO for returning badge type information.
 * Used to show all available badges in the system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeTypeResponseDto {
    
    /**
     * The enum type name (e.g., "FIRST_VOICE", "THOUGHT_LEADER")
     */
    private String type;
    
    /**
     * Display name (e.g., "First Voice", "Thought Leader")
     */
    private String name;
    
    /**
     * Badge description
     */
    private String description;
    
    /**
     * Human-readable criteria
     */
    private String criteria;
    
    /**
     * Numeric threshold to earn this badge
     */
    private int threshold;
}

