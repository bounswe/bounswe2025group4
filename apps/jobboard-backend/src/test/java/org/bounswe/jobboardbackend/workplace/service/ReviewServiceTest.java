package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.workplace.dto.PaginatedResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReviewResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReviewUpdateRequest;
import org.bounswe.jobboardbackend.workplace.model.*;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.bounswe.jobboardbackend.workplace.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

        @Mock
        private WorkplaceRepository workplaceRepository;

        @Mock
        private ReviewRepository reviewRepository;

        @Mock
        private ReviewPolicyRatingRepository reviewPolicyRatingRepository;

        @Mock
        private ReviewReplyRepository reviewReplyRepository;

        @Mock
        private EmployerWorkplaceRepository employerWorkplaceRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private ProfileRepository profileRepository;

        @Mock
        private ReviewReactionRepository reviewReactionRepository;

        @InjectMocks
        private ReviewService reviewService;

        // --------- helpers ---------

        private Workplace sampleWorkplace(Long id) {
                Workplace wp = new Workplace();
                wp.setId(id);
                wp.setCompanyName("Acme Inc");
                wp.setEthicalTags(Set.of(EthicalPolicy.SALARY_TRANSPARENCY));
                wp.setReviewCount(0L);
                return wp;
        }

        private User sampleUser(Long id) {
                User u = new User();
                u.setId(id);
                u.setUsername("user" + id);
                u.setEmail("user" + id + "@test.com");
                return u;
        }

        private Profile sampleProfile(Long userId) {
                Profile p = new Profile();
                p.setId(userId);
                p.setFirstName("John");
                p.setLastName("Doe");
                return p;
        }

        private Review sampleReview(Long id, Workplace wp, User user) {
                Review r = Review.builder()
                                .id(id)
                                .workplace(wp)
                                .user(user)
                                .title("Good place")
                                .content("Nice culture")
                                .overallRating(4.0)
                                .anonymous(false)
                                .helpfulCount(0)
                                .build();
                r.setCreatedAt(Instant.now());
                r.setUpdatedAt(Instant.now());
                return r;
        }

        // ========== CREATE REVIEW ==========

        @Test
        void createReview_whenValidRequest_createsReviewAndReturnsResponse() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);
                Profile profile = sampleProfile(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setTitle("Great workplace");
                req.setContent("Very ethical");
                Map<String, Integer> policyRatings = new HashMap<>();
                policyRatings.put(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4);
                req.setEthicalPolicyRatings(policyRatings);
                req.setAnonymous(false);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
                        Review r = invocation.getArgument(0);
                        if (r.getId() == null) {
                                r.setId(100L);
                        }
                        if (r.getCreatedAt() == null)
                                r.setCreatedAt(Instant.now());
                        if (r.getUpdatedAt() == null)
                                r.setUpdatedAt(Instant.now());
                        return r;
                });

                when(reviewPolicyRatingRepository.findByReview_Id(anyLong()))
                                .thenReturn(List.of(
                                                ReviewPolicyRating.builder()
                                                                .id(1L)
                                                                .review(null)
                                                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                                                .score(4)
                                                                .build()));
                when(reviewReplyRepository.findByReview_Id(anyLong()))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(userId))
                                .thenReturn(Optional.of(profile));

                ReviewResponse res = reviewService.createReview(workplaceId, req, user);

                assertThat(res).isNotNull();
                assertThat(res.getWorkplaceId()).isEqualTo(workplaceId);
                assertThat(res.getTitle()).isEqualTo("Great workplace");
                assertThat(res.getOverallRating()).isEqualTo(4.0);
                assertThat(res.getEthicalPolicyRatings())
                                .containsEntry(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4);

                verify(workplaceRepository).save(wp);
                verify(reviewPolicyRatingRepository, times(1)).findByReview_Id(anyLong());
        }

        @Test
        void createReview_whenEmployerOfWorkplace_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4));
                req.setTitle("x");
                req.setContent("y");

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(true);

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_UNAUTHORIZED);
        }

        @Test
        void createReview_whenAlreadyReviewed_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4));
                req.setTitle("x");
                req.setContent("y");

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(true);

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        @Test
        void createReview_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 1L;
                User user = sampleUser(10L);
                ReviewCreateRequest req = new ReviewCreateRequest();

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void createReview_whenWorkplaceHasNoEthicalTags_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                wp.setEthicalTags(Collections.emptySet());
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4));

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void createReview_whenPolicyRatingsNull_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setEthicalPolicyRatings(null);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void createReview_whenScoreOutOfRange_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setTitle("Bad score");
                req.setContent("Test");
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 6));

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void createReview_whenUnknownPolicyLabel_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setTitle("Unknown policy");
                req.setContent("Test");
                req.setEthicalPolicyRatings(
                                Map.of("UnknownPolicy", 4));

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void createReview_whenPolicyNotDeclaredByWorkplace_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                wp.setEthicalTags(Set.of(EthicalPolicy.EQUAL_PAY_POLICY));
                User user = sampleUser(userId);

                ReviewCreateRequest req = new ReviewCreateRequest();
                req.setTitle("Undeclared policy");
                req.setContent("Test");
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4));

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);
                when(userRepository.findById(userId)).thenReturn(Optional.of(user));

                assertThatThrownBy(() -> reviewService.createReview(workplaceId, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        // ========== LIST REVIEWS ==========

        @Test
        void listReviews_whenNoFilters_returnsPaginatedReviews() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Profile profile = sampleProfile(user.getId());

                Review review = sampleReview(100L, wp, user);
                Page<Review> page = new PageImpl<>(List.of(review), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(reviewRepository.findByWorkplace_Id(eq(workplaceId), any(Pageable.class)))
                                .thenReturn(page);

                when(reviewPolicyRatingRepository.findByReview_Id(100L))
                                .thenReturn(List.of(
                                                ReviewPolicyRating.builder()
                                                                .id(1L)
                                                                .review(review)
                                                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                                                .score(4)
                                                                .build()));
                when(reviewReplyRepository.findByReview_Id(100L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(user.getId()))
                                .thenReturn(Optional.of(profile));

                PaginatedResponse<ReviewResponse> res = reviewService.listReviews(
                                workplaceId, 0, 10,
                                null, null, null,
                                null, null, null);

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(1);
                ReviewResponse item = res.getContent().getFirst();
                assertThat(item.getId()).isEqualTo(100L);
                assertThat(item.getOverallRating()).isEqualTo(4.0);
        }

        @Test
        void listReviews_whenRatingFilterGiven_usesRatingQuery() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Profile profile = sampleProfile(user.getId());
                Review review = sampleReview(101L, wp, user);

                Page<Review> page = new PageImpl<>(List.of(review), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(reviewRepository.findByWorkplace_IdAndOverallRatingIn(
                                eq(workplaceId), anyList(), any(Pageable.class))).thenReturn(page);

                when(reviewPolicyRatingRepository.findByReview_Id(101L))
                                .thenReturn(List.of(
                                                ReviewPolicyRating.builder()
                                                                .id(1L)
                                                                .review(review)
                                                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                                                .score(4)
                                                                .build()));
                when(reviewReplyRepository.findByReview_Id(101L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(user.getId()))
                                .thenReturn(Optional.of(profile));

                PaginatedResponse<ReviewResponse> res = reviewService.listReviews(
                                workplaceId, 0, 10,
                                "4", "rating", null,
                                null, null, null);

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(1);
                ReviewResponse item = res.getContent().getFirst();
                assertThat(item.getOverallRating()).isEqualTo(4.0);
                verify(reviewRepository).findByWorkplace_IdAndOverallRatingIn(eq(workplaceId), anyList(),
                                any(Pageable.class));
        }

        @Test
        void listReviews_whenRatingFilterRange_usesBetweenQuery() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Profile profile = sampleProfile(user.getId());
                Review review = sampleReview(103L, wp, user);

                Page<Review> page = new PageImpl<>(List.of(review), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(reviewRepository.findByWorkplace_IdAndOverallRatingBetween(
                                eq(workplaceId), anyDouble(), anyDouble(), any(Pageable.class))).thenReturn(page);

                when(reviewPolicyRatingRepository.findByReview_Id(103L))
                                .thenReturn(Collections.emptyList());
                when(reviewReplyRepository.findByReview_Id(103L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(user.getId()))
                                .thenReturn(Optional.of(profile));

                PaginatedResponse<ReviewResponse> res = reviewService.listReviews(
                                workplaceId, 0, 10,
                                "3.5,4.5", "ratingDesc", null,
                                null, null, null);

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(1);
                verify(reviewRepository).findByWorkplace_IdAndOverallRatingBetween(
                                eq(workplaceId), anyDouble(), anyDouble(), any(Pageable.class));
        }

        @Test
        void listReviews_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 1L;
                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.listReviews(
                                workplaceId, 0, 10,
                                null, null, null,
                                null, null, null))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void listReviews_whenHasCommentTrue_usesCommentQuery() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Profile profile = sampleProfile(user.getId());
                Review review = sampleReview(102L, wp, user);
                review.setContent("Non-empty comment");

                Page<Review> page = new PageImpl<>(List.of(review), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
                when(reviewRepository.findByWorkplace_IdAndContentIsNotNullAndContentNot(
                                eq(workplaceId), eq(""), any(Pageable.class))).thenReturn(page);

                when(reviewPolicyRatingRepository.findByReview_Id(102L))
                                .thenReturn(Collections.emptyList());
                when(reviewReplyRepository.findByReview_Id(102L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(user.getId()))
                                .thenReturn(Optional.of(profile));

                PaginatedResponse<ReviewResponse> res = reviewService.listReviews(
                                workplaceId, 0, 10,
                                null, null, true,
                                null, null, null);

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(1);
                ReviewResponse item = res.getContent().getFirst();
                assertThat(item.getContent()).isEqualTo("Non-empty comment");
                verify(reviewRepository).findByWorkplace_IdAndContentIsNotNullAndContentNot(eq(workplaceId), eq(""),
                                any(Pageable.class));
        }

        // ========== GET ONE ==========

        @Test
        void getOne_whenValidRequest_returnsResponse() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Profile profile = sampleProfile(user.getId());
                Review review = sampleReview(200L, wp, user);

                when(reviewRepository.findById(200L)).thenReturn(Optional.of(review));
                when(reviewPolicyRatingRepository.findByReview_Id(200L))
                                .thenReturn(Collections.emptyList());
                when(reviewReplyRepository.findByReview_Id(200L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(user.getId()))
                                .thenReturn(Optional.of(profile));

                ReviewResponse res = reviewService.getOne(workplaceId, 200L, null);

                assertThat(res).isNotNull();
                assertThat(res.getId()).isEqualTo(200L);
                assertThat(res.getWorkplaceId()).isEqualTo(workplaceId);
        }

        @Test
        void getOne_whenWorkplaceMismatch_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wpOther = sampleWorkplace(2L);
                User user = sampleUser(10L);
                Review review = sampleReview(201L, wpOther, user);

                when(reviewRepository.findById(201L)).thenReturn(Optional.of(review));

                assertThatThrownBy(() -> reviewService.getOne(workplaceId, 201L, null))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        @Test
        void getOne_whenReviewNotFound_throwsHandleException() {
                Long workplaceId = 1L;
                when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.getOne(workplaceId, 999L, null))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        // ========== UPDATE REVIEW ==========

        @Test
        void updateReview_whenOwnerUpdates_updatesFieldsAndPolicyRatings() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                Review existing = sampleReview(200L, wp, user);
                existing.setOverallRating(3.0);

                when(reviewRepository.findById(200L)).thenReturn(Optional.of(existing));

                ReviewPolicyRating rpr = ReviewPolicyRating.builder()
                                .id(1L)
                                .review(existing)
                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                .score(3)
                                .build();

                when(reviewPolicyRatingRepository.findByReview_Id(200L))
                                .thenReturn(List.of(rpr));

                when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
                        Review r = invocation.getArgument(0);
                        if (r.getCreatedAt() == null)
                                r.setCreatedAt(Instant.now());
                        if (r.getUpdatedAt() == null)
                                r.setUpdatedAt(Instant.now());
                        return r;
                });

                when(reviewReplyRepository.findByReview_Id(200L))
                                .thenReturn(Optional.empty());
                when(profileRepository.findByUserId(userId))
                                .thenReturn(Optional.of(sampleProfile(userId)));

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setTitle("Updated title");
                req.setContent("Updated content");
                Map<String, Integer> updatedPolicies = new HashMap<>();
                updatedPolicies.put(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 5);
                req.setEthicalPolicyRatings(updatedPolicies);

                ReviewResponse res = reviewService.updateReview(workplaceId, 200L, req, user);

                assertThat(res.getTitle()).isEqualTo("Updated title");
                assertThat(res.getContent()).isEqualTo("Updated content");
                assertThat(res.getOverallRating()).isEqualTo(5.0);

                verify(reviewPolicyRatingRepository, atLeastOnce()).findByReview_Id(200L);
                verify(reviewRepository, atLeastOnce()).save(existing);
        }

        @Test
        void updateReview_whenNotOwner_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User owner = sampleUser(10L);
                User other = sampleUser(99L);

                Review existing = sampleReview(300L, wp, owner);

                when(reviewRepository.findById(300L)).thenReturn(Optional.of(existing));

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setTitle("Should not matter");

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 300L, req, other))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        @Test
        void updateReview_whenReviewNotFound_throwsHandleException() {
                Long workplaceId = 1L;
                User user = sampleUser(10L);
                ReviewUpdateRequest req = new ReviewUpdateRequest();

                when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 999L, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        @Test
        void updateReview_whenWorkplaceMismatch_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace otherWp = sampleWorkplace(2L);
                User user = sampleUser(10L);
                Review review = sampleReview(500L, otherWp, user);

                when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setTitle("test");

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 500L, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        @Test
        void updateReview_whenPolicyScoreOutOfRange_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Review review = sampleReview(600L, wp, user);

                when(reviewRepository.findById(600L)).thenReturn(Optional.of(review));
                when(reviewPolicyRatingRepository.findByReview_Id(600L)).thenReturn(Collections.emptyList());

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 0));

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 600L, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void updateReview_whenUnknownPolicyLabel_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(10L);
                Review review = sampleReview(601L, wp, user);

                when(reviewRepository.findById(601L)).thenReturn(Optional.of(review));
                when(reviewPolicyRatingRepository.findByReview_Id(601L)).thenReturn(Collections.emptyList());

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setEthicalPolicyRatings(
                                Map.of("UnknownPolicy", 4));

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 601L, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        @Test
        void updateReview_whenPolicyNotDeclaredByWorkplace_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                wp.setEthicalTags(Set.of(EthicalPolicy.EQUAL_PAY_POLICY));
                User user = sampleUser(10L);
                Review review = sampleReview(602L, wp, user);

                when(reviewRepository.findById(602L)).thenReturn(Optional.of(review));
                when(reviewPolicyRatingRepository.findByReview_Id(602L)).thenReturn(Collections.emptyList());

                ReviewUpdateRequest req = new ReviewUpdateRequest();
                req.setEthicalPolicyRatings(
                                Map.of(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4));

                assertThatThrownBy(() -> reviewService.updateReview(workplaceId, 602L, req, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);
        }

        // ========== DELETE REVIEW ==========

        @Test
        void deleteReview_whenOwnerDeletes_removesReviewAndRelatedEntities() {
                Long workplaceId = 1L;
                Long userId = 10L;

                Workplace wp = sampleWorkplace(workplaceId);
                wp.setReviewCount(1L);
                User user = sampleUser(userId);
                Review review = sampleReview(300L, wp, user);

                ReviewReply reply = ReviewReply.builder()
                                .id(1L)
                                .review(review)
                                .content("Thanks for feedback")
                                .build();

                ReviewPolicyRating rating1 = ReviewPolicyRating.builder()
                                .id(10L)
                                .review(review)
                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                .score(4)
                                .build();

                when(reviewRepository.findById(300L)).thenReturn(Optional.of(review));
                when(reviewReplyRepository.findByReview_Id(300L)).thenReturn(Optional.of(reply));
                when(reviewPolicyRatingRepository.findByReview_Id(300L))
                                .thenReturn(List.of(rating1));
                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));

                reviewService.deleteReview(workplaceId, 300L, user, false);

                verify(reviewReplyRepository).delete(reply);
                verify(reviewPolicyRatingRepository).deleteAll(List.of(rating1));
                verify(reviewRepository).delete(review);
                verify(workplaceRepository).save(wp);
                assertThat(wp.getReviewCount()).isGreaterThanOrEqualTo(0L);
        }

        @Test
        void deleteReview_whenNotOwnerAndNotAdmin_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                User owner = sampleUser(10L);
                User other = sampleUser(99L);
                Review review = sampleReview(301L, wp, owner);

                when(reviewRepository.findById(301L)).thenReturn(Optional.of(review));

                assertThatThrownBy(() -> reviewService.deleteReview(workplaceId, 301L, other, false))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        // ========== TOGGLE HELPFUL ==========

        @Test
        void toggleHelpful_whenNotHelpfulBefore_createsReactionAndIncrementsCount() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);
                User otherUser = sampleUser(99L);

                Review review = sampleReview(100L, wp, otherUser);
                review.setHelpfulCount(5);

                when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));
                when(reviewReactionRepository.findByReview_IdAndUser_Id(100L, userId))
                                .thenReturn(Optional.empty());

                ReviewResponse res = reviewService.toggleHelpful(workplaceId, 100L, user);

                assertThat(res.getHelpfulCount()).isEqualTo(6);
                assertThat(res.isHelpfulByUser()).isTrue();

                verify(reviewReactionRepository).save(any(ReviewReaction.class));
                verify(reviewRepository).save(review);
        }

        @Test
        void toggleHelpful_whenAlreadyHelpful_deletesReactionAndDecrementsCount() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);
                User otherUser = sampleUser(99L);

                Review review = sampleReview(100L, wp, otherUser);
                review.setHelpfulCount(5);

                ReviewReaction reaction = ReviewReaction.builder()
                                .id(1L)
                                .review(review)
                                .user(user)
                                .build();

                when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));
                when(reviewReactionRepository.findByReview_IdAndUser_Id(100L, userId))
                                .thenReturn(Optional.of(reaction));

                ReviewResponse res = reviewService.toggleHelpful(workplaceId, 100L, user);

                assertThat(res.getHelpfulCount()).isEqualTo(4);
                assertThat(res.isHelpfulByUser()).isFalse();

                verify(reviewReactionRepository).delete(reaction);
                verify(reviewRepository).save(review);
        }

        @Test
        void toggleHelpful_whenOwnReview_throwsHandleException() {
                Long workplaceId = 1L;
                Long userId = 10L;
                Workplace wp = sampleWorkplace(workplaceId);
                User user = sampleUser(userId);

                Review review = sampleReview(100L, wp, user);
                when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));

                assertThatThrownBy(() -> reviewService.toggleHelpful(workplaceId, 100L, user))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.VALIDATION_ERROR);

                verify(reviewReactionRepository, never()).save(any());
                verify(reviewReactionRepository, never()).delete(any());
        }

        @Test
        void deleteReview_whenReviewNotFound_throwsHandleException() {
                Long workplaceId = 1L;
                User user = sampleUser(10L);

                when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.deleteReview(workplaceId, 999L, user, false))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        @Test
        void deleteReview_whenWorkplaceMismatch_throwsHandleException() {
                Long workplaceId = 1L;
                Workplace otherWp = sampleWorkplace(2L);
                User user = sampleUser(10L);
                Review review = sampleReview(700L, otherWp, user);

                when(reviewRepository.findById(700L)).thenReturn(Optional.of(review));

                assertThatThrownBy(() -> reviewService.deleteReview(workplaceId, 700L, user, false))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
        }

        @Test
        void deleteReview_whenWorkplaceNotFoundWhileUpdatingCount_throwsHandleException() {
                Long workplaceId = 1L;
                User user = sampleUser(10L);
                Workplace wp = sampleWorkplace(workplaceId);
                Review review = sampleReview(701L, wp, user);

                when(reviewRepository.findById(701L)).thenReturn(Optional.of(review));
                when(reviewReplyRepository.findByReview_Id(701L)).thenReturn(Optional.empty());
                when(reviewPolicyRatingRepository.findByReview_Id(701L)).thenReturn(Collections.emptyList());
                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> reviewService.deleteReview(workplaceId, 701L, user, false))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void deleteReview_whenAdminDeletes_removesReviewAndRelatedEntities() {
                Long workplaceId = 1L;
                Workplace wp = sampleWorkplace(workplaceId);
                wp.setReviewCount(1L);
                User owner = sampleUser(10L);
                User admin = sampleUser(99L);
                Review review = sampleReview(401L, wp, owner);

                ReviewReply reply = ReviewReply.builder()
                                .id(2L)
                                .review(review)
                                .content("Admin reply")
                                .build();

                ReviewPolicyRating rating = ReviewPolicyRating.builder()
                                .id(11L)
                                .review(review)
                                .policy(EthicalPolicy.SALARY_TRANSPARENCY)
                                .score(5)
                                .build();

                when(reviewRepository.findById(401L)).thenReturn(Optional.of(review));
                when(reviewReplyRepository.findByReview_Id(401L)).thenReturn(Optional.of(reply));
                when(reviewPolicyRatingRepository.findByReview_Id(401L))
                                .thenReturn(List.of(rating));
                when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));

                reviewService.deleteReview(workplaceId, 401L, admin, true);

                verify(reviewReplyRepository).delete(reply);
                verify(reviewPolicyRatingRepository).deleteAll(List.of(rating));
                verify(reviewRepository).delete(review);
                verify(workplaceRepository).save(wp);
                assertThat(wp.getReviewCount()).isGreaterThanOrEqualTo(0L);
        }
}