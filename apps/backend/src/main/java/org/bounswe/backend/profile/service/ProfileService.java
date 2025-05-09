package org.bounswe.backend.profile.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.backend.profile.dto.*;
import org.bounswe.backend.profile.entity.*;
import org.bounswe.backend.profile.repository.*;
import org.bounswe.backend.user.dto.UserDto;
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
                .user(toDto(user))
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















    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .userType(user.getUserType())
                .build();
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
