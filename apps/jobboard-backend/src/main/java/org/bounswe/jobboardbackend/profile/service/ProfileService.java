package org.bounswe.jobboardbackend.profile.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.dto.*;
import org.bounswe.jobboardbackend.profile.model.*;
import org.bounswe.jobboardbackend.profile.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.net.URL;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final SkillRepository skillRepository;
    private final InterestRepository interestRepository;

    // === GCS config ===
    @Value("${app.gcs.bucket}")
    private String gcsBucket;

    @Value("${app.gcs.folderPrefix:profiles/}")
    private String gcsFolderPrefix;

    @Value("${app.gcs.public:true}")
    private boolean gcsPublic;

    @Value("${app.gcs.publicBaseUrl:https://storage.googleapis.com}")
    private String gcsPublicBaseUrl;

    // Google Cloud Storage client
    private final Storage storage = StorageOptions.getDefaultInstance().getService();

    // =========================
    // PROFILE
    // =========================

    @Transactional
    public ProfileResponseDto createProfile(Long userId, CreateProfileRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (profileRepository.findByUserId(userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Profile already exists for this user");
        }

        Profile profile = Profile.builder()
                .user(user)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .bio(dto.getBio())
                .imageUrl(null)
                .build();

        profile = profileRepository.save(profile);
        return toProfileDto(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponseDto getFullProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return toProfileDto(profile);
    }

    @Transactional
    public ProfileResponseDto updateProfile(Long userId, UpdateProfileRequestDto dto) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        if (dto.getFirstName() != null) profile.setFirstName(dto.getFirstName());
        if (dto.getLastName()  != null) profile.setLastName(dto.getLastName());
        if (dto.getBio()       != null) profile.setBio(dto.getBio());

        return toProfileDto(profile);
    }

    @Transactional(readOnly = true)
    public PublicProfileResponseDto getPublicProfile(Long userId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        return PublicProfileResponseDto.builder()
                .userId(p.getUser().getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .bio(p.getBio())
                .imageUrl(p.getImageUrl())
                .educations(p.getEducations().stream().map(this::toEducationDto).collect(Collectors.toList()))
                .experiences(p.getExperiences().stream().map(this::toExperienceDto).collect(Collectors.toList()))
                .build();
    }

    // =========================
    // IMAGE (GCS integration)
    // =========================

    private String buildObjectNameForUser(Long userId, String originalFilename) {
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".jpg";
        return gcsFolderPrefix + userId + "/" + java.util.UUID.randomUUID() + ext;
    }

    private String publicUrl(String objectName) {
        return gcsPublicBaseUrl + "/" + gcsBucket + "/" + objectName;
    }

    private String extractObjectNameFromUrl(String url) {
        String prefix = gcsPublicBaseUrl + "/" + gcsBucket + "/";
        if (url != null && url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        return null;
    }

    private String uploadToGcs(byte[] content, String contentType, String objectName) {
        BlobInfo info = BlobInfo.newBuilder(gcsBucket, objectName)
                .setContentType(contentType != null ? contentType : "application/octet-stream")
                .build();
        storage.create(info, content);
        if (gcsPublic) {
            return publicUrl(objectName);
        } else {
            URL signed = storage.signUrl(
                    BlobInfo.newBuilder(gcsBucket, objectName).build(),
                    15, TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.httpMethod(HttpMethod.GET)
            );
            return signed.toString();
        }
    }

    private void deleteFromGcs(String objectName) {
        if (objectName == null) return;
        try {
            storage.delete(gcsBucket, objectName);
        } catch (StorageException ignore) {
        }
    }

    @Transactional
    public ProfileImageResponseDto uploadImage(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        if (p.getImageUrl() != null) {
            String oldObject = extractObjectNameFromUrl(p.getImageUrl());
            if (oldObject != null) {
                deleteFromGcs(oldObject);
            }
        }

        String objectName = buildObjectNameForUser(userId, file.getOriginalFilename());
        String url;
        try {
            url = uploadToGcs(file.getBytes(), ct, objectName);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed", e);
        }

        p.setImageUrl(url);

        return ProfileImageResponseDto.builder()
                .imageUrl(url)
                .updatedAt(Instant.now())
                .build();
    }

    @Transactional
    public void deleteImage(Long userId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        if (p.getImageUrl() != null) {
            String objectName = extractObjectNameFromUrl(p.getImageUrl());
            if (objectName != null) {
                deleteFromGcs(objectName);
            }
            p.setImageUrl(null);
        }
    }

    // =========================
    // EDUCATION
    // =========================

    @Transactional
    public EducationResponseDto addEducation(Long userId, CreateEducationRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Education e = Education.builder()
                .profile(p)
                .school(dto.getSchool())
                .degree(dto.getDegree())
                .field(dto.getField())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .description(dto.getDescription())
                .build();

        e = educationRepository.save(e);
        return toEducationDto(e);
    }

    @Transactional
    public EducationResponseDto updateEducation(Long userId, Long eduId, UpdateEducationRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Education e = educationRepository.findByIdAndProfileId(eduId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found"));

        if (dto.getSchool()      != null) e.setSchool(dto.getSchool());
        if (dto.getDegree()      != null) e.setDegree(dto.getDegree());
        if (dto.getField()       != null) e.setField(dto.getField());
        if (dto.getStartDate()   != null) e.setStartDate(dto.getStartDate());
        if (dto.getEndDate()     != null) e.setEndDate(dto.getEndDate());
        if (dto.getDescription() != null) e.setDescription(dto.getDescription());

        return toEducationDto(e);
    }

    @Transactional
    public void deleteEducation(Long userId, Long eduId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Education e = educationRepository.findByIdAndProfileId(eduId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found"));

        educationRepository.delete(e);
    }

    // =========================
    // EXPERIENCE
    // =========================

    @Transactional
    public ExperienceResponseDto addExperience(Long userId, CreateExperienceRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Experience ex = Experience.builder()
                .profile(p)
                .company(dto.getCompany())
                .position(dto.getPosition())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        ex = experienceRepository.save(ex);
        return toExperienceDto(ex);
    }

    @Transactional
    public ExperienceResponseDto updateExperience(Long userId, Long expId, UpdateExperienceRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Experience ex = experienceRepository.findByIdAndProfileId(expId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found"));

        if (dto.getCompany()     != null) ex.setCompany(dto.getCompany());
        if (dto.getPosition()    != null) ex.setPosition(dto.getPosition());
        if (dto.getDescription() != null) ex.setDescription(dto.getDescription());
        if (dto.getStartDate()   != null) ex.setStartDate(dto.getStartDate());
        if (dto.getEndDate()     != null) ex.setEndDate(dto.getEndDate());

        return toExperienceDto(ex);
    }

    @Transactional
    public void deleteExperience(Long userId, Long expId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Experience ex = experienceRepository.findByIdAndProfileId(expId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found"));

        experienceRepository.delete(ex);
    }

    // =========================
    // SKILL
    // =========================

    @Transactional
    public SkillResponseDto addSkill(Long userId, CreateSkillRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Skill s = Skill.builder()
                .profile(p)
                .name(dto.getName())
                .level(dto.getLevel())
                .build();

        s = skillRepository.save(s);
        return toSkillDto(s);
    }

    @Transactional
    public SkillResponseDto updateSkill(Long userId, Long skillId, UpdateSkillRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Skill s = skillRepository.findByIdAndProfileId(skillId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found"));

        if (dto.getName()  != null) s.setName(dto.getName());
        if (dto.getLevel() != null) s.setLevel(dto.getLevel());

        return toSkillDto(s);
    }

    @Transactional
    public void deleteSkill(Long userId, Long skillId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Skill s = skillRepository.findByIdAndProfileId(skillId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found"));

        skillRepository.delete(s);
    }

    // =========================
    // INTEREST
    // =========================

    @Transactional
    public InterestResponseDto addInterest(Long userId, CreateInterestRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Interest i = Interest.builder()
                .profile(p)
                .name(dto.getName())
                .build();

        i = interestRepository.save(i);
        return toInterestDto(i);
    }

    @Transactional
    public InterestResponseDto updateInterest(Long userId, Long interestId, UpdateInterestRequestDto dto) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Interest i = interestRepository.findByIdAndProfileId(interestId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interest not found"));

        if (dto.getName() != null) i.setName(dto.getName());
        return toInterestDto(i);
    }

    @Transactional
    public void deleteInterest(Long userId, Long interestId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Interest i = interestRepository.findByIdAndProfileId(interestId, p.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interest not found"));

        interestRepository.delete(i);
    }

    // =========================
    // MAPPERS
    // =========================

    private ProfileResponseDto toProfileDto(Profile p) {
        return ProfileResponseDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .bio(p.getBio())
                .imageUrl(p.getImageUrl())
                .educations(p.getEducations().stream().map(this::toEducationDto).collect(java.util.stream.Collectors.toList()))
                .experiences(p.getExperiences().stream().map(this::toExperienceDto).collect(java.util.stream.Collectors.toList()))
                .skills(p.getSkills().stream().map(this::toSkillDto).collect(java.util.stream.Collectors.toList()))
                .interests(p.getInterests().stream().map(this::toInterestDto).collect(java.util.stream.Collectors.toList()))
                .badges(null) 
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private EducationResponseDto toEducationDto(Education e) {
        return EducationResponseDto.builder()
                .id(e.getId())
                .school(e.getSchool())
                .degree(e.getDegree())
                .field(e.getField())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .description(e.getDescription())
                .build();
    }

    private ExperienceResponseDto toExperienceDto(Experience e) {
        return ExperienceResponseDto.builder()
                .id(e.getId())
                .company(e.getCompany())
                .position(e.getPosition())
                .description(e.getDescription())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .build();
    }

    private SkillResponseDto toSkillDto(Skill s) {
        return SkillResponseDto.builder()
                .id(s.getId())
                .name(s.getName())
                .level(s.getLevel())
                .build();
    }

    private InterestResponseDto toInterestDto(Interest i) {
        return InterestResponseDto.builder()
                .id(i.getId())
                .name(i.getName())
                .build();
    }
}