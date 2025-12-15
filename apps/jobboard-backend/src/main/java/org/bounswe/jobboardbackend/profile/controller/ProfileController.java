package org.bounswe.jobboardbackend.profile.controller;

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
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.profile.dto.*;
import org.bounswe.jobboardbackend.profile.service.ProfileService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User Profile Management API")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    // ---------------------------
    // /profile (POST, GET, PUT)
    // ---------------------------

    /**
     * POST /api/profile
     */
    @Operation(summary = "Create Profile", description = "Creates a profile for the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid profile data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "409", description = "Profile already exists", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 409, \"error\": \"Conflict\", \"message\": \"Profile already exists for this user\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ProfileResponseDto> createProfile(@Valid @RequestBody CreateProfileRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.createProfile(userId, dto));
    }

    /**
     * GET /api/profile
     */
    @Operation(summary = "Get My Profile", description = "Retrieves the full profile of the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ProfileResponseDto> getMyProfile() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.getFullProfile(userId));
    }

    /**
     * PUT /api/profile
     */
    @Operation(summary = "Update My Profile", description = "Updates the profile of the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid profile updates\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ResponseEntity<ProfileResponseDto> updateMyProfile(@Validated @RequestBody UpdateProfileRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateProfile(userId, dto));
    }

    // -----------------------------------------
    // /profile/{user_id} (GET) - Public profile
    // -----------------------------------------

    /**
     * GET /api/profile/{userId}
     */
    @Operation(summary = "Get Public Profile", description = "Retrieves the public profile of a user by their ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Public profile retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "User or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"User or profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{userId}")
    public ResponseEntity<PublicProfileResponseDto> getPublicProfile(
            @Parameter(description = "ID of the user to retrieve the profile for") @PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId));
    }

    // --------------------------------
    // /profile/image (POST, DELETE)
    // --------------------------------

    /**
     * POST /api/profile/image
     */
    @Operation(summary = "Upload Profile Image", description = "Uploads a profile image for the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid file format\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "500", description = "Internal server error during upload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 500, \"error\": \"Internal Server Error\", \"message\": \"Failed to upload image\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping(path = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileImageResponseDto> uploadImage(
            @Parameter(description = "Image file to upload") @RequestPart("file") MultipartFile file) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.uploadImage(userId, file));
    }

    /**
     * DELETE /api/profile/image
     */
    @Operation(summary = "Delete Profile Image", description = "Deletes the profile image of the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Image deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile or image not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile image not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/image")
    public ResponseEntity<Void> deleteImage() {
        Long userId = getCurrentUserId();
        profileService.deleteImage(userId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // /profile/education (POST)
    // /profile/education/{education_id} (PUT, DELETE)
    // ------------------------------

    /**
     * POST /api/profile/education
     */
    @Operation(summary = "Add Education", description = "Adds an education entry to the authenticated user's profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Education added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid education data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/education")
    public ResponseEntity<EducationResponseDto> addEducation(@Valid @RequestBody CreateEducationRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addEducation(userId, dto));
    }

    /**
     * PUT /api/profile/education/{educationId}
     */
    @Operation(summary = "Update Education", description = "Updates an existing education entry.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Education updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid education updates\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this education entry\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Education or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Education entry not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/education/{educationId}")
    public ResponseEntity<EducationResponseDto> updateEducation(
            @Parameter(description = "ID of the education entry") @PathVariable Long educationId,
            @RequestBody UpdateEducationRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateEducation(userId, educationId, dto));
    }

    /**
     * DELETE /api/profile/education/{educationId}
     */
    @Operation(summary = "Delete Education", description = "Deletes an education entry.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Education deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this education entry\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Education or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Education entry not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/education/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @Parameter(description = "ID of the education entry") @PathVariable Long educationId) {
        Long userId = getCurrentUserId();
        profileService.deleteEducation(userId, educationId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // /profile/experience (POST)
    // /profile/experience/{experience_id} (PUT, DELETE)
    // ------------------------------

    /**
     * POST /api/profile/experience
     */
    @Operation(summary = "Add Experience", description = "Adds a work experience entry to the authenticated user's profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Experience added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid experience data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/experience")
    public ResponseEntity<ExperienceResponseDto> addExperience(@Valid @RequestBody CreateExperienceRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addExperience(userId, dto));
    }

    /**
     * PUT /api/profile/experience/{experienceId}
     */
    @Operation(summary = "Update Experience", description = "Updates an existing experience entry.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Experience updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid experience updates\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this experience entry\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Experience or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Experience entry not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/experience/{experienceId}")
    public ResponseEntity<ExperienceResponseDto> updateExperience(
            @Parameter(description = "ID of the experience entry") @PathVariable Long experienceId,
            @RequestBody UpdateExperienceRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateExperience(userId, experienceId, dto));
    }

    /**
     * DELETE /api/profile/experience/{experienceId}
     */
    @Operation(summary = "Delete Experience", description = "Deletes an experience entry.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Experience deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this experience entry\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Experience or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Experience entry not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/experience/{experienceId}")
    public ResponseEntity<Void> deleteExperience(
            @Parameter(description = "ID of the experience entry") @PathVariable Long experienceId) {
        Long userId = getCurrentUserId();
        profileService.deleteExperience(userId, experienceId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // /profile/skill (POST)
    // /profile/skill/{skill_id} (PUT, DELETE)
    // ------------------------------

    /**
     * POST /api/profile/skill
     */
    @Operation(summary = "Add Skill", description = "Adds a skill to the authenticated user's profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Skill added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid skill data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/skill")
    public ResponseEntity<SkillResponseDto> addSkill(@Valid @RequestBody CreateSkillRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addSkill(userId, dto));
    }

    /**
     * PUT /api/profile/skill/{skillId}
     */
    @Operation(summary = "Update Skill", description = "Updates an existing skill.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Skill updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid skill updates\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this skill\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Skill or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Skill not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/skill/{skillId}")
    public ResponseEntity<SkillResponseDto> updateSkill(
            @Parameter(description = "ID of the skill") @PathVariable Long skillId,
            @RequestBody UpdateSkillRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateSkill(userId, skillId, dto));
    }

    /**
     * DELETE /api/profile/skill/{skillId}
     */
    @Operation(summary = "Delete Skill", description = "Deletes a skill from the profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Skill deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this skill\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Skill or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Skill not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/skill/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @Parameter(description = "ID of the skill") @PathVariable Long skillId) {
        Long userId = getCurrentUserId();
        profileService.deleteSkill(userId, skillId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // /profile/interest (POST)
    // /profile/interest/{interest_id} (PUT, DELETE)
    // ------------------------------

    /**
     * POST /api/profile/interest
     */
    @Operation(summary = "Add Interest", description = "Adds an interest to the authenticated user's profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Interest added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid interest data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Profile not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/interest")
    public ResponseEntity<InterestResponseDto> addInterest(@Valid @RequestBody CreateInterestRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addInterest(userId, dto));
    }

    /**
     * PUT /api/profile/interest/{interestId}
     */
    @Operation(summary = "Update Interest", description = "Updates an existing interest.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Interest updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid interest updates\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this interest\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Interest or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Interest not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/interest/{interestId}")
    public ResponseEntity<InterestResponseDto> updateInterest(
            @Parameter(description = "ID of the interest") @PathVariable Long interestId,
            @RequestBody UpdateInterestRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateInterest(userId, interestId, dto));
    }

    /**
     * DELETE /api/profile/interest/{interestId}
     */
    @Operation(summary = "Delete Interest", description = "Deletes an interest from the profile.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Interest deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this interest\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Interest or profile not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Interest not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/interest/{interestId}")
    public ResponseEntity<Void> deleteInterest(
            @Parameter(description = "ID of the interest") @PathVariable Long interestId) {
        Long userId = getCurrentUserId();
        profileService.deleteInterest(userId, interestId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------
    // helper: current user
    // ------------------------------
    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails ud) {
            User user = userRepository.findByUsername(ud.getUsername())
                    .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));
            return user.getId();
        }
        throw new HandleException(ErrorCode.INVALID_CREDENTIALS, "Invalid authentication context");
    }
}