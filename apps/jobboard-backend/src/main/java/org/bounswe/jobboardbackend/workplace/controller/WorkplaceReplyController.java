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
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workplace")
@RequiredArgsConstructor
@Tag(name = "Workplace Reply", description = "Management of employer replies to reviews")
@PreAuthorize("isAuthenticated()")
public class WorkplaceReplyController {

    private final ReplyService replyService;

    private boolean isAdmin(Authentication auth) {
        if (auth == null)
            return false;
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @Operation(summary = "Get Reply", description = "Retrieves the employer's reply for a specific review.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reply retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Reply or Review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Employer reply not found for review: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> getReply(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the review") @PathVariable Long reviewId) {
        var res = replyService.getReply(workplaceId, reviewId);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Create Reply", description = "Creates a reply to a review.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reply created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or reply already exists", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Reply already exists for this review\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not an employer of this workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to reply to reviews for this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Review or Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Review not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PostMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> createReply(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the review") @PathVariable Long reviewId,
            @RequestBody @Valid ReplyCreateRequest req,
            Authentication authentication) {
        var res = replyService.createReply(workplaceId, reviewId, req, getUserId(authentication),
                isAdmin(authentication));
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Update Reply", description = "Updates an existing reply.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reply updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid input\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not authorized)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this reply\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Reply not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Reply not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PutMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> updateReply(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the review") @PathVariable Long reviewId,
            @RequestBody @Valid ReplyUpdateRequest req,
            Authentication authentication) {
        var res = replyService.updateReply(workplaceId, reviewId, req, getUserId(authentication),
                isAdmin(authentication));
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete Reply", description = "Deletes a reply.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reply deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not authorized)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this reply\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Reply not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Reply not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @DeleteMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ApiMessage> deleteReply(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the review") @PathVariable Long reviewId,
            Authentication authentication) {
        replyService.deleteReply(workplaceId, reviewId, getUserId(authentication), isAdmin(authentication));
        return ResponseEntity.ok(ApiMessage.builder().message("Reply deleted").code("REPLY_DELETED").build());
    }
}
