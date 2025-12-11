package org.bounswe.jobboardbackend.jobapplication.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceBriefResponse;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock private JobApplicationRepository applicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private JobPostRepository jobPostRepository;
    @Mock private WorkplaceService workplaceService;
    @Mock private EmployerWorkplaceRepository employerWorkplaceRepository;
    @Mock private WorkplaceRepository workplaceRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private JobApplicationService jobApplicationService;

    // Mock Entities
    private User mockJobSeeker;
    private User mockEmployer;
    private Workplace mockWorkplace;
    private JobPost mockJobPost;
    private JobApplication mockApplication;

    @BeforeEach
    void setUp() {
        // 1. Initialize Test Data
        mockJobSeeker = User.builder().id(1L).username("seeker_user").build();
        mockEmployer = User.builder().id(2L).username("employer_user").build();

        mockWorkplace = Workplace.builder().id(100L).companyName("Tech Corp").build();

        mockJobPost = JobPost.builder()
                .id(10L)
                .title("Java Developer")
                .employer(mockEmployer)
                .workplace(mockWorkplace)
                .build();

        mockApplication = JobApplication.builder()
                .id(500L)
                .jobSeeker(mockJobSeeker)
                .jobPost(mockJobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();

        // 2. Mock Security Context (Simulate User Login)
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        UserDetails userDetails = mock(UserDetails.class);

        // Default behavior: "current_user" is the authenticated user
        lenient().when(userDetails.getUsername()).thenReturn("current_user");
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // --- CREATE (APPLY) TESTS ---

    @Test
    @DisplayName("Create: Should successfully create application when valid")
    void create_Success() {
        // Arrange: Authenticated user is the Job Seeker
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockJobSeeker));

        CreateJobApplicationRequest request = CreateJobApplicationRequest.builder()
                .jobPostId(mockJobPost.getId())
                .coverLetter("Hello")
                .build();

        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));
        // Ensure user hasn't applied before
        when(applicationRepository.existsByJobSeekerIdAndJobPostId(mockJobSeeker.getId(), mockJobPost.getId()))
                .thenReturn(false);

        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(i -> {
            JobApplication app = i.getArgument(0);
            app.setId(500L);
            return app;
        });
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        JobApplicationResponse response = jobApplicationService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(JobApplicationStatus.PENDING, response.getStatus());
        verify(applicationRepository).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("Create: Should fail if application already exists")
    void create_Fail_AlreadyExists() {
        // Arrange
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockJobSeeker));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));

        // Simulate that application ALREADY exists
        when(applicationRepository.existsByJobSeekerIdAndJobPostId(mockJobSeeker.getId(), mockJobPost.getId()))
                .thenReturn(true);

        CreateJobApplicationRequest request = CreateJobApplicationRequest.builder()
                .jobPostId(mockJobPost.getId())
                .build();

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class, () -> jobApplicationService.create(request));
        assertEquals(ErrorCode.APPLICATION_ALREADY_EXISTS, ex.getCode());

        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create: Should fail if Job Post does not exist")
    void create_Fail_JobPostNotFound() {
        // Arrange
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockJobSeeker));
        // Simulate Job Post NOT Found
        when(jobPostRepository.findById(999L)).thenReturn(Optional.empty());

        CreateJobApplicationRequest request = CreateJobApplicationRequest.builder()
                .jobPostId(999L)
                .build();

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class, () -> jobApplicationService.create(request));
        assertEquals(ErrorCode.JOB_POST_NOT_FOUND, ex.getCode());
    }

    // --- APPROVE / REJECT TESTS ---

    @Test
    @DisplayName("Approve: Should succeed when user is an authorized employer")
    void approve_Success() {
        // Arrange: Authenticated user is the Employer
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockEmployer));
        when(applicationRepository.findById(mockApplication.getId())).thenReturn(Optional.of(mockApplication));

        // Authorization Check: Is user an employer of this workplace? YES.
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockEmployer.getId()))
                .thenReturn(true);

        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(i -> i.getArgument(0));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        JobApplicationResponse response = jobApplicationService.approve(mockApplication.getId(), "Approved!");

        // Assert
        assertEquals(JobApplicationStatus.APPROVED, response.getStatus());
        assertEquals("Approved!", response.getFeedback());
    }

    @Test
    @DisplayName("Approve: Should fail when user is NOT authorized for the workplace")
    void approve_Fail_Unauthorized() {
        // Arrange
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockEmployer));
        when(applicationRepository.findById(mockApplication.getId())).thenReturn(Optional.of(mockApplication));

        // Authorization Check: NO.
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockEmployer.getId()))
                .thenReturn(false);

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class,
                () -> jobApplicationService.approve(mockApplication.getId(), "Ok"));
        assertEquals(ErrorCode.WORKPLACE_UNAUTHORIZED, ex.getCode());
    }

    @Test
    @DisplayName("Reject: Should succeed when user is an authorized employer")
    void reject_Success() {
        // Arrange
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockEmployer));
        when(applicationRepository.findById(mockApplication.getId())).thenReturn(Optional.of(mockApplication));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockEmployer.getId()))
                .thenReturn(true);

        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(i -> i.getArgument(0));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        JobApplicationResponse response = jobApplicationService.reject(mockApplication.getId(), "Sorry");

        // Assert
        assertEquals(JobApplicationStatus.REJECTED, response.getStatus());
    }

    // --- DELETE TESTS ---

    @Test
    @DisplayName("Delete: Should succeed when user is the applicant")
    void delete_Success() {
        // Arrange: Authenticated user is the Applicant (Seeker)
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockJobSeeker));
        when(applicationRepository.findById(mockApplication.getId())).thenReturn(Optional.of(mockApplication));

        // Act
        jobApplicationService.delete(mockApplication.getId());

        // Assert
        verify(applicationRepository).delete(mockApplication);
    }

    @Test
    @DisplayName("Delete: Should fail when user is NOT the applicant")
    void delete_Fail_Unauthorized() {
        // Arrange: Authenticated user is the Employer, but the applicant is the Seeker.
        when(userRepository.findByUsername("current_user")).thenReturn(Optional.of(mockEmployer));
        when(applicationRepository.findById(mockApplication.getId())).thenReturn(Optional.of(mockApplication));

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class,
                () -> jobApplicationService.delete(mockApplication.getId()));
        assertEquals(ErrorCode.USER_UNAUTHORIZED, ex.getCode());

        verify(applicationRepository, never()).delete(any());
    }

    // --- GET / LIST TESTS ---

    @Test
    @DisplayName("GetByJobSeekerId: Should return list of applications")
    void getByJobSeekerId_Success() {
        // Arrange
        when(userRepository.findById(mockJobSeeker.getId())).thenReturn(Optional.of(mockJobSeeker));
        when(applicationRepository.findByJobSeekerId(mockJobSeeker.getId())).thenReturn(List.of(mockApplication));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        List<JobApplicationResponse> result = jobApplicationService.getByJobSeekerId(mockJobSeeker.getId());

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("GetByJobSeekerId: Should fail if user not found")
    void getByJobSeekerId_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class,
                () -> jobApplicationService.getByJobSeekerId(999L));
        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getCode());
    }

    @Test
    @DisplayName("GetByWorkplaceId: Should return list of applications")
    void getByWorkplaceId_Success() {
        // Arrange
        when(workplaceRepository.findById(mockWorkplace.getId())).thenReturn(Optional.of(mockWorkplace));
        when(applicationRepository.findByJobPost_Workplace_Id(mockWorkplace.getId()))
                .thenReturn(List.of(mockApplication));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        List<JobApplicationResponse> result = jobApplicationService.getByWorkplaceId(mockWorkplace.getId());

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("GetByWorkplaceId: Should fail if workplace not found")
    void getByWorkplaceId_NotFound() {
        // Arrange
        when(workplaceRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        HandleException ex = assertThrows(HandleException.class,
                () -> jobApplicationService.getByWorkplaceId(999L));
        assertEquals(ErrorCode.WORKPLACE_NOT_FOUND, ex.getCode());
    }
}