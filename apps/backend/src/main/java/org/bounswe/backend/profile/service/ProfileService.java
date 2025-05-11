package org.bounswe.backend.profile.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.backend.profile.dto.*;
import org.bounswe.backend.profile.entity.*;
import org.bounswe.backend.profile.repository.*;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final UserBadgeRepository badgeRepository;

    @Transactional(readOnly = true)
    public FullProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<ExperienceDto> experience = experienceRepository.findByUserId(userId)
                .stream().map(this::toDto).collect(Collectors.toList());

        List<EducationDto> education = educationRepository.findByUserId(userId)
                .stream().map(this::toDto).collect(Collectors.toList());

        List<BadgeDto> badges = badgeRepository.findByUserId(userId)
                .stream().map(this::toDto).collect(Collectors.toList());

        return FullProfileDto.builder()
                .profile(toDto(profile))
                .experience(experience)
                .education(education)
                .badges(badges)
                .build();
    }


    @Transactional
    public ProfileDto createProfile(Long userId, CreateProfileRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if profile already exists
        if (profileRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Profile already exists for this user");
        }

        Profile profile = Profile.builder()
                .user(user)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .location(dto.getLocation())
                .occupation(dto.getOccupation())
                .bio(dto.getBio())
                .profilePicture(dto.getProfilePicture())
                .skills(dto.getSkills())
                .interests(dto.getInterests())
                .build();

        return toDto(profileRepository.save(profile));
    }


    @Transactional
    public ProfileDto updateProfile(Long userId, UpdateProfileRequestDto dto) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (dto.getFullName() != null) profile.setFullName(dto.getFullName());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation());
        if (dto.getOccupation() != null) profile.setOccupation(dto.getOccupation());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getProfilePicture() != null) profile.setProfilePicture(dto.getProfilePicture());
        if (dto.getSkills() != null) profile.setSkills(dto.getSkills());
        if (dto.getInterests() != null) profile.setInterests(dto.getInterests());

        return toDto(profileRepository.save(profile));
    }


    @Transactional
    public ProfileDto updateSkills(Long userId, List<String> skills) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setSkills(skills);
        Profile updated = profileRepository.save(profile);

        return toDto(updated);
    }


    @Transactional
    public ProfileDto updateInterests(Long userId, List<String> interests) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setInterests(interests);
        Profile updated = profileRepository.save(profile);
        return toDto(updated);
    }


    @Transactional
    public EducationDto addEducation(Long userId, CreateEducationRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Education education = Education.builder()
                .school(dto.getSchool())
                .degree(dto.getDegree())
                .field(dto.getField())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .user(user)
                .build();

        return toDto(educationRepository.save(education));
    }


    @Transactional
    public EducationDto updateEducation(Long userId, Long eduId, UpdateEducationRequestDto dto) {
        Education education = educationRepository.findById(eduId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized update attempt");
        }

        if (dto.getSchool() != null) education.setSchool(dto.getSchool());
        if (dto.getDegree() != null) education.setDegree(dto.getDegree());
        if (dto.getField() != null) education.setField(dto.getField());
        if (dto.getStartDate() != null) education.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) education.setEndDate(dto.getEndDate());

        return toDto(educationRepository.save(education));
    }

    @Transactional
    public void deleteEducation(Long userId, Long eduId) {
        Education education = educationRepository.findById(eduId)
                .orElseThrow(() -> new RuntimeException("Education not found"));

        if (!education.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized delete attempt");
        }

        educationRepository.delete(education);
    }



    @Transactional(readOnly = true)
    public List<BadgeDto> getBadgesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return badgeRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public BadgeDto addBadge(Long userId, CreateBadgeRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserBadge badge = UserBadge.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .earnedAt(java.time.LocalDateTime.now())
                .user(user)
                .build();

        return toDto(badgeRepository.save(badge));
    }

    @Transactional
    public void deleteBadge(Long userId, Long badgeId) {
        UserBadge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        if (!badge.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this badge.");
        }

        badgeRepository.delete(badge);
    }




    @Transactional
    public ExperienceDto addExperience(Long userId, CreateExperienceRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Experience experience = Experience.builder()
                .company(dto.getCompany())
                .position(dto.getPosition())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .user(user)
                .build();

        return toDto(experienceRepository.save(experience));
    }

    @Transactional
    public ExperienceDto updateExperience(Long userId, Long expId, UpdateExperienceRequestDto dto) {
        Experience experience = experienceRepository.findById(expId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        if (!experience.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this experience");
        }

        if (dto.getCompany() != null) experience.setCompany(dto.getCompany());
        if (dto.getPosition() != null) experience.setPosition(dto.getPosition());
        if (dto.getDescription() != null) experience.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) experience.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) experience.setEndDate(dto.getEndDate());

        return toDto(experienceRepository.save(experience));
    }


    @Transactional
    public void deleteExperience(Long userId, Long expId) {
        Experience experience = experienceRepository.findById(expId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        if (!experience.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this experience");
        }

        experienceRepository.delete(experience);
    }



    @Transactional
    public ProfileDto updateProfilePicture(Long userId, String profilePicture) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setProfilePicture(profilePicture);
        return toDto(profileRepository.save(profile));
    }

    @Transactional
    public void deleteProfilePicture(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setProfilePicture(null);
        profileRepository.save(profile);
    }

    @Transactional
    public String getProfilePicture(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return profile.getProfilePicture();
    }



    private ProfileDto toDto(Profile profile) {
        return ProfileDto.builder() 
                .id(profile.getId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .occupation(profile.getOccupation())
                .bio(profile.getBio())
                .profilePicture(profile.getProfilePicture())
                .skills(profile.getSkills())
                .interests(profile.getInterests())
                .userId(profile.getUser().getId())
                .build();
    }

    private ExperienceDto toDto(Experience exp) {
        return ExperienceDto.builder()
                .id(exp.getId())
                .company(exp.getCompany())
                .position(exp.getPosition())
                .description(exp.getDescription())
                .startDate(exp.getStartDate())
                .endDate(exp.getEndDate())
                .build();
    }

    private EducationDto toDto(Education edu) {
        return EducationDto.builder()
                .id(edu.getId())
                .school(edu.getSchool())
                .degree(edu.getDegree())
                .field(edu.getField())
                .startDate(edu.getStartDate())
                .endDate(edu.getEndDate())
                .build();
    }

    private BadgeDto toDto(UserBadge badge) {
        return BadgeDto.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .earnedAt(badge.getEarnedAt())
                .build();
    }
}
