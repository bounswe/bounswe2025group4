package org.bounswe.jobboardbackend.admin.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.admin.controller.AdminReportController;
import org.bounswe.jobboardbackend.admin.service.AdminReportService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.report.controller.ReportController;
import org.bounswe.jobboardbackend.report.dto.CreateReportRequest;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.dto.ResolveReportRequest;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = { AdminReportController.class, ReportController.class })
@AutoConfigureMockMvc(addFilters = false)
class ReportWorkflowIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private ReportService reportService;

        @MockitoBean
        private AdminReportService adminReportService;

        @MockitoBean
        private UserRepository userRepository;

        private Authentication mockAuth;

        @BeforeEach
        void setup() {
                User user = new User();
                user.setId(10L);
                user.setUsername("reporter");
                user.setEmail("reporter@example.com");
                user.setRole(org.bounswe.jobboardbackend.auth.model.Role.ROLE_JOBSEEKER);

                UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                mockAuth = new UsernamePasswordAuthenticationToken(userDetails, null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_JOBSEEKER")));

                when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        }

        @Test
        @DisplayName("Scenario 1: Report Workplace -> Admin Deletes Content")
        void scenario_ReportWorkplace_AdminDeletes() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.WORKPLACE);
                createRequest.setEntityId(100L);
                createRequest.setReasonType(ReportReasonType.FAKE);
                createRequest.setDescription("Fake workplace");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(1L)
                                .entityType(ReportableEntityType.WORKPLACE)
                                .entityId(100L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth) // Inject Principal
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1L));
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.APPROVED);
                resolveRequest.setDeleteContent(true);
                resolveRequest.setBanUser(false);
                resolveRequest.setAdminNote("Deleted content");

                doNothing().when(adminReportService).resolveReport(eq(1L), any(ResolveReportRequest.class));

                mockMvc.perform(post("/api/admin/report/1/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());

                verify(adminReportService).resolveReport(eq(1L), any(ResolveReportRequest.class));
        }

        @Test
        @DisplayName("Scenario 2: Report User -> Admin Bans User Only")
        void scenario_ReportUser_AdminBans() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.PROFILE);
                createRequest.setEntityId(50L);
                createRequest.setReasonType(ReportReasonType.OFFENSIVE);
                createRequest.setDescription("Offensive bio");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(2L)
                                .entityType(ReportableEntityType.PROFILE)
                                .entityId(50L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(2L));
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.APPROVED);
                resolveRequest.setDeleteContent(false);
                resolveRequest.setBanUser(true);
                resolveRequest.setBanReason("Hate speech violation");

                mockMvc.perform(post("/api/admin/report/2/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());

                verify(adminReportService).resolveReport(eq(2L), any(ResolveReportRequest.class));
        }

        @Test
        @DisplayName("Scenario 3: Report Post -> Admin Deletes and Bans")
        void scenario_ReportPost_AdminDeletesAndBans() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.FORUM_POST);
                createRequest.setEntityId(200L);
                createRequest.setReasonType(ReportReasonType.SPAM);
                createRequest.setDescription("Spam post");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(3L)
                                .entityType(ReportableEntityType.FORUM_POST)
                                .entityId(200L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated());
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.APPROVED);
                resolveRequest.setDeleteContent(true);
                resolveRequest.setBanUser(true);
                resolveRequest.setBanReason("Spammer");

                mockMvc.perform(post("/api/admin/report/3/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());

                verify(adminReportService).resolveReport(eq(3L), any(ResolveReportRequest.class));
        }

        @Test
        @DisplayName("Scenario 4: Report -> Admin Rejects")
        void scenario_Report_AdminRejects() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.JOB_POST);
                createRequest.setEntityId(300L);
                createRequest.setReasonType(ReportReasonType.OTHER);
                createRequest.setDescription("Should be rejected");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(4L)
                                .entityType(ReportableEntityType.JOB_POST)
                                .entityId(300L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated());
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.REJECTED);
                resolveRequest.setDeleteContent(false);
                resolveRequest.setBanUser(false);
                resolveRequest.setAdminNote("No violation found");

                mockMvc.perform(post("/api/admin/report/4/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());

                verify(adminReportService).resolveReport(eq(4L), any(ResolveReportRequest.class));
        }

        @Test
        @DisplayName("Scenario 5: Report Review -> Admin Deletes (Fake Review)")
        void scenario_ReportReview_AdminDeletes() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.REVIEW);
                createRequest.setEntityId(400L);
                createRequest.setReasonType(ReportReasonType.FAKE);
                createRequest.setDescription("Fake review");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(5L)
                                .entityType(ReportableEntityType.REVIEW)
                                .entityId(400L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(5L));
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.APPROVED);
                resolveRequest.setDeleteContent(true);
                resolveRequest.setBanUser(false);

                mockMvc.perform(post("/api/admin/report/5/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());

                verify(adminReportService).resolveReport(eq(5L), any(ResolveReportRequest.class));
        }

        @Test
        @DisplayName("Scenario 6: Report Comment -> Admin Deletes (Harassment)")
        void scenario_ReportComment_AdminDeletes() throws Exception {
                CreateReportRequest createRequest = new CreateReportRequest();
                createRequest.setEntityType(ReportableEntityType.FORUM_COMMENT);
                createRequest.setEntityId(500L);
                createRequest.setReasonType(ReportReasonType.HARASSMENT);
                createRequest.setDescription("Harassing comment");

                ReportResponse createdReport = ReportResponse.builder()
                                .id(6L)
                                .entityType(ReportableEntityType.FORUM_COMMENT)
                                .entityId(500L)
                                .status(ReportStatus.PENDING)
                                .build();

                when(reportService.createReport(any(CreateReportRequest.class), any(User.class)))
                                .thenReturn(createdReport);

                mockMvc.perform(post("/api/report")
                                .principal(mockAuth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated());
                ResolveReportRequest resolveRequest = new ResolveReportRequest();
                resolveRequest.setStatus(ReportStatus.APPROVED);
                resolveRequest.setDeleteContent(true);

                mockMvc.perform(post("/api/admin/report/6/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resolveRequest)))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Scenario 7: Get Report by ID (Admin)")
        void scenario_GetReport_Admin() throws Exception {
                ReportResponse report = ReportResponse.builder()
                                .id(7L)
                                .description("Test Report")
                                .build();

                when(reportService.getReport(7L)).thenReturn(report);

                mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .get("/api/admin/report/7")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(7L))
                                .andExpect(jsonPath("$.description").value("Test Report"));
        }

        @Test
        @DisplayName("Scenario 8: List Reports (Admin)")
        void scenario_ListReports_Admin() throws Exception {
                ReportResponse r1 = ReportResponse.builder().id(8L).build();
                ReportResponse r2 = ReportResponse.builder().id(9L).build();

                org.springframework.data.domain.Page<ReportResponse> page = new org.springframework.data.domain.PageImpl<>(
                                java.util.List.of(r1, r2));

                when(reportService.listReports(any(), any(), any())).thenReturn(page);

                mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .get("/api/admin/report")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content.size()").value(2));
        }

        @Test
        @DisplayName("Scenario 9: Resolve Report -> Not Found")
        void scenario_Resolve_NotFound() throws Exception {
                ResolveReportRequest request = new ResolveReportRequest();
                request.setStatus(ReportStatus.APPROVED);

                doThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                                org.bounswe.jobboardbackend.exception.ErrorCode.NOT_FOUND, "Report not found"))
                                .when(adminReportService).resolveReport(eq(999L), any());

                mockMvc.perform(post("/api/admin/report/999/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Scenario 10: Resolve Report -> Already Resolved")
        void scenario_Resolve_AlreadyResolved() throws Exception {
                ResolveReportRequest request = new ResolveReportRequest();
                request.setStatus(ReportStatus.APPROVED);

                doThrow(new org.bounswe.jobboardbackend.exception.HandleException(
                                org.bounswe.jobboardbackend.exception.ErrorCode.BAD_REQUEST,
                                "Report has already been resolved"))
                                .when(adminReportService).resolveReport(eq(10L), any());

                mockMvc.perform(post("/api/admin/report/10/resolve")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }
}
