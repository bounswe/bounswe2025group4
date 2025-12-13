package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.admin.dto.BanUserRequest;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorshipRequestRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.mentorship.model.MentorProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @Mock
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private EmployerWorkplaceRepository employerWorkplaceRepository;

    @Mock
    private AdminWorkplaceService adminWorkplaceService;

    @InjectMocks
    private AdminUserService adminUserService;

    private User testUser;
    private Profile testProfile;
    private BanUserRequest banRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setIsBanned(false);

        testProfile = new Profile();
        testProfile.setId(1L);
        testProfile.setUser(testUser);

        banRequest = new BanUserRequest("Spam content");
    }

    @Test
    void banUser_Success_SetsUserBanned() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        assertTrue(testUser.getIsBanned());
        assertEquals("Spam content", testUser.getBanReason());
        verify(userRepository).save(testUser);
        verify(userRepository).flush(); // Immediate update
    }

    @Test
    void banUser_UserNotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class, () -> adminUserService.banUser(999L, banRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void banUser_AlreadyBanned_ThrowsException() {
        testUser.setIsBanned(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        assertThrows(HandleException.class, () -> adminUserService.banUser(1L, banRequest));
    }

    @Test
    void banUser_DeletesProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        verify(profileRepository).delete(testProfile);
        verify(profileRepository).flush(); // Immediate deletion
    }

    @Test
    void banUser_DeletesAllBadges() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        verify(badgeRepository).deleteAllByUserId(1L);
    }

    @Test
    void banUser_DeletesMentorProfileAndRequests_WhenUserIsMentor() {
        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(10L);
        mentorProfile.setUser(testUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(mentorProfile));
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        verify(mentorshipRequestRepository).deleteAllByMentorId(10L);
        verify(mentorProfileRepository).delete(mentorProfile);
    }

    @Test
    void banUser_DeletesAllJobApplications() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        verify(jobApplicationRepository).deleteAllByJobSeekerId(1L);
    }

    @Test
    void banUser_DeletesOwnedWorkplaces_NotMemberWorkplaces() {
        Workplace ownedWorkplace1 = new Workplace();
        ownedWorkplace1.setId(100L);
        Workplace ownedWorkplace2 = new Workplace();
        ownedWorkplace2.setId(200L);

        EmployerWorkplace ew1 = new EmployerWorkplace();
        ew1.setWorkplace(ownedWorkplace1);
        ew1.setRole(EmployerRole.OWNER);

        EmployerWorkplace ew2 = new EmployerWorkplace();
        ew2.setWorkplace(ownedWorkplace2);
        ew2.setRole(EmployerRole.OWNER);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of(ew1, ew2));
        adminUserService.banUser(1L, banRequest);
        verify(adminWorkplaceService).deleteWorkplace(100L, "Owner banned: Spam content");
        verify(adminWorkplaceService).deleteWorkplace(200L, "Owner banned: Spam content");
        verify(adminWorkplaceService, times(2)).deleteWorkplace(anyLong(), anyString());
    }

    @Test
    void banUser_PreservesForumContent() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of());
        adminUserService.banUser(1L, banRequest);
        assertTrue(true);
    }

    @Test
    void banUser_CompleteFlow_AllCascadeOperations() {
        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(10L);

        Workplace ownedWorkplace = new Workplace();
        ownedWorkplace.setId(100L);
        EmployerWorkplace ew = new EmployerWorkplace();
        ew.setWorkplace(ownedWorkplace);
        ew.setRole(EmployerRole.OWNER);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(mentorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(mentorProfile));
        when(employerWorkplaceRepository.findByUser_IdAndRole(1L, EmployerRole.OWNER))
                .thenReturn(List.of(ew));
        adminUserService.banUser(1L, banRequest);
        assertTrue(testUser.getIsBanned());
        verify(userRepository).flush();
        verify(profileRepository).delete(testProfile);
        verify(profileRepository).flush();
        verify(badgeRepository).deleteAllByUserId(1L);
        verify(mentorshipRequestRepository).deleteAllByMentorId(10L);
        verify(mentorProfileRepository).delete(mentorProfile);
        verify(jobApplicationRepository).deleteAllByJobSeekerId(1L);
        verify(adminWorkplaceService).deleteWorkplace(100L, "Owner banned: Spam content");
    }
}
