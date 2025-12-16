package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceDetailResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceImageResponseDto;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceRatingResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkplaceController.class)
class WorkplaceControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private WorkplaceService workplaceService;

        @Autowired
        private ObjectMapper objectMapper;

        private UserDetailsImpl USER_DETAILS_EMPLOYER;
        private UserDetailsImpl USER_DETAILS_JOBSEEKER;

        @BeforeEach
        void setUp() {
                USER_DETAILS_EMPLOYER = new UserDetailsImpl(
                                1L,
                                "employer",
                                "employer@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYER")),
                                false);

                USER_DETAILS_JOBSEEKER = new UserDetailsImpl(
                                2L,
                                "jobseeker",
                                "jobseeker@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_JOBSEEKER")),
                                false);
        }

        // ========================================================================
        // CREATE (/api/workplace - POST)
        // ========================================================================

        @Test
        void create_whenAuthenticatedEmployer_callsServiceWithUserId() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                WorkplaceCreateRequest req = new WorkplaceCreateRequest();
                req.setCompanyName("Test Company");
                req.setSector("Tech");
                req.setLocation("Istanbul");
                String body = objectMapper.writeValueAsString(req);

                when(workplaceService.create(any(WorkplaceCreateRequest.class), eq(USER_DETAILS_EMPLOYER.getId())))
                                .thenReturn(new WorkplaceDetailResponse());

                mockMvc.perform(post("/api/workplace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                verify(workplaceService).create(any(WorkplaceCreateRequest.class), userIdCaptor.capture());
                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_EMPLOYER.getId());
        }

        @Test
        void create_whenAuthenticatedJobseeker_callsServiceWithUserId() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_JOBSEEKER,
                                null,
                                USER_DETAILS_JOBSEEKER.getAuthorities());

                WorkplaceCreateRequest req = new WorkplaceCreateRequest();
                req.setCompanyName("Test Company");
                req.setSector("Tech");
                req.setLocation("Istanbul");
                String body = objectMapper.writeValueAsString(req);

                when(workplaceService.create(any(WorkplaceCreateRequest.class), eq(USER_DETAILS_JOBSEEKER.getId())))
                                .thenReturn(new WorkplaceDetailResponse());

                mockMvc.perform(post("/api/workplace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                verify(workplaceService).create(any(WorkplaceCreateRequest.class), userIdCaptor.capture());
                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_JOBSEEKER.getId());
        }

        @Test
        void create_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                WorkplaceCreateRequest req = new WorkplaceCreateRequest();
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(workplaceService, never()).create(any(), any());
        }

        // ========================================================================
        // UPLOAD IMAGE (/api/workplace/{id}/image - POST multipart)
        // ========================================================================

        @Test
        void uploadImage_whenAuthenticated_callsServiceWithUserId() throws Exception {
                Long workplaceId = 10L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(workplaceService.uploadImage(eq(workplaceId), any(), eq(USER_DETAILS_EMPLOYER.getId())))
                                .thenReturn(new WorkplaceImageResponseDto());

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "logo.png",
                                MediaType.IMAGE_PNG_VALUE,
                                "dummy".getBytes());

                mockMvc.perform(multipart("/api/workplace/{id}/image", workplaceId)
                                .file(file)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk());

                verify(workplaceService).uploadImage(eq(workplaceId), any(), eq(USER_DETAILS_EMPLOYER.getId()));
        }

        @Test
        void uploadImage_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 10L;

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "logo.png",
                                MediaType.IMAGE_PNG_VALUE,
                                "dummy".getBytes());

                mockMvc.perform(multipart("/api/workplace/{id}/image", workplaceId)
                                .file(file)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(workplaceService, never()).uploadImage(anyLong(), any(), anyLong());
        }

        // ========================================================================
        // DELETE IMAGE (/api/workplace/{id}/image - DELETE)
        // ========================================================================

        @Test
        void deleteImage_whenAuthenticated_callsServiceAndReturnsApiMessage() throws Exception {
                Long workplaceId = 20L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{id}/image", workplaceId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Workplace image deleted"))
                                .andExpect(jsonPath("$.code").value("WORKPLACE_IMAGE_DELETED"));

                verify(workplaceService).deleteImage(workplaceId, USER_DETAILS_EMPLOYER.getId());
        }

        @Test
        void deleteImage_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 20L;

                mockMvc.perform(delete("/api/workplace/{id}/image", workplaceId)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(workplaceService, never()).deleteImage(anyLong(), anyLong());
        }

        // ========================================================================
        // LIST (/api/workplace - GET)
        // ========================================================================

        @Test
        void list_whenCalledWithParams_delegatesToServiceWithSameValues() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(workplaceService.listBrief(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                                .thenReturn(PaginatedResponse.of(List.of(), 1, 20, 0));

                mockMvc.perform(get("/api/workplace")
                                .with(authentication(auth))
                                .param("page", "1")
                                .param("size", "20")
                                .param("sector", "Tech")
                                .param("location", "Istanbul")
                                .param("ethicalTag", "SALARY_TRANSPARENCY")
                                .param("minRating", "3.5")
                                .param("sortBy", "ratingDesc")
                                .param("search", "Ethica"))
                                .andExpect(status().isOk());

                verify(workplaceService).listBrief(
                                1, 20,
                                "Tech",
                                "Istanbul",
                                "SALARY_TRANSPARENCY",
                                3.5,
                                "ratingDesc",
                                "Ethica");
        }

        @Test
        void list_whenCalledWithoutParams_usesDefaultValues() throws Exception {
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(workplaceService.listBrief(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                                .thenReturn(PaginatedResponse.of(List.of(), 0, 12, 0));

                mockMvc.perform(get("/api/workplace")
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(workplaceService).listBrief(
                                0, 12,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null);
        }

        // ========================================================================
        // DETAIL (/api/workplace/{id} - GET)
        // ========================================================================

        @Test
        void detail_whenCalledWithoutParams_usesDefaultIncludeReviewsAndLimit() throws Exception {
                Long workplaceId = 30L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(workplaceService.getDetail(anyLong(), anyBoolean(), anyInt()))
                                .thenReturn(new WorkplaceDetailResponse());

                mockMvc.perform(get("/api/workplace/{id}", workplaceId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(workplaceService).getDetail(workplaceId, false, 3);
        }

        @Test
        void detail_whenCalledWithParams_usesProvidedValues() throws Exception {
                Long workplaceId = 30L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                when(workplaceService.getDetail(anyLong(), anyBoolean(), anyInt()))
                                .thenReturn(new WorkplaceDetailResponse());

                mockMvc.perform(get("/api/workplace/{id}", workplaceId)
                                .with(authentication(auth))
                                .param("includeReviews", "true")
                                .param("reviewsLimit", "10"))
                                .andExpect(status().isOk());

                verify(workplaceService).getDetail(workplaceId, true, 10);
        }

        // ========================================================================
        // UPDATE (/api/workplace/{id} - PUT)
        // ========================================================================

        @Test
        void update_whenAuthenticated_callsServiceWithUserId() throws Exception {
                Long workplaceId = 40L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                WorkplaceUpdateRequest req = new WorkplaceUpdateRequest();
                String body = objectMapper.writeValueAsString(req);

                when(workplaceService.update(anyLong(), any(WorkplaceUpdateRequest.class),
                                eq(USER_DETAILS_EMPLOYER.getId())))
                                .thenReturn(new WorkplaceDetailResponse());

                mockMvc.perform(put("/api/workplace/{id}", workplaceId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                verify(workplaceService).update(eq(workplaceId), any(WorkplaceUpdateRequest.class),
                                eq(USER_DETAILS_EMPLOYER.getId()));
        }

        @Test
        void update_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 40L;

                WorkplaceUpdateRequest req = new WorkplaceUpdateRequest();
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(put("/api/workplace/{id}", workplaceId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(workplaceService, never()).update(anyLong(), any(), anyLong());
        }

        // ========================================================================
        // DELETE WORKPLACE (/api/workplace/{id} - DELETE)
        // ========================================================================

        @Test
        void deleteWorkplace_whenAuthenticated_callsServiceAndReturnsApiMessage() throws Exception {
                Long workplaceId = 50L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{id}", workplaceId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Workplace deleted"))
                                .andExpect(jsonPath("$.code").value("WORKPLACE_DELETED"));

                verify(workplaceService).softDelete(workplaceId, USER_DETAILS_EMPLOYER.getId());
        }

        @Test
        void deleteWorkplace_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 50L;

                mockMvc.perform(delete("/api/workplace/{id}", workplaceId)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(workplaceService, never()).softDelete(anyLong(), anyLong());
        }

        // ========================================================================
        // GET RATING (/api/workplace/{id}/rating - GET)
        // ========================================================================

        @Test
        void getRating_whenCalled_delegatesToService() throws Exception {
                Long workplaceId = 60L;
                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());
                when(workplaceService.getRating(anyLong())).thenReturn(new WorkplaceRatingResponse());

                mockMvc.perform(get("/api/workplace/{id}/rating", workplaceId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(workplaceService).getRating(workplaceId);
        }

}