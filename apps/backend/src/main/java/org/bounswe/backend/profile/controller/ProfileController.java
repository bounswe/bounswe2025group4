package org.bounswe.backend.profile.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.backend.profile.dto.*;
import org.bounswe.backend.profile.service.ProfileService;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    public ProfileController(ProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<FullProfileDto> getMyProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(profileService.getProfileByUserId(user.getId()));
    }

    @GetMapping("profile/{userId}")
    public ResponseEntity<FullProfileDto> getProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @PostMapping("/profile")
    public ResponseEntity<ProfileDto> createProfile(@Valid @RequestBody CreateProfileRequestDto dto) {
        User user = getCurrentUser();
        return ResponseEntity.ok(profileService.createProfile(user.getId(), dto));
    }

    @PatchMapping("/profile/{userId}")
    public ResponseEntity<ProfileDto> updateProfile(@PathVariable Long userId,
                                                    @Valid @RequestBody UpdateProfileRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.updateProfile(userId, dto));
    }


    @PostMapping("/profile/{userId}/experience")
    public ResponseEntity<?> addExperience(@PathVariable Long userId,
                                           @Valid @RequestBody CreateExperienceRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.addExperience(userId, dto));
    }





    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new RuntimeException("Invalid authentication context");
    }
}
