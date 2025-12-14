package org.bounswe.jobboardbackend.badge.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.badge.dto.BadgeResponseDto;
import org.bounswe.jobboardbackend.badge.dto.BadgeTypeResponseDto;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.badge.model.BadgeType;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.exception.ApiError;
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
@Tag(name = "Badges", description = "Badge Management API")
public class BadgeController {

        private final BadgeRepository badgeRepository;

        /**
         * Get all badges for the current authenticated user.
         * 
         * @return List of badges earned by the current user
         */
        @Operation(summary = "Get My Badges", description = "Retrieves all badges earned by the currently authenticated user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Badges retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/badges/my\" }")))
        })
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
        @Operation(summary = "Get User Badges", description = "Retrieves all badges earned by a specific user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Badges retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/badges/user/1\" }")))
        })
        @GetMapping("/user/{userId}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<BadgeResponseDto>> getUserBadges(
                        @Parameter(description = "ID of the user") @PathVariable Long userId) {

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
        @Operation(summary = "Get All Badge Types", description = "Retrieves all available badge types in the system.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Badge types retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/badges/types\" }")))
        })
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
                                .badgeType(badge.getBadgeType().name())
                                .name(badge.getName())
                                .description(badge.getDescription())
                                .criteria(badge.getCriteria())
                                .earnedAt(badge.getEarnedAt())
                                .build();
        }

        private BadgeTypeResponseDto toBadgeTypeDto(BadgeType badgeType) {
                return BadgeTypeResponseDto.builder()
                                .type(badgeType.name())
                                .name(badgeType.getDisplayName())
                                .description(badgeType.getDescription())
                                .criteria(badgeType.getCriteria())
                                .threshold(badgeType.getThreshold())
                                .build();
        }
}
