package org.bounswe.jobboardbackend.profile.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.profile.dto.*;
import org.bounswe.jobboardbackend.profile.service.ProfileService;
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
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    // ---------------------------
    // /profile (POST, GET, PUT)
    // ---------------------------

    /**
     * POST /api/profile
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ProfileResponseDto> createProfile(@Valid @RequestBody CreateProfileRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.createProfile(userId, dto));
    }

    /**
     * GET /api/profile
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ProfileResponseDto> getMyProfile() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.getFullProfile(userId));
    }

    /**
     * PUT /api/profile
     */
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
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{userId}")
    public ResponseEntity<PublicProfileResponseDto> getPublicProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId));
    }

    // --------------------------------
    // /profile/image (POST, DELETE)
    // --------------------------------

    /**
     * POST /api/profile/image
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping(path = "/image", consumes = {"multipart/form-data"})
    public ResponseEntity<ProfileImageResponseDto> uploadImage(@RequestPart("file") MultipartFile file) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.uploadImage(userId, file));
    }

    /**
     * DELETE /api/profile/image
     */
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
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/education")
    public ResponseEntity<EducationResponseDto> addEducation(@Valid @RequestBody CreateEducationRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addEducation(userId, dto));
    }

    /**
     * PUT /api/profile/education/{educationId}
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/education/{educationId}")
    public ResponseEntity<EducationResponseDto> updateEducation(@PathVariable Long educationId,
                                                                @RequestBody UpdateEducationRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateEducation(userId, educationId, dto));
    }

    /**
     * DELETE /api/profile/education/{educationId}
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/education/{educationId}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long educationId) {
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
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/experience")
    public ResponseEntity<ExperienceResponseDto> addExperience(@Valid @RequestBody CreateExperienceRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addExperience(userId, dto));
    }

    /**
     * PUT /api/profile/experience/{experienceId}
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/experience/{experienceId}")
    public ResponseEntity<ExperienceResponseDto> updateExperience(@PathVariable Long experienceId,
                                                                  @RequestBody UpdateExperienceRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateExperience(userId, experienceId, dto));
    }

    /**
     * DELETE /api/profile/experience/{experienceId}
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/experience/{experienceId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long experienceId) {
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
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/skill")
    public ResponseEntity<SkillResponseDto> addSkill(@Valid @RequestBody CreateSkillRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addSkill(userId, dto));
    }

    /**
     * PUT /api/profile/skill/{skillId}
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/skill/{skillId}")
    public ResponseEntity<SkillResponseDto> updateSkill(@PathVariable Long skillId,
                                                        @RequestBody UpdateSkillRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateSkill(userId, skillId, dto));
    }

    /**
     * DELETE /api/profile/skill/{skillId}
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/skill/{skillId}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long skillId) {
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
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/interest")
    public ResponseEntity<InterestResponseDto> addInterest(@Valid @RequestBody CreateInterestRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.addInterest(userId, dto));
    }

    /**
     * PUT /api/profile/interest/{interestId}
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/interest/{interestId}")
    public ResponseEntity<InterestResponseDto> updateInterest(@PathVariable Long interestId,
                                                              @RequestBody UpdateInterestRequestDto dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(profileService.updateInterest(userId, interestId, dto));
    }

    /**
     * DELETE /api/profile/interest/{interestId}
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/interest/{interestId}")
    public ResponseEntity<Void> deleteInterest(@PathVariable Long interestId) {
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