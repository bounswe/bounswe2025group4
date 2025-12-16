package org.bounswe.jobboardbackend.mentorship.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/mentorship")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Mentorship", description = "Mentorship Management API")
public class MentorshipController {

        private final MentorshipService mentorshipService;

        @Operation(summary = "Upload Resume File", description = "Uploads a resume file for a specific review session.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid file or request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid file format\", \"path\": \"/api/mentorship/1/file\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/1/file\" }"))),
                        @ApiResponse(responseCode = "404", description = "Resume review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Resume review not found\", \"path\": \"/api/mentorship/1/file\" }")))
        })
        @PostMapping(path = "/{resumeReviewId}/file", consumes = { "multipart/form-data" })
        public ResponseEntity<ResumeFileResponseDTO> uploadResumeFile(
                        @Parameter(description = "ID of the resume review") @PathVariable Long resumeReviewId,
                        @Parameter(description = "Resume file (PDF)") @RequestPart("file") MultipartFile file) {
                ResumeFileResponseDTO dto = mentorshipService.uploadResumeFile(resumeReviewId, file);
                return ResponseEntity.ok(dto);
        }

        @Operation(summary = "Get Resume File URL", description = "Retrieves the public URL of the uploaded resume.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "URL retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/1/file\" }"))),
                        @ApiResponse(responseCode = "404", description = "Resume review or file not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"File not found\", \"path\": \"/api/mentorship/1/file\" }")))
        })
        @GetMapping("/{resumeReviewId}/file")
        public ResponseEntity<ResumeFileUrlDTO> getResumeFileUrl(
                        @Parameter(description = "ID of the resume review") @PathVariable Long resumeReviewId) {
                ResumeFileUrlDTO dto = mentorshipService.getResumeFileUrl(resumeReviewId);
                return ResponseEntity.ok(dto);
        }

        @Operation(summary = "Get Resume Review Details", description = "Retrieves details of a specific resume review.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Review details retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Resume review not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Resume review not found\", \"path\": \"/api/mentorship/1\" }")))
        })
        @GetMapping("/{resumeReviewId}")
        public ResponseEntity<ResumeReviewDTO> getResumeReview(
                        @Parameter(description = "ID of the resume review") @PathVariable Long resumeReviewId) {
                ResumeReviewDTO dto = mentorshipService.getResumeReview(resumeReviewId);
                return ResponseEntity.ok(dto);
        }

        @Operation(summary = "Search Mentors", description = "Retrieves a list of all available mentors.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Mentors retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship\" }")))
        })
        @GetMapping
        public ResponseEntity<List<MentorProfileDetailDTO>> searchMentors() {
                List<MentorProfileDetailDTO> mentors = mentorshipService.searchMentors();
                return ResponseEntity.ok(mentors);
        }

        @Operation(summary = "Create Mentor Profile", description = "Creates a new mentor profile for the authenticated user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Mentor profile created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid profile data\", \"path\": \"/api/mentorship/mentor\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentor\" }")))
        })
        @PostMapping("/mentor")
        public ResponseEntity<MentorProfileDTO> createMentorProfile(
                        @Valid @RequestBody CreateMentorProfileDTO createDTO,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                MentorProfileDTO newProfile = mentorshipService.createMentorProfile(userDetails.getId(), createDTO);
                return new ResponseEntity<>(newProfile, HttpStatus.CREATED);
        }

        @Operation(summary = "Update Mentor Profile", description = "Updates an existing mentor profile.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Mentor profile updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid profile data\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not the owner of this profile\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Mentor profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Mentor profile not found\", \"path\": \"/api/mentorship/mentor/1\" }")))
        })
        @PutMapping("/mentor/{userId}")
        public ResponseEntity<MentorProfileDTO> updateMentorProfile(
                        @Valid @RequestBody UpdateMentorProfileDTO updateDTO,
                        @Parameter(description = "ID of the user (mentor)") @PathVariable Long userId) {
                MentorProfileDTO newProfile = mentorshipService.updateMentorProfile(userId, updateDTO);
                return new ResponseEntity<>(newProfile, HttpStatus.OK);
        }

        @Operation(summary = "Get Mentor Profile", description = "Retrieves the public profile of a mentor.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Mentor profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Mentor profile not found\", \"path\": \"/api/mentorship/mentor/1\" }")))
        })
        @GetMapping("/mentor/{userId}")
        public ResponseEntity<MentorProfileDetailDTO> getMentorProfile(
                        @Parameter(description = "ID of the user (mentor)") @PathVariable Long userId) {
                MentorProfileDetailDTO profile = mentorshipService.getMentorProfile(userId);
                return new ResponseEntity<>(profile, HttpStatus.OK);
        }

        @Operation(summary = "Delete Mentor Profile", description = "Deletes a mentor profile.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profile deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the owner/admin)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to delete this profile\", \"path\": \"/api/mentorship/mentor/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Mentor profile not found\", \"path\": \"/api/mentorship/mentor/1\" }")))
        })
        @DeleteMapping("/mentor/{userId}")
        public ResponseEntity<MentorProfileDTO> deleteMentorProfile(
                        @Parameter(description = "ID of the user (mentor)") @PathVariable Long userId) {
                mentorshipService.deleteMentorProfile(userId);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Complete Mentorship Review", description = "Marks a mentorship review session as complete.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Mentorship completed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/review/1/complete\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/mentorship/review/1/complete\" }"))),
                        @ApiResponse(responseCode = "404", description = "Review session not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Review session not found\", \"path\": \"/api/mentorship/review/1/complete\" }")))
        })
        @PatchMapping("/review/{resumeReviewId}/complete")
        public ResponseEntity<Void> completeMentorship(
                        @Parameter(description = "ID of the resume review") @PathVariable Long resumeReviewId,
                        Authentication auth) {
                mentorshipService.completeMentorship(resumeReviewId, auth);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Close Mentorship Review", description = "Closes a mentorship review session.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Mentorship closed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/review/1/close\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/mentorship/review/1/close\" }"))),
                        @ApiResponse(responseCode = "404", description = "Review session not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Review session not found\", \"path\": \"/api/mentorship/review/1/close\" }")))
        })
        @PatchMapping("/review/{resumeReviewId}/close")
        public ResponseEntity<Void> closeMentorship(
                        @Parameter(description = "ID of the resume review") @PathVariable Long resumeReviewId,
                        Authentication auth) {
                mentorshipService.closeMentorship(resumeReviewId, auth);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Create Mentorship Request", description = "Sends a new mentorship request to a mentor.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Request created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid request data\", \"path\": \"/api/mentorship/requests\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/requests\" }")))
        })
        @PostMapping("/requests")
        public ResponseEntity<MentorshipRequestDTO> createMentorshipRequest(
                        @Valid @RequestBody CreateMentorshipRequestDTO requestDTO,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                MentorshipRequestDTO newRequest = mentorshipService.createMentorshipRequest(requestDTO,
                                userDetails.getId());
                return new ResponseEntity<>(newRequest, HttpStatus.CREATED);
        }

        @Operation(summary = "Get Requests for Mentor", description = "Retrieves all mentorship requests received by a mentor.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentor/1/requests\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the mentor)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not the mentor\", \"path\": \"/api/mentorship/mentor/1/requests\" }")))
        })
        @GetMapping("mentor/{mentorId}/requests")
        public ResponseEntity<List<MentorshipRequestDTO>> getMentorshipRequestOfMentor(
                        @Parameter(description = "ID of the mentor") @PathVariable Long mentorId,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                List<MentorshipRequestDTO> requests = mentorshipService.getMentorshipRequestsOfMentor(mentorId,
                                userDetails.getId());
                return ResponseEntity.ok(requests);
        }

        @Operation(summary = "Get My Mentorship Details", description = "Retrieves mentorship details for the current user (mentee).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Details retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/mentee/1/requests\" }")))
        })
        @GetMapping("/mentee/{menteeId}/requests")
        public ResponseEntity<List<MentorshipDetailsDTO>> getMyMentorshipDetails(
                        @Parameter(description = "ID of the mentee") @PathVariable Long menteeId) {
                List<MentorshipDetailsDTO> details = mentorshipService.getMentorshipDetailsForMentee(menteeId,
                                menteeId);
                return ResponseEntity.ok(details);
        }

        @Operation(summary = "Get Mentorship Request", description = "Retrieves a specific mentorship request.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Request retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/requests/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/mentorship/requests/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Request not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Mentorship request not found\", \"path\": \"/api/mentorship/requests/1\" }")))
        })
        @GetMapping("/requests/{requestId}")
        public ResponseEntity<MentorshipRequestResponseDTO> getMentorshipRequest(
                        @Parameter(description = "ID of the request") @PathVariable Long requestId,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                MentorshipRequestResponseDTO request = mentorshipService.getMentorshipRequest(requestId,
                                userDetails.getId());
                return new ResponseEntity<>(request, HttpStatus.OK);
        }

        @Operation(summary = "Respond to Mentorship Request", description = "Accepts or rejects a mentorship request.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Response processed successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid resolution status\", \"path\": \"/api/mentorship/requests/1/respond\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/requests/1/respond\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/mentorship/requests/1/respond\" }"))),
                        @ApiResponse(responseCode = "404", description = "Request not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Request not found\", \"path\": \"/api/mentorship/requests/1/respond\" }")))
        })
        @PatchMapping("/requests/{requestId}/respond")
        public ResponseEntity<MentorshipRequestResponseDTO> respondToMentorshipRequest(
                        @Parameter(description = "ID of the request") @PathVariable Long requestId,
                        @Valid @RequestBody RespondToRequestDTO responseDTO,
                        Authentication auth) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                MentorshipRequestResponseDTO updatedRequest = mentorshipService.respondToMentorshipRequest(
                                requestId,
                                responseDTO,
                                userDetails.getId());
                return new ResponseEntity<>(updatedRequest, HttpStatus.OK);
        }

        @Operation(summary = "Rate Mentor", description = "Submits a rating and review for a mentor.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Rating submitted successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid rating data\", \"path\": \"/api/mentorship/ratings\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/mentorship/ratings\" }"))),
                        @ApiResponse(responseCode = "404", description = "Mentor or session not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Mentor or session not found\", \"path\": \"/api/mentorship/ratings\" }")))
        })
        @PostMapping("/ratings")
        public ResponseEntity<Void> rateMentor(
                        @Valid @RequestBody CreateRatingDTO ratingDTO,
                        Authentication auth) {
                UserDetailsImpl jobSeeker = (UserDetailsImpl) auth.getPrincipal();
                mentorshipService.rateMentor(ratingDTO, jobSeeker.getId());

                return new ResponseEntity<>(HttpStatus.CREATED);
        }
}
