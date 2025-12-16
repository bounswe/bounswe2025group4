package org.bounswe.jobboardbackend.workplace.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;

import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workplace/{workplaceId}")
@RequiredArgsConstructor
@Tag(name = "Workplace Review", description = "Management of workplace reviews")
@PreAuthorize("isAuthenticated()")
public class WorkplaceReviewController {

        private final ReviewService reviewService;

        private boolean isAdmin(Authentication auth) {
                if (auth == null)
                        return false;
                for (GrantedAuthority ga : auth.getAuthorities()) {
                        if ("ROLE_ADMIN".equals(ga.getAuthority()))
                                return true;
                }
                return false;
        }

        // === REVIEWS ===
        @Operation(summary = "Create Review", description = "Creates a new review for a workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Review created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input or missing ratings", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid review data or missing ratings\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PostMapping("/review")
        public ResponseEntity<ReviewResponse> create(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @RequestBody @Valid ReviewCreateRequest req,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = reviewService.createReview(workplaceId, req, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "List Reviews", description = "Lists reviews for a workplace with optional filtering and sorting.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reviews retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @GetMapping("/review")
        public ResponseEntity<PaginatedResponse<ReviewResponse>> list(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "Filter by rating category (e.g. 'POSITIVE', 'NEGATIVE')") @RequestParam(required = false) String ratingFilter,
                        @Parameter(description = "Sort criteria (e.g. 'DATE_DESC', 'RATING_DESC')") @RequestParam(required = false) String sortBy,
                        @Parameter(description = "Filter checks for comments existence") @RequestParam(required = false) Boolean hasComment,
                        @Parameter(description = "Filter by specific ethical policy") @RequestParam(required = false) String policy,
                        @Parameter(description = "Minimum rating for the policy filter") @RequestParam(required = false) Integer policyMin,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal(); // Assuming list requires auth as
                                                                                     // per class level PreAuthorize
                var res = reviewService.listReviews(workplaceId, page, size, ratingFilter, sortBy, hasComment, policy,
                                policyMin, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Get Review", description = "Retrieves a specific review.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Review retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Review or Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Review not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @GetMapping("/review/{reviewId}")
        public ResponseEntity<ReviewResponse> getOne(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @Parameter(description = "ID of the review") @PathVariable Long reviewId,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                return ResponseEntity.ok(reviewService.getOne(workplaceId, reviewId, userDetails.getId()));
        }

        @Operation(summary = "Update Review", description = "Updates an existing review.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Review updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid input\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author of the review)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this review\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Review not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PutMapping("/review/{reviewId}")
        public ResponseEntity<ReviewResponse> update(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @Parameter(description = "ID of the review") @PathVariable Long reviewId,
                        @RequestBody @Valid ReviewUpdateRequest req,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = reviewService.updateReview(workplaceId, reviewId, req, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Delete Review", description = "Deletes a review.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Review deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author or admin)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this review\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Review not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @DeleteMapping("/review/{reviewId}")
        public ResponseEntity<ApiMessage> delete(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @Parameter(description = "ID of the review") @PathVariable Long reviewId,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                boolean isAdmin = isAdmin(auth);
                reviewService.deleteReview(workplaceId, reviewId, userDetails.getId(), isAdmin);
                return ResponseEntity.ok(ApiMessage.builder().message("Review deleted").code("REVIEW_DELETED").build());
        }

        @Operation(summary = "Toggle Helpful", description = "Marks or unmarks a review as helpful.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Helpful status toggled successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Cannot mark own review as helpful)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You cannot mark your own review as helpful\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Review not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PostMapping("/review/{reviewId}/helpful")
        public ResponseEntity<ReviewResponse> toggleHelpful(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
                        @Parameter(description = "ID of the review") @PathVariable Long reviewId,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = reviewService.toggleHelpful(workplaceId, reviewId, userDetails.getId());
                return ResponseEntity.ok(res);
        }

}
