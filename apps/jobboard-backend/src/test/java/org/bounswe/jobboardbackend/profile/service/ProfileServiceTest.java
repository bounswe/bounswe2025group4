package org.bounswe.jobboardbackend.profile.service;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.dto.CreateProfileRequestDto;
import org.bounswe.jobboardbackend.profile.dto.ProfileResponseDto;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void createProfile_whenValidRequest_returnsProfileResponseDto() {
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .username("testuser")
                .role(Role.ROLE_JOBSEEKER)
                .build();

        CreateProfileRequestDto dto = CreateProfileRequestDto.builder()
                .firstName("John")
                .lastName("Doe")
                .bio("Test bio")
                .gender("Test gender")
                .build();

        Profile profile = Profile.builder()
                .id(1L)
                .user(user)
                .firstName("John")
                .lastName("Doe")
                .bio("Test bio")
                .gender("Test gender")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(profileRepository.save(any(Profile.class))).thenReturn(profile);

        ProfileResponseDto result = profileService.createProfile(userId, dto);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getBio()).isEqualTo("Test bio");
        assertThat(result.getGender()).isEqualTo("Test gender");
    }
}
