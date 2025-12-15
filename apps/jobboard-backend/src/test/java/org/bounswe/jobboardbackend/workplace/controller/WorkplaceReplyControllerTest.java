package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.workplace.dto.ApiMessage;
import org.bounswe.jobboardbackend.workplace.dto.ReplyCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReplyResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReplyUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkplaceReplyController.class)
class WorkplaceReplyControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private ReplyService replyService;

        @Autowired
        private ObjectMapper objectMapper;

        private UserDetailsImpl USER_DETAILS_EMPLOYER;
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
        }

        // ========================================================================
        // GET REPLY (GET /api/workplace/{workplaceId}/review/{reviewId}/reply)
        // ========================================================================

        @Test
        void getReply_whenAuthenticated_delegatesToService_andReturnsOk() throws Exception {
                Long workplaceId = 10L;
                Long reviewId = 100L;

                ReplyResponse response = new ReplyResponse();
                when(replyService.getReply(workplaceId, reviewId)).thenReturn(response);

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(get("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(replyService).getReply(workplaceId, reviewId);
        }

        @Test
        void getReply_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 11L;
                Long reviewId = 101L;

                mockMvc.perform(get("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId))
                                .andExpect(status().isUnauthorized());

                verify(replyService, never()).getReply(anyLong(), anyLong());
        }

        // ========================================================================
        // CREATE REPLY (POST /api/workplace/{workplaceId}/review/{reviewId}/reply)
        // ========================================================================

        @Test
        void createReply_whenAuthenticatedNonAdmin_callsServiceWithAdminFalse() throws Exception {
                Long workplaceId = 20L;
                Long reviewId = 200L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                ReplyCreateRequest req = new ReplyCreateRequest();
                req.setContent("some reply content");
                String body = objectMapper.writeValueAsString(req);

                ReplyResponse response = new ReplyResponse();
                when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                                eq(USER_DETAILS_EMPLOYER.getId()), eq(false)))
                                .thenReturn(response);

                mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

                verify(replyService).createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                                userIdCaptor.capture(), adminCaptor.capture());

                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_EMPLOYER.getId());
                assertThat(adminCaptor.getValue()).isFalse();
        }

        @Test
        void createReply_whenAuthenticatedAdmin_callsServiceWithAdminTrue() throws Exception {
                Long workplaceId = 21L;
                Long reviewId = 201L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                ReplyCreateRequest req = new ReplyCreateRequest();
                req.setContent("admin reply content");
                String body = objectMapper.writeValueAsString(req);

                ReplyResponse response = new ReplyResponse();
                when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                                eq(USER_DETAILS_ADMIN.getId()), eq(true)))
                                .thenReturn(response);

                mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                verify(replyService).createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                                eq(USER_DETAILS_ADMIN.getId()), eq(true));
        }

        @Test
        void createReply_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 25L;
                Long reviewId = 205L;

                ReplyCreateRequest req = new ReplyCreateRequest();
                req.setContent("unauthenticated content");
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isUnauthorized());

                verify(replyService, never()).createReply(anyLong(), anyLong(), any(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // UPDATE REPLY (PUT /api/workplace/{workplaceId}/review/{reviewId}/reply)
        // ========================================================================

        @Test
        void updateReply_whenAuthenticatedNonAdmin_callsServiceWithAdminFalse() throws Exception {
                Long workplaceId = 30L;
                Long reviewId = 300L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                ReplyUpdateRequest req = new ReplyUpdateRequest();
                req.setContent("updated reply content");
                String body = objectMapper.writeValueAsString(req);

                ReplyResponse response = new ReplyResponse();
                when(replyService.updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                                eq(USER_DETAILS_EMPLOYER.getId()), eq(false)))
                                .thenReturn(response);

                mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                verify(replyService).updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                                eq(USER_DETAILS_EMPLOYER.getId()), eq(false));
        }

        @Test
        void updateReply_whenAuthenticatedAdmin_callsServiceWithAdminTrue() throws Exception {
                Long workplaceId = 31L;
                Long reviewId = 301L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                ReplyUpdateRequest req = new ReplyUpdateRequest();
                req.setContent("admin updated reply");
                String body = objectMapper.writeValueAsString(req);

                ReplyResponse response = new ReplyResponse();
                when(replyService.updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                                eq(USER_DETAILS_ADMIN.getId()), eq(true)))
                                .thenReturn(response);

                mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                verify(replyService).updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                                eq(USER_DETAILS_ADMIN.getId()), eq(true));
        }

        @Test
        void updateReply_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 33L;
                Long reviewId = 303L;

                ReplyUpdateRequest req = new ReplyUpdateRequest();
                req.setContent("unauthenticated update content");
                String body = objectMapper.writeValueAsString(req);

                mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isUnauthorized());

                verify(replyService, never()).updateReply(anyLong(), anyLong(), any(), anyLong(), anyBoolean());
        }

        // ========================================================================
        // DELETE REPLY (DELETE /api/workplace/{workplaceId}/review/{reviewId}/reply)
        // ========================================================================

        @Test
        void deleteReply_whenAuthenticatedNonAdmin_callsServiceWithAdminFalse_andReturnsApiMessage()
                        throws Exception {
                Long workplaceId = 40L;
                Long reviewId = 400L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_EMPLOYER,
                                null,
                                USER_DETAILS_EMPLOYER.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Reply deleted"))
                                .andExpect(jsonPath("$.code").value("REPLY_DELETED"));

                verify(replyService).deleteReply(workplaceId, reviewId, USER_DETAILS_EMPLOYER.getId(), false);
        }

        @Test
        void deleteReply_whenAuthenticatedAdmin_callsServiceWithAdminTrue() throws Exception {
                Long workplaceId = 41L;
                Long reviewId = 401L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_ADMIN,
                                null,
                                USER_DETAILS_ADMIN.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk());

                verify(replyService).deleteReply(workplaceId, reviewId, USER_DETAILS_ADMIN.getId(), true);
        }

        @Test
        void deleteReply_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 43L;
                Long reviewId = 403L;

                mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());

                verify(replyService, never()).deleteReply(anyLong(), anyLong(), any(), anyBoolean());
        }
}
