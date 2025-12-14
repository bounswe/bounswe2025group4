package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
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
class AdminJobApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @InjectMocks
    private AdminJobApplicationService adminJobApplicationService;

    private JobApplication testApplication;

    @BeforeEach
    void setUp() {
        testApplication = new JobApplication();
        testApplication.setId(1L);
    }

    @Test
    void deleteJobApplication_Success_DeletesApplication() {
        when(jobApplicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        adminJobApplicationService.deleteJobApplication(1L, "Fake application");
        verify(jobApplicationRepository).delete(testApplication);
    }

    @Test
    void deleteJobApplication_NotFound_ThrowsException() {
        when(jobApplicationRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminJobApplicationService.deleteJobApplication(999L, "Test"));

        verify(jobApplicationRepository, never()).delete(any());
    }

    @Test
    void deleteJobApplication_WithReason_ProcessesCorrectly() {
        when(jobApplicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        String reason = "Spam application";
        adminJobApplicationService.deleteJobApplication(1L, reason);
        verify(jobApplicationRepository).delete(testApplication);
    }

    @Test
    void deleteJobApplication_NullReason_StillDeletes() {
        when(jobApplicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        adminJobApplicationService.deleteJobApplication(1L, null);
        verify(jobApplicationRepository).delete(testApplication);
    }

    @Test
    void deleteJobApplication_NoCascade_StandaloneEntity() {
        when(jobApplicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        adminJobApplicationService.deleteJobApplication(1L, "Test");
        verify(jobApplicationRepository, times(1)).delete(testApplication);
        verifyNoMoreInteractions(jobApplicationRepository);
    }
}
