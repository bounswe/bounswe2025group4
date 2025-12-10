package org.bounswe.jobboardbackend.badge.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.badge.dto.BadgeResponseDto;
import org.bounswe.jobboardbackend.badge.dto.BadgeTypeResponseDto;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.badge.model.BadgeType;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for badge-related endpoints.
 * Provides access to user badges and available badge types.
 * Badges are independent of Profile.
 */
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Slf4j
public class BadgeController {

    private final BadgeRepository badgeRepository;

    /**
     * Get all badges for the current authenticated user.
     * 
     * @return List of badges earned by the current user
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BadgeResponseDto>> getMyBadges(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        log.info("Getting badges for user ID: {}", userId);
        
        List<Badge> badges = badgeRepository.findAllByUserId(userId);
        log.info("Found {} badges for user {}", badges.size(), userId);
        
        List<BadgeResponseDto> response = badges.stream()
                .map(this::toBadgeDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all badges for a specific user.
     * 
     * @param userId The user's ID
     * @return List of badges earned by the user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BadgeResponseDto>> getUserBadges(@PathVariable Long userId) {
        
        List<Badge> badges = badgeRepository.findAllByUserId(userId);
        List<BadgeResponseDto> response = badges.stream()
                .map(this::toBadgeDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all available badge types in the system.
     * Useful for displaying "Available Badges" page.
     * 
     * @return List of all badge types with their details
     */
    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BadgeTypeResponseDto>> getAllBadgeTypes() {
        
        List<BadgeTypeResponseDto> response = Arrays.stream(BadgeType.values())
                .map(this::toBadgeTypeDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    private BadgeResponseDto toBadgeDto(Badge badge) {
        return BadgeResponseDto.builder()
                .id(badge.getId())
                .userId(badge.getUserId())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .criteria(badge.getCriteria())
                .earnedAt(badge.getEarnedAt())
                .build();
    }

    private BadgeTypeResponseDto toBadgeTypeDto(BadgeType badgeType) {
        return BadgeTypeResponseDto.builder()
                .type(badgeType.name())
                .name(badgeType.getDisplayName())
                .description(badgeType.getDescription())
                .icon(badgeType.getIcon())
                .criteria(badgeType.getCriteria())
                .threshold(badgeType.getThreshold())
                .build();
    }
}

