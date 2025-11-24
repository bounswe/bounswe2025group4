package org.bounswe.jobboardbackend.workplace.controller;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.dto.ReviewReportCreate;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceReportCreate;
import org.bounswe.jobboardbackend.workplace.service.ReportService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkplaceReportController.class)
class WorkplaceReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    @MockitoBean
    private UserRepository userRepository;

    private User userEntity(Long id) {
        return User.builder()
                .id(id)
                .username("user" + id)
                .email("user" + id + "@test.com")
                .password("password-" + id)
                .role(Role.ROLE_JOBSEEKER)
                .emailVerified(true)
                .build();
    }

    private final User USER_1 = userEntity(1L);
    private final User USER_2 = userEntity(2L);

    private String validWorkplaceReportBody() {
        return """
               {
                 "reasonType": "OFFENSIVE",
                 "reason": "spam content"
               }
               """;
    }

    private String validReviewReportBody() {
        return """
               {
                 "reasonType": "OFFENSIVE",
                 "reason": "abusive review"
               }
               """;
    }

    // ========================================================================
    // REPORT WORKPLACE  (POST /api/workplace/{id}/report)
    // ========================================================================

    @Test
    void reportWorkplace_whenPrincipalIsDomainUser_callsServiceWithSameUser_andReturnsApiMessage() throws Exception {
        Long workplaceId = 10L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Workplace reported"))
                .andExpect(jsonPath("$.code").value("WORKPLACE_REPORTED"));

        ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<WorkplaceReportCreate> reqCaptor = ArgumentCaptor.forClass(WorkplaceReportCreate.class);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        verify(reportService).reportWorkplace(idCaptor.capture(), reqCaptor.capture(), userCaptor.capture());

        assertThat(idCaptor.getValue()).isEqualTo(workplaceId);
        assertThat(userCaptor.getValue().getId()).isEqualTo(USER_1.getId());
    }

    @Test
    void reportWorkplace_whenUserDetailsPrincipal_resolvesUserFromEmail_andCallsService() throws Exception {
        Long workplaceId = 11L;
        User domainUser = USER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Workplace reported"))
                .andExpect(jsonPath("$.code").value("WORKPLACE_REPORTED"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reportService).reportWorkplace(eq(workplaceId), any(WorkplaceReportCreate.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void reportWorkplace_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 12L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isForbidden());

        verify(reportService, never()).reportWorkplace(anyLong(), any(), any());
    }

    @Test
    void reportWorkplace_whenPrincipalIsName_resolvesUserFromName_andCallsService() throws Exception {
        Long workplaceId = 13L;
        User domainUser = USER_1;
        String name = domainUser.getEmail();

        when(userRepository.findByEmail(name)).thenReturn(Optional.of(domainUser));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Workplace reported"))
                .andExpect(jsonPath("$.code").value("WORKPLACE_REPORTED"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reportService).reportWorkplace(eq(workplaceId), any(WorkplaceReportCreate.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void reportWorkplace_whenPrincipalNameUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 14L;
        String name = "missing@test.com";

        when(userRepository.findByEmail(name)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(name)).thenReturn(Optional.empty());

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isForbidden());

        verify(reportService, never()).reportWorkplace(anyLong(), any(), any());
    }

    @Test
    void reportWorkplace_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 15L;

        mockMvc.perform(post("/api/workplace/{id}/report", workplaceId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validWorkplaceReportBody()))
                .andExpect(status().isUnauthorized());

        verify(reportService, never()).reportWorkplace(anyLong(), any(), any());
    }

    // ========================================================================
    // REPORT REVIEW  (POST /api/workplace/{id}/review/{reviewId}/report)
    // ========================================================================

    @Test
    void reportReview_whenPrincipalIsDomainUser_callsServiceWithSameUser_andReturnsApiMessage() throws Exception {
        Long workplaceId = 20L;
        Long reviewId = 200L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Review reported"))
                .andExpect(jsonPath("$.code").value("REVIEW_REPORTED"));

        ArgumentCaptor<Long> wpCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<Long> reviewIdCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<ReviewReportCreate> reqCaptor = ArgumentCaptor.forClass(ReviewReportCreate.class);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        verify(reportService).reportReview(wpCaptor.capture(), reviewIdCaptor.capture(), reqCaptor.capture(), userCaptor.capture());

        assertThat(wpCaptor.getValue()).isEqualTo(workplaceId);
        assertThat(reviewIdCaptor.getValue()).isEqualTo(reviewId);
        assertThat(userCaptor.getValue().getId()).isEqualTo(USER_1.getId());
    }

    @Test
    void reportReview_whenUserDetailsPrincipal_resolvesUserFromEmail_andCallsService() throws Exception {
        Long workplaceId = 21L;
        Long reviewId = 201L;
        User domainUser = USER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Review reported"))
                .andExpect(jsonPath("$.code").value("REVIEW_REPORTED"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reportService).reportReview(eq(workplaceId), eq(reviewId), any(ReviewReportCreate.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void reportReview_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 22L;
        Long reviewId = 202L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isForbidden());

        verify(reportService, never()).reportReview(anyLong(), anyLong(), any(), any());
    }

    @Test
    void reportReview_whenPrincipalIsName_resolvesUserFromName_andCallsService() throws Exception {
        Long workplaceId = 23L;
        Long reviewId = 203L;
        User domainUser = USER_1;
        String name = domainUser.getEmail();

        when(userRepository.findByEmail(name)).thenReturn(Optional.of(domainUser));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Review reported"))
                .andExpect(jsonPath("$.code").value("REVIEW_REPORTED"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reportService).reportReview(eq(workplaceId), eq(reviewId), any(ReviewReportCreate.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void reportReview_whenPrincipalNameUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 24L;
        Long reviewId = 204L;
        String name = "missing@test.com";

        when(userRepository.findByEmail(name)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(name)).thenReturn(Optional.empty());

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isForbidden());

        verify(reportService, never()).reportReview(anyLong(), anyLong(), any(), any());
    }

    @Test
    void reportReview_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 25L;
        Long reviewId = 205L;

        mockMvc.perform(post("/api/workplace/{id}/review/{reviewId}/report", workplaceId, reviewId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validReviewReportBody()))
                .andExpect(status().isUnauthorized());

        verify(reportService, never()).reportReview(anyLong(), anyLong(), any(), any());
    }
}
