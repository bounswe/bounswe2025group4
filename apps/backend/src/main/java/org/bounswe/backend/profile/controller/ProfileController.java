package org.bounswe.backend.profile.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.bounswe.backend.profile.dto.*;
import org.bounswe.backend.profile.service.ProfileService;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    
    @Value("${file.upload-dir}")
    private String uploadDir;

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

    @PatchMapping("/profile/{userId}/skills")
    public ResponseEntity<ProfileDto> updateSkills(@PathVariable Long userId,
                                                   @RequestBody SkillUpdateRequestDto request) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(profileService.updateSkills(userId, request.getSkills()));
    }

    @PatchMapping("/profile/{userId}/interests")
    public ResponseEntity<ProfileDto> updateInterests(@PathVariable Long userId,
                                                      @RequestBody InterestUpdateRequestDto request) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(profileService.updateInterests(userId, request.getInterests()));
    }


    @PatchMapping("/profile/{userId}/profile-picture")
    public ResponseEntity<String> updateProfilePicture(@PathVariable Long userId,
                                                      @RequestParam("file") MultipartFile file) {         
                                                        
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        try{
            if(file.isEmpty()){
                return ResponseEntity.badRequest().body("File is empty");
            }
            if(file.getSize() > 1024 * 1024 * 2){
                return ResponseEntity.badRequest().body("File is too large");
            }

            String fileName = "user_" + userId + "_profile_picture." + file.getOriginalFilename();
            String filePath = Paths.get(uploadDir).resolve(fileName).normalize().toString();
            Files.createDirectories(Paths.get(uploadDir));
            file.transferTo(new File(filePath));

            // Delete old profile picture
            String oldFileName = profileService.getProfilePicture(userId);
            if(oldFileName != null && !oldFileName.contains("placeholder")){
                Path oldFilePath = Paths.get(uploadDir).resolve(oldFileName).normalize();
                File oldFile = oldFilePath.toFile();
                if(oldFile.exists()){
                    oldFile.delete();
                }
            }

            // Save file name to database
            profileService.updateProfilePicture(userId, fileName);

            return ResponseEntity.ok("Uploaded successfully: " + fileName);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/profile/{userId}/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable Long userId) {
        // Retreive file path from database
        String fileName = profileService.getProfilePicture(userId);
        Path filePath = Paths.get(uploadDir, fileName);
        File file = filePath.toFile();
        if(!file.exists()){
            return ResponseEntity.notFound().build();
        }

        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
            if(resource.exists() || resource.isReadable()){
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(Files.probeContentType(filePath)))
                    .body(resource);
            }
            else{
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/profile/{userId}/profile-picture")
    public ResponseEntity<Void> deleteProfilePicture(@PathVariable Long userId) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        profileService.deleteProfilePicture(userId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }





    @PostMapping("/profile/{userId}/education")
    public ResponseEntity<EducationDto> addEducation(@PathVariable Long userId,
                                                     @Valid @RequestBody CreateEducationRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.addEducation(userId, dto));
    }


    @PutMapping("/profile/{userId}/education/{eduId}")
    public ResponseEntity<EducationDto> updateEducation(@PathVariable Long userId,
                                                        @PathVariable Long eduId,
                                                        @RequestBody UpdateEducationRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(profileService.updateEducation(userId, eduId, dto));
    }


    @DeleteMapping("/profile/{userId}/education/{eduId}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long userId,
                                                @PathVariable Long eduId) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        profileService.deleteEducation(userId, eduId);
        return ResponseEntity.noContent().build();
    }





    @PostMapping("/profile/{userId}/experience")
    public ResponseEntity<ExperienceDto> addExperience(@PathVariable Long userId,
                                                       @Valid @RequestBody CreateExperienceRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.addExperience(userId, dto));
    }

    @PutMapping("/profile/{userId}/experience/{expId}")
    public ResponseEntity<ExperienceDto> updateExperience(@PathVariable Long userId,
                                                          @PathVariable Long expId,
                                                          @RequestBody UpdateExperienceRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.updateExperience(userId, expId, dto));
    }

    @DeleteMapping("/profile/{userId}/experience/{expId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long userId, @PathVariable Long expId) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        profileService.deleteExperience(userId, expId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }


    @GetMapping("/profile/{userId}/badges")
    public ResponseEntity<List<BadgeDto>> getBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getBadgesByUserId(userId));
    }


    @PostMapping("/profile/{userId}/badges")
    public ResponseEntity<BadgeDto> addBadge(@PathVariable Long userId,
                                             @Valid @RequestBody CreateBadgeRequestDto dto) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(profileService.addBadge(userId, dto));
    }


    @DeleteMapping("/profile/{userId}/badges/{badgeId}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long userId,
                                            @PathVariable Long badgeId) {
        User user = getCurrentUser();
        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        profileService.deleteBadge(userId, badgeId);
        return ResponseEntity.noContent().build();
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
