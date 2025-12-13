package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.model.MentorProfile;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
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
class AdminMentorServiceTest {

    @Mock
    private MentorProfileRepository mentorProfileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MentorshipService mentorshipService;

    @InjectMocks
    private AdminMentorService adminMentorService;

    private MentorProfile testMentor;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(10L);
        testUser.setUsername("mentor1");
        testUser.setIsMentorBanned(false);

        testMentor = new MentorProfile();
        testMentor.setId(1L);
        testMentor.setUser(testUser);
    }

    @Test
    void deleteMentor_Success_BansUserAndDeletesProfile() {
        when(mentorProfileRepository.findById(1L)).thenReturn(Optional.of(testMentor));
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        adminMentorService.deleteMentor(1L, "Inappropriate mentoring");
        // 1. Verify User is banned
        assertTrue(testUser.getIsMentorBanned());
        assertEquals("Inappropriate mentoring", testUser.getMentorBanReason());
        verify(userRepository).save(testUser);
        verify(userRepository).flush();
        verify(mentorshipService).deleteMentorProfile(10L);
    }

    @Test
    void deleteMentor_MentorProfileNotFound_ThrowsException() {
        when(mentorProfileRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminMentorService.deleteMentor(999L, "Test"));

        verify(userRepository, never()).save(any());
        verify(mentorshipService, never()).deleteMentorProfile(anyLong());
    }

    @Test
    void deleteMentor_UserNotFound_ThrowsException() {
        when(mentorProfileRepository.findById(1L)).thenReturn(Optional.of(testMentor));
        when(userRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminMentorService.deleteMentor(1L, "Test"));

        verify(userRepository, never()).save(any());
        verify(mentorshipService, never()).deleteMentorProfile(anyLong());
    }
}
