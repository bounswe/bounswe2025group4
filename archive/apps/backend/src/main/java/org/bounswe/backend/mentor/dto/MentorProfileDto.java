package org.bounswe.backend.mentor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.backend.user.dto.UserDto;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileDto {
    private Long id;
    private UserDto user;
    private Integer capacity;
    private Integer currentMenteeCount;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean isAvailable;
}