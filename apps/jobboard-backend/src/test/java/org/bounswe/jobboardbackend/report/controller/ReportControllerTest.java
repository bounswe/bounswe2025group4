package org.bounswe.jobboardbackend.report.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.report.dto.CreateReportRequest;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReportControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private ReportService reportService;

        @MockitoBean
        private UserRepository userRepository;

        @Test
        @DisplayName("POST /api/report: Should create detailed report and return 201 Created")
        void createReport_WhenValidRequest_ShouldReturnCreated() throws Exception {
                CreateReportRequest request = new CreateReportRequest();
                request.setEntityType(ReportableEntityType.WORKPLACE);
                request.setEntityId(100L);
                request.setReasonType(ReportReasonType.SPAM);
                request.setDescription("Spam content detected");
                UserDetailsImpl userDetails = new UserDetailsImpl(
                                1L,
                                "jobseeker1",
                                "test@example.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_JOBSEEKER")),
                                false);
                User user = new User();
                user.setId(1L);
                user.setUsername("jobseeker1");
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                ReportResponse response = ReportResponse.builder()
                                .id(50L)
                                .entityType(ReportableEntityType.WORKPLACE)
                                .entityId(100L)
                                .status(ReportStatus.PENDING)
                                .reasonType(ReportReasonType.SPAM)
                                .createdAt(Instant.now())
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(response);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
                                userDetails.getAuthorities());
                mockMvc.perform(post("/api/report")
                                .principal(auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(50L))
                                .andExpect(jsonPath("$.entityType").value("WORKPLACE"))
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("POST /api/report: Should return 400 when validation fails")
        void createReport_WhenInvalidRequest_ShouldReturnBadRequest() throws Exception {
                CreateReportRequest invalidRequest = new CreateReportRequest();
                mockMvc.perform(post("/api/report")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest());
        }
    @Test
    @DisplayName("POST /api/report: Should return 400 when duplicate report is submitted")
    void createReport_WhenDuplicate_ShouldReturnBadRequest() throws Exception {
        CreateReportRequest request = new CreateReportRequest();
        request.setEntityType(ReportableEntityType.WORKPLACE);
        request.setEntityId(100L);
        request.setReasonType(ReportReasonType.SPAM);
        request.setDescription("Spam content");
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                .thenThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                        org.bounswe.jobboardbackend.exception.ErrorCode.BAD_REQUEST,
                        "You have already reported this content"));
        UserDetailsImpl userDetails = new UserDetailsImpl(1L, "user", "email", "pass", List.of(), false);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, List.of());
        mockMvc.perform(post("/api/report")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("You have already reported this content"));
    }

    @Test
    @DisplayName("POST /api/report: Should return 404 when reported entity does not exist")
    void createReport_WhenEntityNotFound_ShouldReturnNotFound() throws Exception {
        CreateReportRequest request = new CreateReportRequest();
        request.setEntityType(ReportableEntityType.WORKPLACE);
        request.setEntityId(999L);
        request.setReasonType(ReportReasonType.SPAM);
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                .thenThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                        org.bounswe.jobboardbackend.exception.ErrorCode.NOT_FOUND,
                        "Workplace not found"));
        UserDetailsImpl userDetails = new UserDetailsImpl(1L, "user", "email", "pass", List.of(), false);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, List.of());
        mockMvc.perform(post("/api/report")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Workplace not found"));
    }
}
