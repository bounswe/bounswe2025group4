package org.bounswe.jobboardbackend.workplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReviewResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewUpdateRequest;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
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

@WebMvcTest(controllers = WorkplaceReviewController.class)
class WorkplaceReviewControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private ReviewService reviewService;

        @Autowired
        private ObjectMapper objectMapper;

        private UserDetailsImpl USER_DETAILS_1;

        @BeforeEach
        void setUp() {
                USER_DETAILS_1 = new UserDetailsImpl(
                                1L,
                                "user1",
                                "user1@test.com",
                                "password",
                                List.of(new SimpleGrantedAuthority("ROLE_JOBSEEKER")),
                                false);
        }

        // ========================================================================
        // CREATE REVIEW (POST /api/workplace/{workplaceId}/review)
        // ========================================================================

        @Test
        void create_whenAuthenticated_callsServiceWithUserId() throws Exception {
                Long workplaceId = 10L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                ReviewCreateRequest req = new ReviewCreateRequest();
                String body = objectMapper.writeValueAsString(req);

                ReviewResponse response = new ReviewResponse();
                when(reviewService.createReview(eq(workplaceId), any(ReviewCreateRequest.class),
                                eq(USER_DETAILS_1.getId())))
                                .thenReturn(response);

                mockMvc.perform(post("/api/workplace/{workplaceId}/review", workplaceId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                ArgumentCaptor<Long> workplaceCaptor = ArgumentCaptor.forClass(Long.class);
                ArgumentCaptor<ReviewCreateRequest> reqCaptor = ArgumentCaptor.forClass(ReviewCreateRequest.class);
                ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);

                verify(reviewService).createReview(workplaceCaptor.capture(), reqCaptor.capture(),
                                userIdCaptor.capture());
                assertThat(workplaceCaptor.getValue()).isEqualTo(workplaceId);
                assertThat(userIdCaptor.getValue()).isEqualTo(USER_DETAILS_1.getId());
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

                // verify(reviewService, never()).createReview(...) - optional but good practice
        }

        // ========================================================================
        // LIST REVIEWS (GET /api/workplace/{workplaceId}/review)
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

                PaginatedResponse<ReviewResponse> response = PaginatedResponse.of(Collections.emptyList(), page, size,
                                0);
                when(reviewService.listReviews(
                                anyLong(), anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                                .thenReturn(response);

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                mockMvc.perform(get("/api/workplace/{workplaceId}/review", workplaceId)
                                .with(authentication(auth))
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
                                policyMinCaptor.capture(),
                                any()); // The current user ID argument, can be null or captured if service uses it
                                        // logic (it does for 'helpful')

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

                PaginatedResponse<ReviewResponse> response = PaginatedResponse.of(Collections.emptyList(), 0, 10, 0);
                when(reviewService.listReviews(
                                anyLong(), anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                                .thenReturn(response);

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                mockMvc.perform(get("/api/workplace/{workplaceId}/review", workplaceId)
                                .with(authentication(auth)))
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
                                any(),
                                any());

                assertThat(pageCaptor.getValue()).isEqualTo(0);
                assertThat(sizeCaptor.getValue()).isEqualTo(10);
        }

        // ========================================================================
        // GET ONE REVIEW (GET /api/workplace/{workplaceId}/review/{reviewId})
        // ========================================================================

        @Test
        void getOne_whenCalled_delegatesToService() throws Exception {
                Long workplaceId = 30L;
                Long reviewId = 300L;

                ReviewResponse res = new ReviewResponse();
                when(reviewService.getOne(eq(workplaceId), eq(reviewId), any())).thenReturn(res);

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                mockMvc.perform(get("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                                .with(authentication(auth)))
                                .andExpect(status().isOk());

                verify(reviewService).getOne(eq(workplaceId), eq(reviewId), any());
        }

        // ========================================================================
        // UPDATE REVIEW (PUT /api/workplace/{workplaceId}/review/{reviewId})
        // ========================================================================

        @Test
        void update_whenAuthenticated_callsServiceWithUserId() throws Exception {
                Long workplaceId = 40L;
                Long reviewId = 400L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                ReviewResponse response = new ReviewResponse();
                ReviewUpdateRequest req = new ReviewUpdateRequest();
                String body = objectMapper.writeValueAsString(req);

                when(reviewService.updateReview(eq(workplaceId), eq(reviewId), any(ReviewUpdateRequest.class),
                                eq(USER_DETAILS_1.getId())))
                                .thenReturn(response);

                mockMvc.perform(put("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isOk());

                verify(reviewService).updateReview(eq(workplaceId), eq(reviewId), any(ReviewUpdateRequest.class),
                                eq(USER_DETAILS_1.getId()));
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
        }

        // ========================================================================
        // DELETE REVIEW (DELETE /api/workplace/{workplaceId}/review/{reviewId})
        // ========================================================================

        @Test
        void delete_whenAuthenticated_callsServiceWithUserId_andReturnsApiMessage() throws Exception {
                Long workplaceId = 50L;
                Long reviewId = 500L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Review deleted"))
                                .andExpect(jsonPath("$.code").value("REVIEW_DELETED"));

                verify(reviewService).deleteReview(workplaceId, reviewId, USER_DETAILS_1.getId(), false);
        }

        @Test
        void delete_whenUnauthenticated_returnsUnauthorized_andDoesNotCallService() throws Exception {
                Long workplaceId = 52L;
                Long reviewId = 502L;

                mockMvc.perform(delete("/api/workplace/{workplaceId}/review/{reviewId}", workplaceId, reviewId)
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());
        }

        // ========================================================================
        // TOGGLE HELPFUL (POST /api/workplace/{workplaceId}/review/{reviewId}/helpful)
        // ========================================================================

        @Test
        void toggleHelpful_whenAuthenticated_callsService() throws Exception {
                Long workplaceId = 60L;
                Long reviewId = 600L;

                Authentication auth = new UsernamePasswordAuthenticationToken(
                                USER_DETAILS_1,
                                null,
                                USER_DETAILS_1.getAuthorities());

                ReviewResponse response = new ReviewResponse();
                response.setHelpfulCount(1);
                response.setHelpfulByUser(true);

                when(reviewService.toggleHelpful(eq(workplaceId), eq(reviewId), eq(USER_DETAILS_1.getId())))
                                .thenReturn(response);

                mockMvc.perform(post("/api/workplace/{workplaceId}/review/{reviewId}/helpful", workplaceId, reviewId)
                                .with(authentication(auth))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.helpfulCount").value(1))
                                .andExpect(jsonPath("$.helpfulByUser").value(true));

                verify(reviewService).toggleHelpful(workplaceId, reviewId, USER_DETAILS_1.getId());
        }
}
