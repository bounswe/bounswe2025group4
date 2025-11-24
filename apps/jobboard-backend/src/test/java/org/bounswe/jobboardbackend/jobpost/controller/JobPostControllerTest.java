package org.bounswe.jobboardbackend.jobpost.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.jobpost.dto.CreateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostResponse;
import org.bounswe.jobboardbackend.jobpost.dto.UpdateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.service.JobPostService;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceBriefResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobPostController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable Spring Security filters for unit testing logic only
class JobPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean // Replaces @MockBean in Spring Boot 3.4+
    private JobPostService jobPostService;

    // --- GET TESTS ---

    @Test
    @DisplayName("GET /api/jobs: Should return filtered list of job posts")
    void getFiltered_ShouldReturnList() throws Exception {
        // Arrange
        JobPostResponse response = JobPostResponse.builder()
                .id(1L)
                .title("Software Engineer")
                .minSalary(50000)
                .build();

        // Mock service call with any arguments (since params are optional)
        when(jobPostService.getFiltered(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenReturn(List.of(response));

        // Act & Assert
        mockMvc.perform(get("/api/jobs")
                        .param("title", "Software")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].title").value("Software Engineer"));
    }

    @Test
    @DisplayName("GET /api/jobs/{id}: Should return job post by ID")
    void getById_ShouldReturnJobPost() throws Exception {
        // Arrange
        Long jobId = 100L;
        JobPostResponse response = JobPostResponse.builder()
                .id(jobId)
                .title("Backend Developer")
                .build();

        when(jobPostService.getById(jobId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/jobs/{id}", jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(jobId))
                .andExpect(jsonPath("$.title").value("Backend Developer"));
    }

    @Test
    @DisplayName("GET /api/jobs/employer/{employerId}: Should return jobs for specific employer")
    void getByEmployerId_ShouldReturnList() throws Exception {
        // Arrange
        Long employerId = 5L;
        when(jobPostService.getByEmployerId(employerId)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/jobs/employer/{employerId}", employerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("GET /api/jobs/workplace/{workplaceId}: Should return jobs for specific workplace")
    void getByWorkplaceId_ShouldReturnList() throws Exception {
        // Arrange
        Long workplaceId = 10L;
        JobPostResponse response = JobPostResponse.builder()
                .id(1L)
                .workplace(WorkplaceBriefResponse.builder().id(workplaceId).build())
                .build();

        when(jobPostService.getByWorkplaceId(workplaceId)).thenReturn(List.of(response));

        // Act & Assert
        mockMvc.perform(get("/api/jobs/workplace/{workplaceId}", workplaceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].workplace.id").value(workplaceId));
    }

    // --- POST (CREATE) TESTS ---

    @Test
    @DisplayName("POST /api/jobs: Should create a new job post and return 201 Created")
    void create_ShouldReturnCreated() throws Exception {
        // Arrange
        CreateJobPostRequest request = CreateJobPostRequest.builder()
                .title("New Job")
                .description("Job Description")
                .workplaceId(10L)
                .contact("hr@test.com")
                .minSalary(30000)
                .build();

        JobPostResponse response = JobPostResponse.builder()
                .id(200L)
                .title("New Job")
                .contact("hr@test.com")
                .build();

        when(jobPostService.create(any(CreateJobPostRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()) // Expect 201
                .andExpect(jsonPath("$.id").value(200L))
                .andExpect(jsonPath("$.title").value("New Job"));
    }

    @Test
    @DisplayName("POST /api/jobs: Should return 400 Bad Request when validation fails")
    void create_ShouldReturnBadRequest_WhenInvalid() throws Exception {
        // Arrange: Missing required fields (title, description, contact)
        CreateJobPostRequest invalidRequest = CreateJobPostRequest.builder()
                .workplaceId(10L)
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
        // Ensures @Valid annotation is working
    }

    // --- PUT (UPDATE) TESTS ---

    @Test
    @DisplayName("PUT /api/jobs/{id}: Should update job post and return 200 OK")
    void update_ShouldReturnUpdatedJob() throws Exception {
        // Arrange
        Long jobId = 1L;
        UpdateJobPostRequest request = UpdateJobPostRequest.builder()
                .title("Updated Title")
                .build();

        JobPostResponse response = JobPostResponse.builder()
                .id(jobId)
                .title("Updated Title")
                .build();

        when(jobPostService.update(eq(jobId), any(UpdateJobPostRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/jobs/{id}", jobId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    // --- DELETE TESTS ---

    @Test
    @DisplayName("DELETE /api/jobs/{id}: Should delete job post and return 204 No Content")
    void delete_ShouldReturnNoContent() throws Exception {
        // Arrange
        Long jobId = 1L;
        doNothing().when(jobPostService).delete(jobId);

        // Act & Assert
        mockMvc.perform(delete("/api/jobs/{id}", jobId))
                .andExpect(status().isNoContent()); // Expect 204
    }




    @Test
    @DisplayName("PUT /api/jobs/{id}: Should return 400 Bad Request when update data is invalid")
    void update_ShouldReturnBadRequest_WhenInvalid() throws Exception {
        // Arrange
        Long jobId = 1L;
        // Create a title that exceeds the maximum allowed length (e.g., >100 characters)
        String tooLongTitle = "A".repeat(101);

        UpdateJobPostRequest invalidRequest = UpdateJobPostRequest.builder()
                .title(tooLongTitle)
                .build();

        // Act & Assert
        // The @Valid annotation in the controller should trigger validation failure
        mockMvc.perform(put("/api/jobs/{id}", jobId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/jobs/{id}: Should return 404 Not Found when job post does not exist")
    void getById_ShouldReturnNotFound() throws Exception {
        // Arrange
        Long nonExistentId = 999L;

        // Mock the service to throw the custom HandleException when ID is not found
        // Note: GlobalExceptionHandler is expected to map this to 404 Not Found
        when(jobPostService.getById(nonExistentId))
                .thenThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                        org.bounswe.jobboardbackend.exception.ErrorCode.JOB_POST_NOT_FOUND,
                        "Job post not found"));

        // Act & Assert
        mockMvc.perform(get("/api/jobs/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("JOB_POST_NOT_FOUND"));
    }

    @Test
    @DisplayName("DELETE /api/jobs/{id}: Should return 404 Not Found if job to delete doesn't exist")
    void delete_ShouldReturnNotFound() throws Exception {
        // Arrange
        Long nonExistentId = 999L;

        // For void methods, we use doThrow() to simulate exceptions
        doThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                org.bounswe.jobboardbackend.exception.ErrorCode.JOB_POST_NOT_FOUND,
                "Job post not found"))
                .when(jobPostService).delete(nonExistentId);

        // Act & Assert
        mockMvc.perform(delete("/api/jobs/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/jobs: Should return empty list when no jobs match the filters")
    void getFiltered_ShouldReturnEmptyList() throws Exception {
        // Arrange
        // Mock the service to return an empty list
        when(jobPostService.getFiltered(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/jobs")
                        .param("location", "Mars")) // Search for a location with no jobs
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }
}