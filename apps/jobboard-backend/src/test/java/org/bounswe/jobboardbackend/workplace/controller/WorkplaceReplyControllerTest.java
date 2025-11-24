package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.dto.ApiMessage;
import org.bounswe.jobboardbackend.workplace.dto.ReplyCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReplyResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReplyUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
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

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User userEntity(Long id) {
        return User.builder()
                .id(id)
                .username("user" + id)
                .email("user" + id + "@test.com")
                .password("password-" + id)
                .role(Role.ROLE_EMPLOYER)
                .emailVerified(true)
                .build();
    }

    private final User USER_1 = userEntity(1L);
    private final User USER_2 = userEntity(2L);

    // ========================================================================
    // GET REPLY  (GET /api/workplace/{workplaceId}/review/{reviewId}/reply)
    // ========================================================================

    @Test
    void getReply_whenAuthenticated_delegatesToService_andReturnsOk() throws Exception {
        Long workplaceId = 10L;
        Long reviewId = 100L;

        ReplyResponse response = new ReplyResponse();
        when(replyService.getReply(workplaceId, reviewId)).thenReturn(response);

        mockMvc.perform(get("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(user("user1@test.com")))
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
    // CREATE REPLY  (POST /api/workplace/{workplaceId}/review/{reviewId}/reply)
    // ========================================================================

    @Test
    void createReply_whenPrincipalIsDomainUser_nonAdmin_callsServiceWithSameUser_andAdminFalse() throws Exception {
        Long workplaceId = 20L;
        Long reviewId = 200L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("some reply content");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(USER_1.getId()), eq(false)))
                .thenReturn(response);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(replyService).createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(USER_1.getId()), eq(false));
    }

    @Test
    void createReply_whenPrincipalIsAdmin_callsServiceWithAdminTrue() throws Exception {
        Long workplaceId = 21L;
        Long reviewId = 201L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_2,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("admin reply content");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(USER_2.getId()), eq(true)))
                .thenReturn(response);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(replyService).createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(USER_2.getId()), eq(true));
    }

    @Test
    void createReply_whenUserDetailsPrincipal_resolvesUserFromEmail_andCallsService() throws Exception {
        Long workplaceId = 22L;
        Long reviewId = 202L;
        User domainUser = USER_1;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));

        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("reply from user details");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(domainUser.getId()), eq(false)))
                .thenReturn(response);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<Boolean> adminCaptor = ArgumentCaptor.forClass(Boolean.class);

        verify(replyService).createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                userIdCaptor.capture(), adminCaptor.capture());

        assertThat(userIdCaptor.getValue()).isEqualTo(domainUser.getId());
        assertThat(adminCaptor.getValue()).isFalse();
    }

    @Test
    void createReply_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 23L;
        Long reviewId = 203L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("content for unknown user");
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(replyService, never()).createReply(anyLong(), anyLong(), any(), anyLong(), anyBoolean());
    }

    @Test
    void createReply_whenPrincipalIsName_resolvesUserFromName_andCallsService() throws Exception {
        Long workplaceId = 24L;
        Long reviewId = 204L;
        User domainUser = USER_2;
        String name = domainUser.getEmail();

        when(userRepository.findByEmail(name)).thenReturn(Optional.of(domainUser));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("reply from name principal");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.createReply(eq(workplaceId), eq(reviewId), any(ReplyCreateRequest.class),
                eq(domainUser.getId()), eq(false)))
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

        assertThat(userIdCaptor.getValue()).isEqualTo(domainUser.getId());
        assertThat(adminCaptor.getValue()).isFalse();
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
    // UPDATE REPLY  (PUT /api/workplace/{workplaceId}/review/{reviewId}/reply)
    // ========================================================================

    @Test
    void updateReply_whenPrincipalIsDomainUser_nonAdmin_callsServiceWithSameUser_andAdminFalse() throws Exception {
        Long workplaceId = 30L;
        Long reviewId = 300L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        ReplyUpdateRequest req = new ReplyUpdateRequest();
        req.setContent("updated reply content");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                eq(USER_1.getId()), eq(false)))
                .thenReturn(response);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(replyService).updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                eq(USER_1.getId()), eq(false));
    }

    @Test
    void updateReply_whenPrincipalIsAdmin_callsServiceWithAdminTrue() throws Exception {
        Long workplaceId = 31L;
        Long reviewId = 301L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_2,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        ReplyUpdateRequest req = new ReplyUpdateRequest();
        req.setContent("admin updated reply");
        String body = objectMapper.writeValueAsString(req);

        ReplyResponse response = new ReplyResponse();
        when(replyService.updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                eq(USER_2.getId()), eq(true)))
                .thenReturn(response);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(replyService).updateReply(eq(workplaceId), eq(reviewId), any(ReplyUpdateRequest.class),
                eq(USER_2.getId()), eq(true));
    }

    @Test
    void updateReply_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 32L;
        Long reviewId = 302L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        ReplyUpdateRequest req = new ReplyUpdateRequest();
        req.setContent("update attempt by unknown");
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(replyService, never()).updateReply(anyLong(), anyLong(), any(), anyLong(), anyBoolean());
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
    // DELETE REPLY  (DELETE /api/workplace/{workplaceId}/review/{reviewId}/reply)
    // ========================================================================

    @Test
    void deleteReply_whenPrincipalIsDomainUser_nonAdmin_callsServiceWithAdminFalse_andReturnsApiMessage() throws Exception {
        Long workplaceId = 40L;
        Long reviewId = 400L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Reply deleted"))
                .andExpect(jsonPath("$.code").value("REPLY_DELETED"));

        verify(replyService).deleteReply(workplaceId, reviewId, USER_1.getId(), false);
    }

    @Test
    void deleteReply_whenPrincipalIsAdmin_callsServiceWithAdminTrue() throws Exception {
        Long workplaceId = 41L;
        Long reviewId = 401L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_2,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(replyService).deleteReply(workplaceId, reviewId, USER_2.getId(), true);
    }

    @Test
    void deleteReply_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 42L;
        Long reviewId = 402L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}/reply", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(replyService, never()).deleteReply(anyLong(), anyLong(), any(), anyBoolean());
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
