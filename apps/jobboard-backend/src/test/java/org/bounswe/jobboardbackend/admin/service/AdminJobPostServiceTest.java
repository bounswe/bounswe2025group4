package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminJobPostServiceTest {

    @Mock
    private JobPostRepository jobPostRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @InjectMocks
    private AdminJobPostService adminJobPostService;

    private JobPost testJobPost;

    @BeforeEach
    void setUp() {
        testJobPost = new JobPost();
        testJobPost.setId(1L);
        testJobPost.setTitle("Software Engineer");
    }

    @Test
    void deleteJobPost_Success_DeletesJobAndApplications() {
        when(jobPostRepository.findById(1L)).thenReturn(Optional.of(testJobPost));
        adminJobPostService.deleteJobPost(1L, "Fake job posting");
        var inOrder = inOrder(jobApplicationRepository, jobPostRepository);
        inOrder.verify(jobApplicationRepository).deleteAllByJobPostId(1L);
        inOrder.verify(jobPostRepository).delete(testJobPost);
    }

    @Test
    void deleteJobPost_NotFound_ThrowsException() {
        when(jobPostRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminJobPostService.deleteJobPost(999L, "Test"));

        verify(jobApplicationRepository, never()).deleteAllByJobPostId(anyLong());
        verify(jobPostRepository, never()).delete(any());
    }

    @Test
    void deleteJobPost_CascadeApplications() {
        when(jobPostRepository.findById(1L)).thenReturn(Optional.of(testJobPost));
        adminJobPostService.deleteJobPost(1L, "Cascade test");
        verify(jobApplicationRepository).deleteAllByJobPostId(1L);
    }

    @Test
    void deleteJobPost_WithReason_ProcessesCorrectly() {
        when(jobPostRepository.findById(1L)).thenReturn(Optional.of(testJobPost));
        String reason = "Discriminatory job posting";
        adminJobPostService.deleteJobPost(1L, reason);
        verify(jobPostRepository).delete(testJobPost);
    }

    @Test
    void deleteJobPost_NullReason_StillDeletes() {
        when(jobPostRepository.findById(1L)).thenReturn(Optional.of(testJobPost));
        adminJobPostService.deleteJobPost(1L, null);
        verify(jobApplicationRepository).deleteAllByJobPostId(1L);
        verify(jobPostRepository).delete(testJobPost);
    }

    @Test
    void deleteJobPost_VerifiesCascadeOrder() {
        when(jobPostRepository.findById(1L)).thenReturn(Optional.of(testJobPost));
        adminJobPostService.deleteJobPost(1L, "Test");
        var inOrder = inOrder(jobApplicationRepository, jobPostRepository);
        inOrder.verify(jobApplicationRepository).deleteAllByJobPostId(1L);
        inOrder.verify(jobPostRepository).delete(testJobPost);
    }
}
