package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private AdminProfileService adminProfileService;

    private Profile testProfile;

    @BeforeEach
    void setUp() {
        testProfile = new Profile();
        testProfile.setId(1L);
        testProfile.setFirstName("John");
        testProfile.setLastName("Doe");
    }

    @Test
    void deleteProfile_Success_DeletesProfile() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(testProfile));
        adminProfileService.deleteProfile(1L, "Inappropriate content");
        verify(profileRepository).delete(testProfile);
    }

    @Test
    void deleteProfile_NotFound_ThrowsException() {
        when(profileRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminProfileService.deleteProfile(999L, "Test"));

        verify(profileRepository, never()).delete(any());
    }

    @Test
    void deleteProfile_WithReason_ProcessesCorrectly() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(testProfile));
        String reason = "Fake profile information";
        adminProfileService.deleteProfile(1L, reason);
        verify(profileRepository).delete(testProfile);
    }

    @Test
    void deleteProfile_NullReason_StillDeletes() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(testProfile));
        adminProfileService.deleteProfile(1L, null);
        verify(profileRepository).delete(testProfile);
    }

    @Test
    void deleteProfile_JpaCascadeHandlesBadges() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(testProfile));
        adminProfileService.deleteProfile(1L, "Test");
        verify(profileRepository).delete(testProfile);
    }
}
