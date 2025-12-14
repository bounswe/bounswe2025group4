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
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/workplace")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Workplace", description = "Workplace Management API")
public class WorkplaceController {

        private final WorkplaceService workplaceService;

        @Operation(summary = "Create Workplace", description = "Creates a new workplace entry.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Workplace created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Validation error: Company name is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required to access this resource\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PostMapping
        public ResponseEntity<WorkplaceDetailResponse> create(@RequestBody @Valid WorkplaceCreateRequest req,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = workplaceService.create(req, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Upload Workplace Image", description = "Uploads an image for the specified workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid file or input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid file format\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not an employer of this workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PostMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<WorkplaceImageResponseDto> uploadImage(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id,
                        @Parameter(description = "Image file to upload") @RequestPart("file") MultipartFile file,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = workplaceService.uploadImage(id, file, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Delete Workplace Image", description = "Deletes the image of the specified workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Image deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not an employer of this workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Workplace or image not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @DeleteMapping(path = "/{id}/image")
        public ResponseEntity<ApiMessage> deleteImage(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                workplaceService.deleteImage(id, userDetails.getId());
                return ResponseEntity.ok(ApiMessage.builder()
                                .message("Workplace image deleted")
                                .code("WORKPLACE_IMAGE_DELETED")
                                .build());
        }

        @Operation(summary = "List Workplaces", description = "Retrieves a paginated list of workplaces with optional filtering.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Workplaces retrieved successfully")
        })
        @GetMapping
        public ResponseEntity<PaginatedResponse<WorkplaceBriefResponse>> list(
                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size,
                        @Parameter(description = "Filter by sector") @RequestParam(required = false) String sector,
                        @Parameter(description = "Filter by location") @RequestParam(required = false) String location,
                        @Parameter(description = "Filter by ethical tag") @RequestParam(required = false) String ethicalTag,
                        @Parameter(description = "Filter by minimum average rating") @RequestParam(required = false) Double minRating,
                        @Parameter(description = "Sort criteria") @RequestParam(required = false) String sortBy,
                        @Parameter(description = "Search query (company name)") @RequestParam(required = false) String search) {
                var res = workplaceService.listBrief(page, size, sector, location, ethicalTag, minRating, sortBy,
                                search);
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Get Workplace Detail", description = "Retrieves detailed information about a specific workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Workplace details retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 10\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @GetMapping("/{id}")
        public ResponseEntity<WorkplaceDetailResponse> detail(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id,
                        @Parameter(description = "Include reviews in response") @RequestParam(defaultValue = "false") boolean includeReviews,
                        @Parameter(description = "Limit number of reviews returned") @RequestParam(defaultValue = "3") int reviewsLimit) {
                var res = workplaceService.getDetail(id, includeReviews, reviewsLimit);
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Update Workplace", description = "Updates an existing workplace entry.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Workplace updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Validation error: Invalid input\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not an employer of this workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PutMapping("/{id}")
        public ResponseEntity<WorkplaceDetailResponse> update(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id,
                        @RequestBody @Valid WorkplaceUpdateRequest req,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                var res = workplaceService.update(id, req, userDetails.getId());
                return ResponseEntity.ok(res);
        }

        @Operation(summary = "Delete Workplace", description = "Soft deletes a workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Workplace deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Admin only for full delete, or specific permission)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiMessage> delete(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                workplaceService.softDelete(id, userDetails.getId());
                return ResponseEntity.ok(ApiMessage.builder()
                                .message("Workplace deleted")
                                .code("WORKPLACE_DELETED")
                                .build());
        }

        @Operation(summary = "Get Workplace Rating", description = "Retrieves rating statistics for a workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Rating retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @GetMapping("/{id}/rating")
        public ResponseEntity<WorkplaceRatingResponse> getRating(
                        @Parameter(description = "ID of the workplace") @PathVariable Long id) {
                var res = workplaceService.getRating(id);
                return ResponseEntity.ok(res);
        }
}