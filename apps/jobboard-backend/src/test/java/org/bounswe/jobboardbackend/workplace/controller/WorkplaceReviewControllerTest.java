package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReviewResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
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

@WebMvcTest(controllers = WorkplaceReviewController.class)
class WorkplaceReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReviewService reviewService;

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
                .role(Role.ROLE_JOBSEEKER)
                .emailVerified(true)
                .build();
    }

    private final User USER_1 = userEntity(1L);
    private final User USER_2 = userEntity(2L);

    // ========================================================================
    // CREATE REVIEW  (POST /api/workplace/{workplaceId}/review)
    // ========================================================================

    @Test
    void create_whenPrincipalIsDomainUser_callsServiceWithSameUser() throws Exception {
        Long workplaceId = 10L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        ReviewCreateRequest req = new ReviewCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        ReviewResponse response = new ReviewResponse();
        when(reviewService.createReview(eq(workplaceId), any(ReviewCreateRequest.class), eq(USER_1)))
                .thenReturn(response);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<Long> workplaceCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<ReviewCreateRequest> reqCaptor = ArgumentCaptor.forClass(ReviewCreateRequest.class);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        verify(reviewService).createReview(workplaceCaptor.capture(), reqCaptor.capture(), userCaptor.capture());
        assertThat(workplaceCaptor.getValue()).isEqualTo(workplaceId);
        assertThat(userCaptor.getValue().getId()).isEqualTo(USER_1.getId());
    }

    @Test
    void create_whenUserDetailsPrincipal_resolvesUserFromEmail_andCallsService() throws Exception {
        Long workplaceId = 11L;
        User domainUser = USER_2;
        String principalKey = domainUser.getEmail();

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.of(domainUser));

        ReviewCreateRequest req = new ReviewCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        when(reviewService.createReview(eq(workplaceId), any(ReviewCreateRequest.class), eq(domainUser)))
                .thenReturn(new ReviewResponse());

        mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reviewService).createReview(eq(workplaceId), any(ReviewCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void create_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 12L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        ReviewCreateRequest req = new ReviewCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).createReview(anyLong(), any(), any());
    }

    @Test
    void create_whenPrincipalIsName_resolvesUserFromName_andCallsService() throws Exception {
        Long workplaceId = 13L;
        User domainUser = USER_1;
        String name = domainUser.getEmail();

        when(userRepository.findByEmail(name)).thenReturn(Optional.of(domainUser));

        Authentication auth = new UsernamePasswordAuthenticationToken(
                name,
                "pwd",
                Collections.emptyList()
        );

        ReviewCreateRequest req = new ReviewCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        when(reviewService.createReview(eq(workplaceId), any(ReviewCreateRequest.class), eq(domainUser)))
                .thenReturn(new ReviewResponse());

        mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(reviewService).createReview(eq(workplaceId), any(ReviewCreateRequest.class), userCaptor.capture());
        assertThat(userCaptor.getValue().getId()).isEqualTo(domainUser.getId());
    }

    @Test
    void create_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 14L;

        ReviewCreateRequest req = new ReviewCreateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        verify(reviewService, never()).createReview(anyLong(), any(), any());
    }

    // ========================================================================
    // LIST REVIEWS  (GET /api/workplace/{workplaceId}/review)
    // ========================================================================

    @Test
    void list_whenCalledWithAllParams_delegatesToService() throws Exception {
        Long workplaceId = 20L;
        int page = 1;
        int size = 5;
        String ratingFilter = "3.5,4.2";
        String sortBy = "rating";
        Boolean hasComment = true;
        String policy = "ENVIRONMENT";
        Integer policyMin = 2;

        PaginatedResponse<ReviewResponse> response =
                PaginatedResponse.of(Collections.emptyList(), page, size, 0);
        when(reviewService.listReviews(
                anyLong(), anyInt(), anyInt(), any(), any(), any(), any(), any())
        ).thenReturn(response);

        mockMvc.perform(get("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(user("user1@test.com"))
                        .param("page", String.valueOf(page))
                        .param("size", String.valueOf(size))
                        .param("ratingFilter", ratingFilter)
                        .param("sortBy", sortBy)
                        .param("hasComment", String.valueOf(hasComment))
                        .param("policy", policy)
                        .param("policyMin", String.valueOf(policyMin)))
                .andExpect(status().isOk());

        ArgumentCaptor<Long> wpCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<String> ratingCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> sortCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Boolean> hasCommentCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<String> policyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Integer> policyMinCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(reviewService).listReviews(
                wpCaptor.capture(),
                pageCaptor.capture(),
                sizeCaptor.capture(),
                ratingCaptor.capture(),
                sortCaptor.capture(),
                hasCommentCaptor.capture(),
                policyCaptor.capture(),
                policyMinCaptor.capture()
        );

        assertThat(wpCaptor.getValue()).isEqualTo(workplaceId);
        assertThat(pageCaptor.getValue()).isEqualTo(page);
        assertThat(sizeCaptor.getValue()).isEqualTo(size);
        assertThat(ratingCaptor.getValue()).isEqualTo(ratingFilter);
        assertThat(sortCaptor.getValue()).isEqualTo(sortBy);
        assertThat(hasCommentCaptor.getValue()).isEqualTo(hasComment);
        assertThat(policyCaptor.getValue()).isEqualTo(policy);
        assertThat(policyMinCaptor.getValue()).isEqualTo(policyMin);
    }

    @Test
    void list_whenCalledWithoutParams_usesDefaults() throws Exception {
        Long workplaceId = 21L;

        PaginatedResponse<ReviewResponse> response =
                PaginatedResponse.of(Collections.emptyList(), 0, 10, 0);
        when(reviewService.listReviews(
                anyLong(), anyInt(), anyInt(), any(), any(), any(), any(), any())
        ).thenReturn(response);

        mockMvc.perform(get("/api/workplace/{workplaceId}/review", workplaceId)
                        .with(user("user1@test.com")))
                .andExpect(status().isOk());

        ArgumentCaptor<Integer> pageCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(reviewService).listReviews(
                anyLong(),
                pageCaptor.capture(),
                sizeCaptor.capture(),
                any(),
                any(),
                any(),
                any(),
                any()
        );

        assertThat(pageCaptor.getValue()).isEqualTo(0);
        assertThat(sizeCaptor.getValue()).isEqualTo(10);
    }

    // ========================================================================
    // GET ONE REVIEW  (GET /api/workplace/{workplaceId}/review/{reviewId})
    // ========================================================================

    @Test
    void getOne_whenCalled_delegatesToService() throws Exception {
        Long workplaceId = 30L;
        Long reviewId = 300L;

        ReviewResponse res = new ReviewResponse();
        when(reviewService.getOne(workplaceId, reviewId)).thenReturn(res);

        mockMvc.perform(get("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(user("user1@test.com")))
                .andExpect(status().isOk());

        verify(reviewService).getOne(workplaceId, reviewId);
    }

    // ========================================================================
    // UPDATE REVIEW  (PUT /api/workplace/{workplaceId}/review/{reviewId})
    // ========================================================================

    @Test
    void update_whenPrincipalIsDomainUser_callsServiceWithSameUser() throws Exception {
        Long workplaceId = 40L;
        Long reviewId = 400L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        ReviewUpdateRequest req = new ReviewUpdateRequest();
        String body = objectMapper.writeValueAsString(req);

        ReviewResponse response = new ReviewResponse();
        when(reviewService.updateReview(eq(workplaceId), eq(reviewId), any(ReviewUpdateRequest.class), eq(USER_1)))
                .thenReturn(response);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(reviewService).updateReview(eq(workplaceId), eq(reviewId), any(ReviewUpdateRequest.class), eq(USER_1));
    }

    @Test
    void update_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 41L;
        Long reviewId = 401L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        ReviewUpdateRequest req = new ReviewUpdateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).updateReview(anyLong(), anyLong(), any(), any());
    }

    @Test
    void update_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 42L;
        Long reviewId = 402L;

        ReviewUpdateRequest req = new ReviewUpdateRequest();
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        verify(reviewService, never()).updateReview(anyLong(), anyLong(), any(), any());
    }

    // ========================================================================
    // DELETE REVIEW  (DELETE /api/workplace/{workplaceId}/review/{reviewId})
    // ========================================================================

    @Test
    void delete_whenPrincipalIsDomainUser_callsServiceWithIsAdminFalse_andReturnsApiMessage() throws Exception {
        Long workplaceId = 50L;
        Long reviewId = 500L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_1,
                null,
                Collections.emptyList()
        );

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Review deleted"))
                .andExpect(jsonPath("$.code").value("REVIEW_DELETED"));

        verify(reviewService).deleteReview(workplaceId, reviewId, USER_1, false);
    }

    @Test
    void delete_whenUserDetailsPrincipalUserNotFound_returnsForbidden_andDoesNotCallService() throws Exception {
        Long workplaceId = 51L;
        Long reviewId = 501L;
        String principalKey = "unknown@test.com";

        when(userRepository.findByEmail(principalKey)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(principalKey)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(user(principalKey))
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(reviewService, never()).deleteReview(anyLong(), anyLong(), any(), anyBoolean());
    }

    @Test
    void delete_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
        Long workplaceId = 52L;
        Long reviewId = 502L;

        mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(reviewService, never()).deleteReview(anyLong(), anyLong(), any(), anyBoolean());
    }
}
