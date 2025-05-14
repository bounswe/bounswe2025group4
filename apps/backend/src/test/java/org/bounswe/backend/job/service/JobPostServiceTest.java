package org.bounswe.backend.job.service;

import org.bounswe.backend.common.enums.UserType;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UnauthorizedActionException;
import org.bounswe.backend.job.dto.JobPostDto;
import org.bounswe.backend.job.dto.JobPostResponseDto;
import org.bounswe.backend.job.entity.JobPost;
import org.bounswe.backend.job.repository.JobPostRepository;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobPostServiceTest {

    @Mock
    private JobPostRepository repo;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobPostService jobPostService;

    private JobPostDto jobPostDto;
    private JobPost jobPost;
    private User employer;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        employer = new User();
        employer.setId(1L);
        employer.setUsername("employer@example.com");
        employer.setUserType(UserType.EMPLOYER);

        jobPostDto = new JobPostDto();
        jobPostDto.setTitle("Java Developer");
        jobPostDto.setDescription("We need a Java developer");
        jobPostDto.setCompany("Tech Co");
        jobPostDto.setLocation("Remote");
        jobPostDto.setRemote(true);
        jobPostDto.setEthicalTags("Eco-friendly, Fair-trade");
        jobPostDto.setMinSalary(50000);
        jobPostDto.setMaxSalary(80000);
        jobPostDto.setContact("jobs@techco.com");

        jobPost = JobPost.builder()
                .id(1L)
                .title("Java Developer")
                .description("We need a Java developer")
                .company("Tech Co")
                .location("Remote")
                .remote(true)
                .ethicalTags("Eco-friendly, Fair-trade")
                .employer(employer)
                .minSalary(50000)
                .maxSalary(80000)
                .contact("jobs@techco.com")
                .postedDate(now)
                .build();
    }

    @Test
    void getAll_shouldReturnAllJobPosts() {
        // Given
        when(repo.findAll()).thenReturn(Collections.singletonList(jobPost));

        // When
        List<JobPostResponseDto> result = jobPostService.getAll();

        // Then
        assertEquals(1, result.size());
        assertEquals(jobPost.getId(), result.get(0).getId());
        assertEquals(jobPost.getTitle(), result.get(0).getTitle());
        verify(repo).findAll();
    }

    @Test
    void getFiltered_shouldReturnFilteredJobPosts() {
        // Given
        String title = "Java";
        String companyName = "Tech";
        List<String> ethicalTags = Collections.singletonList("Eco");
        Integer minSalary = 40000;
        Integer maxSalary = 90000;
        Boolean isRemote = true;
        String contact = "jobs";

        when(repo.findFiltered(title, companyName, minSalary, maxSalary, isRemote))
                .thenReturn(Collections.singletonList(jobPost));

        // When
        List<JobPostResponseDto> result = jobPostService.getFiltered(title, companyName, ethicalTags, minSalary, maxSalary, isRemote, contact);

        // Then
        assertEquals(1, result.size());
        assertEquals(jobPost.getId(), result.get(0).getId());
        verify(repo).findFiltered(title, companyName, minSalary, maxSalary, isRemote);
    }

    @Test
    void getFiltered_withNoMatchingEthicalTags_shouldReturnEmptyList() {
        // Given
        List<String> ethicalTags = Collections.singletonList("NonExistent");
        when(repo.findFiltered(any(), any(), any(), any(), any()))
                .thenReturn(Collections.singletonList(jobPost));

        // When
        List<JobPostResponseDto> result = jobPostService.getFiltered(null, null, ethicalTags, null, null, null, null);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    void getFiltered_withNoMatchingContact_shouldReturnEmptyList() {
        // Given
        String contact = "nonexistent";
        when(repo.findFiltered(any(), any(), any(), any(), any()))
                .thenReturn(Collections.singletonList(jobPost));

        // When
        List<JobPostResponseDto> result = jobPostService.getFiltered(null, null, null, null, null, null, contact);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    void getByEmployerId_shouldReturnJobPostsByEmployerId() {
        // Given
        Long employerId = 1L;
        when(repo.findByEmployerId(employerId)).thenReturn(Collections.singletonList(jobPost));

        // When
        List<JobPostResponseDto> result = jobPostService.getByEmployerId(employerId);

        // Then
        assertEquals(1, result.size());
        assertEquals(jobPost.getId(), result.get(0).getId());
        verify(repo).findByEmployerId(employerId);
    }

    @Test
    void getById_shouldReturnJobPostById() {
        // Given
        Long id = 1L;
        when(repo.findById(id)).thenReturn(Optional.of(jobPost));

        // When
        JobPostResponseDto result = jobPostService.getById(id);

        // Then
        assertEquals(jobPost.getId(), result.getId());
        assertEquals(jobPost.getTitle(), result.getTitle());
        verify(repo).findById(id);
    }

    @Test
    void getById_whenJobPostNotFound_shouldThrowNotFoundException() {
        // Given
        Long id = 999L;
        when(repo.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> jobPostService.getById(id));
        verify(repo).findById(id);
    }

    @Test
    void create_shouldCreateJobPost() {
        // Given
        try (MockedStatic<SecurityContextHolder> securityContextHolderMock = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            securityContextHolderMock.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("employer@example.com");
            when(userRepository.findByUsername("employer@example.com")).thenReturn(Optional.of(employer));

            // This is crucial - we need to return a properly constructed JobPost
            when(repo.save(any(JobPost.class))).thenReturn(jobPost);

            // When
            JobPostResponseDto result = jobPostService.create(jobPostDto);

            // Then
            assertEquals(jobPost.getId(), result.getId());
            assertEquals(jobPost.getTitle(), result.getTitle());
            verify(userRepository).findByUsername("employer@example.com");
            verify(repo).save(any(JobPost.class));
        }
    }

    @Test
    void create_whenUserNotEmployer_shouldThrowUnauthorizedActionException() {
        // Given
        User nonEmployer = new User();
        nonEmployer.setId(2L);
        nonEmployer.setUsername("user@example.com");
        nonEmployer.setUserType(UserType.JOB_SEEKER);

        try (MockedStatic<SecurityContextHolder> securityContextHolderMock = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            securityContextHolderMock.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("user@example.com");
            when(userRepository.findByUsername("user@example.com")).thenReturn(Optional.of(nonEmployer));

            // When & Then
            assertThrows(UnauthorizedActionException.class, () -> jobPostService.create(jobPostDto));
            verify(userRepository).findByUsername("user@example.com");
            verify(repo, never()).save(any(JobPost.class));
        }
    }

    @Test
    void delete_shouldDeleteJobPost() {
        // Given
        Long id = 1L;
        when(repo.existsById(id)).thenReturn(true);
        doNothing().when(repo).deleteById(id);

        // When
        jobPostService.delete(id);

        // Then
        verify(repo).existsById(id);
        verify(repo).deleteById(id);
    }

    @Test
    void delete_whenJobPostNotFound_shouldThrowNotFoundException() {
        // Given
        Long id = 999L;
        when(repo.existsById(id)).thenReturn(false);

        // When & Then
        assertThrows(NotFoundException.class, () -> jobPostService.delete(id));
        verify(repo).existsById(id);
        verify(repo, never()).deleteById(id);
    }

    @Test
    void update_shouldUpdateJobPost() {
        // Given
        Long id = 1L;

        try (MockedStatic<SecurityContextHolder> securityContextHolderMock = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            securityContextHolderMock.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("employer@example.com");
            when(userRepository.findByUsername("employer@example.com")).thenReturn(Optional.of(employer));
            when(repo.findById(id)).thenReturn(Optional.of(jobPost));

            // Set up the job to be returned after saving
            JobPost updatedJob = JobPost.builder()
                    .id(id)
                    .title("Updated Title")
                    .description("Updated Description")
                    .company(jobPostDto.getCompany())
                    .location(jobPostDto.getLocation())
                    .remote(jobPostDto.isRemote())
                    .ethicalTags(jobPostDto.getEthicalTags())
                    .employer(employer)
                    .minSalary(jobPostDto.getMinSalary())
                    .maxSalary(jobPostDto.getMaxSalary())
                    .contact(jobPostDto.getContact())
                    .postedDate(now)
                    .build();

            when(repo.save(any(JobPost.class))).thenReturn(updatedJob);

            // Update some fields in the DTO
            jobPostDto.setTitle("Updated Title");
            jobPostDto.setDescription("Updated Description");

            // When
            JobPostResponseDto result = jobPostService.update(id, jobPostDto);

            // Then
            assertEquals(id, result.getId());
            assertEquals("Updated Title", result.getTitle());
            assertEquals("Updated Description", result.getDescription());
            verify(repo).findById(id);
            verify(userRepository).findByUsername("employer@example.com");
            verify(repo).save(any(JobPost.class));
        }
    }

    @Test
    void update_whenJobPostNotFound_shouldThrowNotFoundException() {
        // Given
        Long id = 999L;
        when(repo.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> jobPostService.update(id, jobPostDto));
        verify(repo).findById(id);
        verify(repo, never()).save(any(JobPost.class));
    }

    @Test
    void update_whenUserNotOwner_shouldThrowUnauthorizedActionException() {
        // Given
        Long id = 1L;
        User otherEmployer = new User();
        otherEmployer.setId(2L);
        otherEmployer.setUsername("other@example.com");
        otherEmployer.setUserType(UserType.EMPLOYER);

        try (MockedStatic<SecurityContextHolder> securityContextHolderMock = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            securityContextHolderMock.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("other@example.com");
            when(userRepository.findByUsername("other@example.com")).thenReturn(Optional.of(otherEmployer));
            when(repo.findById(id)).thenReturn(Optional.of(jobPost));

            // When & Then
            assertThrows(UnauthorizedActionException.class, () -> jobPostService.update(id, jobPostDto));
            verify(repo).findById(id);
            verify(userRepository).findByUsername("other@example.com");
            verify(repo, never()).save(any(JobPost.class));
        }
    }
}