package org.bounswe.backend.profile.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UnauthorizedUserException;
import org.bounswe.backend.common.exception.ProfileAlreadyExistsException;
import org.bounswe.backend.profile.dto.*;
import org.bounswe.backend.profile.entity.*;
import org.bounswe.backend.profile.repository.*;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
                .orElseThrow(() -> new NotFoundException("User"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

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
                .orElseThrow(() -> new NotFoundException("User"));

        // Check if profile already exists
        if (profileRepository.findByUserId(userId).isPresent()) {
            throw new ProfileAlreadyExistsException(user.getUsername());
        }

        Profile profile = Profile.builder()
                .user(user)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .location(dto.getLocation())
                .occupation(dto.getOccupation())
                .bio(dto.getBio())
                .skills(dto.getSkills())
                .interests(dto.getInterests())
                .profilePicture("placeholder.png") // default profile picture
                .build();

        return toDto(profileRepository.save(profile));
    }


    @Transactional
    public ProfileDto updateProfile(Long userId, UpdateProfileRequestDto dto) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

        if (dto.getFullName() != null) profile.setFullName(dto.getFullName());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation());
        if (dto.getOccupation() != null) profile.setOccupation(dto.getOccupation());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getSkills() != null) profile.setSkills(dto.getSkills());
        if (dto.getInterests() != null) profile.setInterests(dto.getInterests());

        return toDto(profileRepository.save(profile));
    }


    @Transactional
    public ProfileDto updateSkills(Long userId, List<String> skills) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

        profile.setSkills(skills);
        Profile updated = profileRepository.save(profile);

        return toDto(updated);
    }


    @Transactional
    public ProfileDto updateInterests(Long userId, List<String> interests) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

        profile.setInterests(interests);
        Profile updated = profileRepository.save(profile);
        return toDto(updated);
    }


    @Transactional
    public EducationDto addEducation(Long userId, CreateEducationRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User"));

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
                .orElseThrow(() -> new NotFoundException("Education"));

        if (!education.getUser().getId().equals(userId)) {
            throw new UnauthorizedUserException("Tried to update education of different user");
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
                .orElseThrow(() -> new NotFoundException("Education"));

        if (!education.getUser().getId().equals(userId)) {
            throw new UnauthorizedUserException("Tried to delete education of different user");
        }

        educationRepository.delete(education);
    }



    @Transactional(readOnly = true)
    public List<BadgeDto> getBadgesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User"));

        return badgeRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public BadgeDto addBadge(Long userId, CreateBadgeRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User"));

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
                .orElseThrow(() -> new NotFoundException("Badge"));

        if (!badge.getUser().getId().equals(userId)) {
            throw new UnauthorizedUserException("Tried to delete badge of another user");
        }

        badgeRepository.delete(badge);
    }




    @Transactional
    public ExperienceDto addExperience(Long userId, CreateExperienceRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User"));

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
                .orElseThrow(() -> new NotFoundException("Experience"));

        if (!experience.getUser().getId().equals(userId)) {
            throw new UnauthorizedUserException("Tried to update experience of different user");
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
                .orElseThrow(() -> new NotFoundException("Experience"));

        if (!experience.getUser().getId().equals(userId)) {
            throw new UnauthorizedUserException("Tried to delete experience of different user");
        }

        experienceRepository.delete(experience);
    }



    @Transactional
    public ProfileDto updateProfilePicture(Long userId, String fileName) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

        profile.setProfilePicture(fileName);
        return toDto(profileRepository.save(profile));
    }

    @Transactional
    public void deleteProfilePicture(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile"));

        profile.setProfilePicture("placeholder.png");
        profileRepository.save(profile);
    }

    @Transactional
    public String getProfilePicture(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        return profile.getProfilePicture();
    }



    private ProfileDto toDto(Profile profile) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return ProfileDto.builder() 
                .id(profile.getId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .occupation(profile.getOccupation())
                .bio(profile.getBio())
                .profilePicture(profile.getProfilePicture() != null
                        ? baseUrl + "/api/profile/" + profile.getUser().getId() + "/profile-picture" : null)
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
