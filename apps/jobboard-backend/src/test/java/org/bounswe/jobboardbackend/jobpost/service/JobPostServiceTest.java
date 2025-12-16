package org.bounswe.jobboardbackend.jobpost.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobpost.dto.CreateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostResponse;
import org.bounswe.jobboardbackend.jobpost.dto.UpdateJobPostRequest;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobPostServiceTest {

    @Mock
    private JobPostRepository jobPostRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WorkplaceRepository workplaceRepository;

    @Mock
    private EmployerWorkplaceRepository employerWorkplaceRepository;

    @Mock
    private WorkplaceService workplaceService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private org.bounswe.jobboardbackend.activity.service.ActivityService activityService;

    @InjectMocks
    private JobPostService jobPostService;

    private User mockUser;
    private Workplace mockWorkplace;
    private JobPost mockJobPost;

    @BeforeEach
    void setUp() {
        // 1. Test Verileri
        mockUser = User.builder()
                .id(1L)
                .username("test_employer")
                .email("emp@test.com")
                .build();

        mockWorkplace = Workplace.builder()
                .id(100L)
                .companyName("Tech Corp")
                .build();

        mockJobPost = JobPost.builder()
                .id(500L)
                .title("Original Title")
                .minSalary(50000)
                .maxSalary(80000)
                .employer(mockUser)
                .workplace(mockWorkplace)
                .build();

        // 2. Security Context Mocklama (Lenient kullanarak gereksiz stub hatasını
        // önlüyoruz)
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        UserDetails userDetails = mock(UserDetails.class);

        lenient().when(userDetails.getUsername()).thenReturn(mockUser.getUsername());
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(authentication.getName()).thenReturn(mockUser.getUsername());
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // --- CREATE TESTLERİ ---

    @Test
    @DisplayName("Create: Should succeed when user is authorized for workplace")
    void create_Success() {
        CreateJobPostRequest request = CreateJobPostRequest.builder()
                .title("New Job")
                .workplaceId(mockWorkplace.getId())
                .description("Desc")
                .build();

        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(workplaceRepository.findById(mockWorkplace.getId())).thenReturn(Optional.of(mockWorkplace));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(true);

        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(invocation -> {
            JobPost saved = invocation.getArgument(0);
            saved.setId(500L);
            return saved;
        });
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        JobPostResponse response = jobPostService.create(request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
    }

    @Test
    @DisplayName("Create: Should fail if workplace does not exist")
    void create_Fail_WorkplaceNotFound() {
        CreateJobPostRequest request = CreateJobPostRequest.builder().workplaceId(999L).build();

        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(workplaceRepository.findById(999L)).thenReturn(Optional.empty());

        HandleException exception = assertThrows(HandleException.class, () -> jobPostService.create(request));
        assertEquals(ErrorCode.WORKPLACE_NOT_FOUND, exception.getCode());

        verify(jobPostRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create: Should fail if user is not authorized for workplace")
    void create_Fail_Unauthorized() {
        CreateJobPostRequest request = CreateJobPostRequest.builder().workplaceId(mockWorkplace.getId()).build();

        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(workplaceRepository.findById(mockWorkplace.getId())).thenReturn(Optional.of(mockWorkplace));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(false);

        HandleException exception = assertThrows(HandleException.class, () -> jobPostService.create(request));
        assertEquals(ErrorCode.WORKPLACE_UNAUTHORIZED, exception.getCode());
    }

    // --- UPDATE TESTLERİ ---

    @Test
    @DisplayName("Update: Should update fields successfully when authorized")
    void update_Success() {
        UpdateJobPostRequest updateRequest = UpdateJobPostRequest.builder()
                .title("Updated Title")
                .minSalary(90000)
                .build();

        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(true);

        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(i -> i.getArgument(0));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        JobPostResponse response = jobPostService.update(mockJobPost.getId(), updateRequest);

        assertEquals("Updated Title", response.getTitle());
        assertEquals(90000, response.getMinSalary());
    }

    @Test
    @DisplayName("Update: Should fail if job post is not found")
    void update_Fail_NotFound() {
        // DÜZELTME: Burada userRepository stubbing'ini kaldırdık.
        // Çünkü findById exception fırlatınca o satıra hiç gelmiyor.

        UpdateJobPostRequest request = UpdateJobPostRequest.builder().title("New").build();

        when(jobPostRepository.findById(999L)).thenReturn(Optional.empty());

        HandleException exception = assertThrows(HandleException.class, () -> jobPostService.update(999L, request));
        assertEquals(ErrorCode.JOB_POST_NOT_FOUND, exception.getCode());
    }

    @Test
    @DisplayName("Update: Should fail if user is not authorized")
    void update_Fail_Unauthorized() {
        UpdateJobPostRequest request = UpdateJobPostRequest.builder().title("New").build();

        // Burada userRepository stubbing'i GEREKLİ çünkü iş akışı oraya ulaşıyor.
        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(false);

        HandleException exception = assertThrows(HandleException.class,
                () -> jobPostService.update(mockJobPost.getId(), request));
        assertEquals(ErrorCode.WORKPLACE_UNAUTHORIZED, exception.getCode());
    }

    // --- DELETE TESTLERİ ---

    @Test
    @DisplayName("Delete: Should delete job post when authorized")
    void delete_Success() {
        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(true);

        jobPostService.delete(mockJobPost.getId());

        verify(jobPostRepository).delete(mockJobPost);
    }

    // --- GET TESTLERİ ---

    @Test
    @DisplayName("GetById: Should return job post when found")
    void getById_Success() {
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        JobPostResponse response = jobPostService.getById(mockJobPost.getId());

        assertEquals(mockJobPost.getTitle(), response.getTitle());
    }

    @Test
    @DisplayName("GetFiltered: Should delegate to repository and return list")
    void getFiltered_Success() {
        when(jobPostRepository.findFiltered(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(mockJobPost));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        List<JobPostResponse> responses = jobPostService.getFiltered(
                "Title", null, null, null, null, null, null, null, null, null);

        assertEquals(1, responses.size());
        assertEquals(mockJobPost.getTitle(), responses.getFirst().getTitle());
    }

    @Test
    @DisplayName("GetByEmployerId: Should return list of jobs for valid employer")
    void getByEmployerId_Success() {
        // Arrange
        Long employerId = mockUser.getId();
        when(userRepository.findById(employerId)).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findByEmployerId(employerId)).thenReturn(List.of(mockJobPost));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        List<JobPostResponse> responses = jobPostService.getByEmployerId(employerId);

        // Assert
        assertEquals(1, responses.size());
        assertEquals(mockJobPost.getTitle(), responses.getFirst().getTitle());
    }

    @Test
    @DisplayName("GetByWorkplaceId: Should return list of jobs for valid workplace")
    void getByWorkplaceId_Success() {
        // Arrange
        Long workplaceId = mockWorkplace.getId();
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(mockWorkplace));
        when(jobPostRepository.findByWorkplaceId(workplaceId)).thenReturn(List.of(mockJobPost));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        List<JobPostResponse> responses = jobPostService.getByWorkplaceId(workplaceId);

        // Assert
        assertEquals(1, responses.size());
        assertEquals(mockJobPost.getTitle(), responses.getFirst().getTitle());
    }

    @Test
    @DisplayName("Delete: Should fail if user is not authorized for the workplace")
    void delete_Fail_Unauthorized() {
        // Arrange
        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(false);

        // Act & Assert
        HandleException exception = assertThrows(HandleException.class,
                () -> jobPostService.delete(mockJobPost.getId()));
        assertEquals(ErrorCode.WORKPLACE_UNAUTHORIZED, exception.getCode());

        verify(jobPostRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Update: Should successfully change workplace if authorized for both")
    void update_Success_ChangeWorkplace() {
        // Arrange
        Workplace newWorkplace = Workplace.builder().id(200L).companyName("New Branch").build();
        UpdateJobPostRequest request = UpdateJobPostRequest.builder()
                .workplaceId(200L)
                .build();

        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(jobPostRepository.findById(mockJobPost.getId())).thenReturn(Optional.of(mockJobPost));

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(mockWorkplace.getId(), mockUser.getId()))
                .thenReturn(true);

        when(workplaceRepository.findById(200L)).thenReturn(Optional.of(newWorkplace));

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(200L, mockUser.getId()))
                .thenReturn(true);

        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(i -> i.getArgument(0));
        when(workplaceService.toBriefResponse(any())).thenReturn(new WorkplaceBriefResponse());

        // Act
        jobPostService.update(mockJobPost.getId(), request);

        // Assert
        verify(jobPostRepository).save(argThat(job -> job.getWorkplace().getId().equals(200L)));
    }
}