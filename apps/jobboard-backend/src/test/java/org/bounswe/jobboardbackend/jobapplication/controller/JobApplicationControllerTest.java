package org.bounswe.jobboardbackend.jobapplication.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.dto.UpdateJobApplicationRequest; // Added
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.service.JobApplicationService;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobApplicationController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable Security Filters for unit testing logic
class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean // Replaces @MockBean in Spring Boot 3.4+
    private JobApplicationService jobApplicationService;

    // --- CREATE (APPLY) TESTS ---

    @Test
    @DisplayName("POST /api/applications: Should create application and return 201 Created")
    void create_ShouldReturnCreated() throws Exception {
        // Arrange
        CreateJobApplicationRequest request = CreateJobApplicationRequest.builder()
                .jobPostId(10L)
                .coverLetter("I am a great fit.")
                .build();

        JobApplicationResponse response = JobApplicationResponse.builder()
                .id(1L)
                .status(JobApplicationStatus.PENDING)
                .build();

        when(jobApplicationService.create(any(CreateJobApplicationRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/applications: Should return 400 Bad Request when validation fails")
    void create_ShouldReturnBadRequest_WhenInvalid() throws Exception {
        // Arrange: Missing mandatory 'jobPostId'
        CreateJobApplicationRequest invalidRequest = CreateJobApplicationRequest.builder()
                .coverLetter("Missing ID")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- EMPLOYER ACTIONS (APPROVE / REJECT) ---

    @Test
    @DisplayName("PUT /api/applications/{id}/approve: Should approve and return updated status")
    void approve_ShouldReturnApproved() throws Exception {
        // Arrange
        Long appId = 1L;
        String feedback = "Welcome aboard!";

        // Create the request object expected by the controller
        UpdateJobApplicationRequest request = UpdateJobApplicationRequest.builder()
                .feedback(feedback)
                .build();

        JobApplicationResponse response = JobApplicationResponse.builder()
                .id(appId)
                .status(JobApplicationStatus.APPROVED)
                .feedback(feedback)
                .build();

        // Updated mock to accept method call (assuming service method signature is approved(Long id, String feedback))
        // The controller likely extracts feedback from DTO and calls service.
        // Based on your service code: public JobApplicationResponse approve(Long id, String feedback)
        when(jobApplicationService.approve(eq(appId), eq(feedback))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/applications/{id}/approve", appId)
                        .contentType(MediaType.APPLICATION_JSON) // FIXED: Send JSON
                        .content(objectMapper.writeValueAsString(request))) // FIXED: Send DTO
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.feedback").value(feedback));
    }

    @Test
    @DisplayName("PUT /api/applications/{id}/reject: Should reject and return updated status")
    void reject_ShouldReturnRejected() throws Exception {
        // Arrange
        Long appId = 1L;
        String feedback = "Not enough experience.";

        // Create request object
        UpdateJobApplicationRequest request = UpdateJobApplicationRequest.builder()
                .feedback(feedback)
                .build();

        JobApplicationResponse response = JobApplicationResponse.builder()
                .id(appId)
                .status(JobApplicationStatus.REJECTED)
                .feedback(feedback)
                .build();

        when(jobApplicationService.reject(eq(appId), eq(feedback))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/applications/{id}/reject", appId)
                        .contentType(MediaType.APPLICATION_JSON) // FIXED: Send JSON
                        .content(objectMapper.writeValueAsString(request))) // FIXED: Send DTO
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @DisplayName("PUT /api/applications/{id}/approve: Should return 403 Forbidden if user is unauthorized")
    void approve_ShouldReturnForbidden_WhenUnauthorized() throws Exception {
        // Arrange
        Long appId = 1L;
        UpdateJobApplicationRequest request = UpdateJobApplicationRequest.builder()
                .feedback("ok")
                .build();

        when(jobApplicationService.approve(eq(appId), any()))
                .thenThrow(new HandleException(ErrorCode.WORKPLACE_UNAUTHORIZED, "Not authorized"));

        // Act & Assert
        mockMvc.perform(put("/api/applications/{id}/approve", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("WORKPLACE_UNAUTHORIZED"));
    }

    // --- DELETE TESTS ---

    @Test
    @DisplayName("DELETE /api/applications/{id}: Should return 204 No Content")
    void delete_ShouldReturnNoContent() throws Exception {
        // Arrange
        Long appId = 1L;
        doNothing().when(jobApplicationService).delete(appId);

        // Act & Assert
        mockMvc.perform(delete("/api/applications/{id}", appId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/applications/{id}: Should return 404 Not Found if not exists")
    void delete_ShouldReturnNotFound() throws Exception {
        // Arrange
        Long appId = 999L;
        doThrow(new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Not found"))
                .when(jobApplicationService).delete(appId);

        // Act & Assert
        mockMvc.perform(delete("/api/applications/{id}", appId))
                .andExpect(status().isNotFound());
    }

    // --- LISTING (GET) TESTS ---

    @Test
    @DisplayName("GET /api/applications/job-seeker/{id}: Should return list")
    void getByJobSeekerId_ShouldReturnList() throws Exception {
        // Arrange
        Long seekerId = 5L;
        when(jobApplicationService.getByJobSeekerId(seekerId)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/applications/job-seeker/{id}", seekerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("GET /api/applications/job-post/{id}: Should return list")
    void getByJobPostId_ShouldReturnList() throws Exception {
        // Arrange
        Long postId = 10L;
        when(jobApplicationService.getByJobPostId(postId)).thenReturn(List.of(new JobApplicationResponse()));

        // Act & Assert
        mockMvc.perform(get("/api/applications/job-post/{id}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("GET /api/applications/workplace/{id}: Should return list")
    void getByWorkplaceId_ShouldReturnList() throws Exception {
        // Arrange
        Long workplaceId = 20L;
        when(jobApplicationService.getByWorkplaceId(workplaceId)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/applications/workplace/{id}", workplaceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("GET /api/applications/{id}: Should return detail")
    void getById_ShouldReturnDetail() throws Exception {
        // Arrange
        Long appId = 1L;
        JobApplicationResponse response = JobApplicationResponse.builder()
                .id(appId)
                .status(JobApplicationStatus.PENDING)
                .build();
        when(jobApplicationService.getById(appId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/applications/{id}", appId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appId));
    }
}