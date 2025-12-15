package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.workplace.dto.EmployerRequestCreate;
import org.bounswe.jobboardbackend.workplace.dto.EmployerRequestResolve;
import org.bounswe.jobboardbackend.workplace.dto.EmployerRequestResponse;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.service.EmployerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkplaceEmployerController.class)
class WorkplaceEmployerControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private EmployerService employerService;

        @Autowired
        private ObjectMapper objectMapper;

        private UserDetailsImpl USER_DETAILS_EMPLOYER;
        private UserDetailsImpl USER_DETAILS_JOBSEEKER;
        private UserDetailsImpl USER_DETAILS_ADMIN;

        @BeforeEach
        void setUp() {
                USER_DETAILS_EMPLOYER = new UserDetailsImpl(
                                1L,
                                "employer",
                                "employer@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYER")),
                                false);

                USER_DETAILS_ADMIN = new UserDetailsImpl(
                                2L,
                                "admin",
                                "admin@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")),
                                false);

                USER_DETAILS_JOBSEEKER = new UserDetailsImpl(
                                3L,
                                "jobseeker",
                                "jobseeker@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_JOBSEEKER")),
                                false);
        }

        // ========================================================================
        // LIST EMPLOYERS (GET /api/workplace/{workplaceId}/employers)
        // ========================================================================

        @Test
        void listEmployers_whenCalled_delegatesToService_andReturnsOk() throws Exception {
                Long workplaceId = 10L;
                when(employerService.listEmployers(workplaceId)).thenReturn(Collections.emptyList());

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers", workplaceId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(employerService).listEmployers(workplaceId);
        }

        @Test
        void listEmployers_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 11L;

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers", workplaceId))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).listEmployers(anyLong());
        }

        // ========================================================================
        // MY WORKPLACES (GET /api/workplace/employers/me)
        // ========================================================================

        @Test
        void myWorkplaces_whenAuthenticated_callsServiceWithSameUserId() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(employerService.listWorkplacesOfEmployer(anyLong()))
                                .thenReturn(Collections.emptyList());

                mockMvc.perform(get("/api/workplace/employers/me")
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
                verify(employerService).listWorkplacesOfEmployer(idCaptor.capture());
                assertThat(idCaptor.getValue()).isEqualTo(USER_DETAILS_EMPLOYER.getId());
        }

        @Test
        void myWorkplaces_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                mockMvc.perform(get("/api/workplace/employers/me"))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).listWorkplacesOfEmployer(anyLong());
        }

        // ========================================================================
        // LIST REQUESTS (GET /api/workplace/{workplaceId}/employers/request)
        // ========================================================================

        @Test
        void listRequests_whenCalledWithParams_nonAdmin_usesCurrentUserIdAndAdminFalse() throws Exception {
                Long workplaceId = 20L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(employerService.listRequests(anyLong(), anyInt(), anyInt(), anyLong(), anyBoolean()))
                                .thenReturn(PaginatedResponse.of(Collections.emptyList(), 1, 5, 0));

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request", workplaceId)
                                .with(authentication(auth))
                                .param("page", "1")
                                .param("size", "5"))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> workplaceCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
                ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);
                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

                verify(employerService).listRequests(
                                workplaceCaptor.capture(),
                                pageCaptor.capture(),
                                sizeCaptor.capture(),
                                userIdCaptor.capture(),
                                adminCaptor.capture());

                assertThat(workplaceCaptor.getValue()).isEqualTo(workplaceId);
                assertThat(pageCaptor.getValue()).isEqualTo(1);
                assertThat(sizeCaptor.getValue()).isEqualTo(5);
                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_EMPLOYER.getId());
                assertThat(adminCaptor.getValue()).isFalse();
        }

        @Test
        void listRequests_whenCalledWithoutParams_usesDefaults() throws Exception {
                Long workplaceId = 20L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(employerService.listRequests(anyLong(), anyInt(), anyInt(), anyLong(), anyBoolean()))
                                .thenReturn(PaginatedResponse.of(Collections.emptyList(), 0, 10, 0));

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request", workplaceId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
                ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);
                verify(employerService).listRequests(
                                anyLong(),
                                pageCaptor.capture(),
                                sizeCaptor.capture(),
                                anyLong(),
                                anyBoolean());

                assertThat(pageCaptor.getValue()).isEqualTo(0);
                assertThat(sizeCaptor.getValue()).isEqualTo(10);
        }

        @Test
        void listRequests_whenPrincipalIsAdmin_setsAdminFlagTrue() throws Exception {
                Long workplaceId = 21L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                when(employerService.listRequests(anyLong(), anyInt(), anyInt(), anyLong(), anyBoolean()))
                                .thenReturn(PaginatedResponse.of(Collections.emptyList(), 0, 10, 0));

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request", workplaceId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

                verify(employerService).listRequests(
                                anyLong(),
                                anyInt(),
                                anyInt(),
                                userIdCaptor.capture(),
                                adminCaptor.capture());

                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_ADMIN.getId());
                assertThat(adminCaptor.getValue()).isTrue();
        }

        @Test
        void listRequests_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 22L;

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request", workplaceId))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).listRequests(anyLong(), anyInt(), anyInt(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // CREATE REQUEST (POST /api/workplace/{workplaceId}/employers/request)
        // ========================================================================

        @Test
        void createRequest_whenAuthenticated_callsServiceWithCurrentUser_andReturnsApiMessage() throws Exception {
                Long workplaceId = 30L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                EmployerRequestCreate req = new EmployerRequestCreate();
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace/{workplaceId}/employers/request", workplaceId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Employer request created"))
                                .andExpect(jsonPath("$.code").value("EMPLOYER_REQUEST_CREATED"));

                verify(employerService).createRequest(eq(workplaceId), any(EmployerRequestCreate.class),
                                eq(USER_DETAILS_EMPLOYER.getId()));
        }

        @Test
        void createRequest_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 30L;

                EmployerRequestCreate req = new EmployerRequestCreate();
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace/{workplaceId}/employers/request", workplaceId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).createRequest(anyLong(), any(), anyLong());
        }

        // ========================================================================
        // GET REQUEST (GET /api/workplace/{workplaceId}/employers/request/{requestId})
        // ========================================================================

        @Test
        void getRequest_whenAuthenticatedNonAdmin_delegatesToServiceWithUserId_andAdminFalse() throws Exception {
                Long workplaceId = 40L;
                Long requestId = 400L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(employerService.getRequest(anyLong(), anyLong(), anyLong(), anyBoolean()))
                                .thenReturn(new EmployerRequestResponse());

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request/{requestId}", workplaceId,
                                requestId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> workplaceCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Long> requestCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

                verify(employerService).getRequest(
                                workplaceCaptor.capture(),
                                requestCaptor.capture(),
                                userIdCaptor.capture(),
                                adminCaptor.capture());

                assertThat(workplaceCaptor.getValue()).isEqualTo(workplaceId);
                assertThat(requestCaptor.getValue()).isEqualTo(requestId);
                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_EMPLOYER.getId());
                assertThat(adminCaptor.getValue()).isFalse();
        }

        @Test
        void getRequest_whenAuthenticatedAdmin_setsAdminTrue() throws Exception {
                Long workplaceId = 41L;
                Long requestId = 401L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                when(employerService.getRequest(anyLong(), anyLong(), anyLong(), anyBoolean()))
                                .thenReturn(new EmployerRequestResponse());

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request/{requestId}", workplaceId,
                                requestId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

                verify(employerService).getRequest(
                                anyLong(),
                                anyLong(),
                                userIdCaptor.capture(),
                                adminCaptor.capture());

                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_ADMIN.getId());
                assertThat(adminCaptor.getValue()).isTrue();
        }

        @Test
        void getRequest_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 42L;
                Long requestId = 402L;

                mockMvc.perform(get("/api/workplace/{workplaceId}/employers/request/{requestId}", workplaceId,
                                requestId))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).getRequest(anyLong(), anyLong(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // RESOLVE REQUEST (POST
        // /api/workplace/{workplaceId}/employers/request/{requestId})
        // ========================================================================

        @Test
        void resolveRequest_whenAuthenticatedAdmin_callsServiceWithAdminTrue_andReturnsApiMessage() throws Exception {
                Long workplaceId = 50L;
                Long requestId = 500L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                EmployerRequestResolve req = new EmployerRequestResolve();
                req.setAction("APPROVE");
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace/{workplaceId}/employers/request/{requestId}", workplaceId,
                                requestId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Employer request resolved"))
                                .andExpect(jsonPath("$.code").value("EMPLOYER_REQUEST_RESOLVED"));

                verify(employerService).resolveRequest(eq(workplaceId), eq(requestId),
                                any(EmployerRequestResolve.class), eq(USER_DETAILS_ADMIN.getId()), eq(true));
        }

        @Test
        void resolveRequest_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 50L;
                Long requestId = 500L;

                EmployerRequestResolve req = new EmployerRequestResolve();
                req.setAction("APPROVE");
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace/{workplaceId}/employers/request/{requestId}", workplaceId,
                                requestId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).resolveRequest(anyLong(), anyLong(), any(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // REMOVE EMPLOYER (DELETE /api/workplace/{workplaceId}/employers/{employerId})
        // ========================================================================

        @Test
        void removeEmployer_whenAuthenticatedNonAdmin_callsServiceWithAdminFalse_andReturnsApiMessage()
                        throws Exception {
                Long workplaceId = 60L;
                Long employerId = 600L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{workplaceId}/employers/{employerId}", workplaceId, employerId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Employer removed"))
                                .andExpect(jsonPath("$.code").value("EMPLOYER_REMOVED"));

                verify(employerService).removeEmployer(workplaceId, employerId, USER_DETAILS_EMPLOYER.getId(), false);
        }

        @Test
        void removeEmployer_whenAuthenticatedAdmin_callsServiceWithAdminTrue() throws Exception {
                Long workplaceId = 61L;
                Long employerId = 601L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{workplaceId}/employers/{employerId}", workplaceId, employerId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk());

                verify(employerService).removeEmployer(workplaceId, employerId, USER_DETAILS_ADMIN.getId(), true);
        }

        @Test
        void removeEmployer_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 62L;
                Long employerId = 602L;

                mockMvc.perform(delete("/api/workplace/{workplaceId}/employers/{employerId}", workplaceId, employerId)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).removeEmployer(anyLong(), anyLong(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // MY REQUESTS (GET /api/workplace/employers/requests/me)
        // ========================================================================

        @Test
        void myRequests_whenCalledWithParams_delegatesToServiceWithCurrentUserId() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_JOBSEEKER,
                                null,
                                USER_DETAILS_JOBSEEKER.getAuthorities());

                when(employerService.listMyRequests(anyLong(), anyInt(), anyInt()))
                                .thenReturn(PaginatedResponse.of(Collections.emptyList(), 2, 15, 0));

                mockMvc.perform(get("/api/workplace/employers/requests/me")
                                .with(authentication(auth))
                                .param("page", "2")
                                .param("size", "15"))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
                ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);

                verify(employerService).listMyRequests(
                                userIdCaptor.capture(),
                                pageCaptor.capture(),
                                sizeCaptor.capture());

                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_JOBSEEKER.getId());
                assertThat(pageCaptor.getValue()).isEqualTo(2);
                assertThat(sizeCaptor.getValue()).isEqualTo(15);
        }

        @Test
        void myRequests_whenCalledWithoutParams_usesDefaults() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_JOBSEEKER,
                                null,
                                USER_DETAILS_JOBSEEKER.getAuthorities());

                when(employerService.listMyRequests(anyLong(), anyInt(), anyInt()))
                                .thenReturn(PaginatedResponse.of(Collections.emptyList(), 0, 10, 0));

                mockMvc.perform(get("/api/workplace/employers/requests/me")
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
                ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);

                verify(employerService).listMyRequests(
                                anyLong(),
                                pageCaptor.capture(),
                                sizeCaptor.capture());

                assertThat(pageCaptor.getValue()).isEqualTo(0);
                assertThat(sizeCaptor.getValue()).isEqualTo(10);
        }

        @Test
        void myRequests_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                mockMvc.perform(get("/api/workplace/employers/requests/me"))
                                .andExpect(status().isUnauthorized());

                verify(employerService, never()).listMyRequests(anyLong(), anyInt(), anyInt());
        }
}
