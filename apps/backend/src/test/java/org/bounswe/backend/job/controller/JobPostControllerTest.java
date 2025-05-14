package org.bounswe.backend.job.controller;

import org.bounswe.backend.job.dto.JobPostDto;
import org.bounswe.backend.job.dto.JobPostResponseDto;
import org.bounswe.backend.job.service.JobPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobPostControllerTest {

    @Mock
    private JobPostService jobPostService;

    @InjectMocks
    private JobPostController jobPostController;

    private JobPostDto jobPostDto;
    private JobPostResponseDto jobPostResponseDto;
    private List<JobPostResponseDto> jobPostResponseDtoList;

    @BeforeEach
    void setUp() {
        jobPostDto = new JobPostDto();
        // Set appropriate fields for jobPostDto

        jobPostResponseDto = new JobPostResponseDto();
        // Set appropriate fields for jobPostResponseDto

        jobPostResponseDtoList = Collections.singletonList(jobPostResponseDto);
    }

    @Test
    void getAll_shouldReturnAllJobPosts() {
        // Given
        String title = "Developer";
        String companyName = "Tech";
        List<String> ethicalTags = List.of("Eco-friendly");
        Integer minSalary = 50000;
        Integer maxSalary = 100000;
        Boolean isRemote = true;
        String contact = "contact@example.com";

        when(jobPostService.getFiltered(anyString(), anyString(), anyList(),
                any(Integer.class), any(Integer.class), any(Boolean.class), anyString()))
                .thenReturn(jobPostResponseDtoList);

        // When
        ResponseEntity<List<JobPostResponseDto>> response = jobPostController.getAll(
                title, companyName, ethicalTags, minSalary, maxSalary, isRemote, contact);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(jobPostResponseDtoList, response.getBody());
        verify(jobPostService).getFiltered(title, companyName, ethicalTags,
                minSalary, maxSalary, isRemote, contact);
    }

    @Test
    void getByEmployerId_shouldReturnJobPostsByEmployerId() {
        // Given
        Long employerId = 1L;
        when(jobPostService.getByEmployerId(employerId)).thenReturn(jobPostResponseDtoList);

        // When
        ResponseEntity<List<JobPostResponseDto>> response = jobPostController.getByEmployerId(employerId);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(jobPostResponseDtoList, response.getBody());
        verify(jobPostService).getByEmployerId(employerId);
    }

    @Test
    void getById_shouldReturnJobPostById() {
        // Given
        Long id = 1L;
        when(jobPostService.getById(id)).thenReturn(jobPostResponseDto);

        // When
        ResponseEntity<JobPostResponseDto> response = jobPostController.getById(id);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(jobPostResponseDto, response.getBody());
        verify(jobPostService).getById(id);
    }

    @Test
    void create_shouldCreateAndReturnJobPost() {
        // Given
        when(jobPostService.create(any(JobPostDto.class))).thenReturn(jobPostResponseDto);

        // When
        ResponseEntity<JobPostResponseDto> response = jobPostController.create(jobPostDto);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(jobPostResponseDto, response.getBody());
        verify(jobPostService).create(jobPostDto);
    }

    @Test
    void delete_shouldDeleteJobPost() {
        // Given
        Long id = 1L;
        doNothing().when(jobPostService).delete(id);

        // When
        ResponseEntity<Void> response = jobPostController.delete(id);

        // Then
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(jobPostService).delete(id);
    }

    @Test
    void update_shouldUpdateAndReturnJobPost() {
        // Given
        Long id = 1L;
        when(jobPostService.update(eq(id), any(JobPostDto.class))).thenReturn(jobPostResponseDto);

        // When
        ResponseEntity<JobPostResponseDto> response = jobPostController.update(id, jobPostDto);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(jobPostResponseDto, response.getBody());
        verify(jobPostService).update(id, jobPostDto);
    }
}