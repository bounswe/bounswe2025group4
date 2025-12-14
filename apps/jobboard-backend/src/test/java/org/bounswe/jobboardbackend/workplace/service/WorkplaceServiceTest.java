package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewPolicyRatingRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkplaceServiceTest {

        @Mock
        private WorkplaceRepository workplaceRepository;
        @Mock
        private ReviewRepository reviewRepository;
        @Mock
        private ReviewPolicyRatingRepository reviewPolicyRatingRepository;
        @Mock
        private EmployerWorkplaceRepository employerWorkplaceRepository;
        @Mock
        private UserRepository userRepository;
        @Mock
        private ProfileRepository profileRepository;
        @Mock
        private ReviewService reviewService;
        @Mock
        private org.bounswe.jobboardbackend.activity.service.ActivityService activityService;

        @InjectMocks
        private WorkplaceService workplaceService;

        private Workplace wp;
        private User creator;

        @BeforeEach
        void setUp() {
                creator = User.builder()
                                .id(100L)
                                .email("creator@test.com")
                                .username("creator")
                                .role(Role.ROLE_EMPLOYER)
                                .build();

                wp = Workplace.builder()
                                .id(42L)
                                .companyName("Ethica Corp")
                                .sector("Tech")
                                .location("Istanbul")
                                .shortDescription("Short")
                                .detailedDescription("Detailed")
                                .ethicalTags(EnumSet.of(
                                                EthicalPolicy.SALARY_TRANSPARENCY,
                                                EthicalPolicy.EQUAL_PAY_POLICY))
                                .website("https://ethica.example")
                                .imageUrl(null)
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .reviewCount(5L)
                                .deleted(false)
                                .build();
        }

        // ======================
        // uploadImage / deleteImage
        // ======================

        @Test
        void uploadImage_whenFileIsNull_throwsHandleException() {
                assertThatThrownBy(() -> workplaceService.uploadImage(1L, null, 10L))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.IMAGE_FILE_REQUIRED);
        }

        @Test
        void uploadImage_whenContentTypeIsNotImage_throwsHandleException() {
                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(false);
                when(file.getContentType()).thenReturn("text/plain");

                assertThatThrownBy(() -> workplaceService.uploadImage(1L, file, 10L))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.IMAGE_CONTENT_TYPE_INVALID);
        }

        @Test
        void uploadImage_whenWorkplaceNotFound_throwsHandleException() throws Exception {
                Long workplaceId = 999L;
                Long userId = 100L;

                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(false);
                when(file.getContentType()).thenReturn("image/png");

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.uploadImage(workplaceId, file, userId))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void uploadImage_whenNotEmployer_throwsHandleException() throws Exception {
                Long workplaceId = 42L;
                Long userId = 100L;

                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(false);
                when(file.getContentType()).thenReturn("image/png");

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);

                assertThatThrownBy(() -> workplaceService.uploadImage(workplaceId, file, userId))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        @Test
        void deleteImage_whenEmployerAndNoImageUrl_succeedsWithoutError() {
                Long workplaceId = 42L;
                Long userId = 100L;
                Workplace w = Workplace.builder()
                                .id(workplaceId)
                                .companyName("No Image Corp")
                                .imageUrl(null)
                                .build();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(w));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(true);

                workplaceService.deleteImage(workplaceId, userId);

                verify(workplaceRepository).findById(workplaceId);
                verify(employerWorkplaceRepository)
                                .existsByWorkplace_IdAndUser_Id(workplaceId, userId);
        }

        @Test
        void deleteImage_whenNotEmployer_throwsHandleException() {
                Long workplaceId = 42L;
                Long userId = 100L;

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(false);

                assertThatThrownBy(() -> workplaceService.deleteImage(workplaceId, userId))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        @Test
        void deleteImage_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 999L;
                Long userId = 100L;

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.deleteImage(workplaceId, userId))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void deleteImage_whenEmployerAndHasImageUrl_clearsImageUrl() {
                Long workplaceId = 42L;
                Long userId = 100L;
                Workplace w = Workplace.builder()
                                .id(workplaceId)
                                .companyName("Image Corp")
                                .imageUrl("https://storage.googleapis.com/bounswe-jobboard/workplaces/42.jpg")
                                .build();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(w));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId))
                                .thenReturn(true);

                workplaceService.deleteImage(workplaceId, userId);

                assertThat(w.getImageUrl()).isNull();
        }

        // =========
        // CREATE
        // =========

        @Test
        void create_whenValidEmployerRequest_returnsDetailResponse() {
                WorkplaceCreateRequest req = WorkplaceCreateRequest.builder()
                                .companyName("Ethica Corp")
                                .sector("Tech")
                                .location("Istanbul")
                                .shortDescription("Short")
                                .detailedDescription("Detailed")
                                .ethicalTags(List.of(
                                                EthicalPolicy.SALARY_TRANSPARENCY.getLabel(),
                                                EthicalPolicy.EQUAL_PAY_POLICY.getLabel()))
                                .website("https://ethica.example")
                                .build();

                when(userRepository.findById(creator.getId()))
                                .thenReturn(Optional.of(creator));

                when(workplaceRepository.save(any(Workplace.class)))
                                .thenAnswer(inv -> {
                                        Workplace saved = inv.getArgument(0);
                                        saved.setId(42L);
                                        return saved;
                                });

                when(employerWorkplaceRepository.save(any(EmployerWorkplace.class)))
                                .thenAnswer(inv -> inv.getArgument(0));

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(anyLong()))
                                .thenReturn(null);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());
                when(employerWorkplaceRepository.findByWorkplace_Id(anyLong()))
                                .thenReturn(Collections.emptyList());

                WorkplaceDetailResponse res = workplaceService.create(req, creator);

                assertThat(res).isNotNull();
                assertThat(res.getId()).isEqualTo(42L);
                assertThat(res.getCompanyName()).isEqualTo("Ethica Corp");

                assertThat(res.getEthicalTags())
                                .containsExactlyInAnyOrder(
                                                EthicalPolicy.SALARY_TRANSPARENCY.getLabel(),
                                                EthicalPolicy.EQUAL_PAY_POLICY.getLabel());

                verify(workplaceRepository, times(1)).save(any(Workplace.class));
                verify(employerWorkplaceRepository, times(1)).save(any(EmployerWorkplace.class));
        }

        @Test
        void create_whenUserIsNotEmployer_throwsHandleException() {
                User nonEmployer = User.builder()
                                .id(200L)
                                .email("jobseeker@test.com")
                                .username("js")
                                .role(Role.ROLE_JOBSEEKER)
                                .build();

                WorkplaceCreateRequest req = WorkplaceCreateRequest.builder()
                                .companyName("Another Corp")
                                .build();

                when(userRepository.findById(nonEmployer.getId()))
                                .thenReturn(Optional.of(nonEmployer));

                assertThatThrownBy(() -> workplaceService.create(req, nonEmployer))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        @Test
        void create_whenUserNotFound_throwsHandleException() {
                WorkplaceCreateRequest req = WorkplaceCreateRequest.builder()
                                .companyName("Missing User Corp")
                                .build();

                when(userRepository.findById(creator.getId()))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.create(req, creator))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }

        // =========
        // LIST (brief) – filter + rating
        // =========

        @Test
        void listBrief_appliesFiltersByEthicalTagAndMinRating() {
                Workplace w1 = Workplace.builder()
                                .id(1L)
                                .companyName("A Corp")
                                .ethicalTags(EnumSet.of(EthicalPolicy.SALARY_TRANSPARENCY))
                                .reviewCount(3L)
                                .build();

                Workplace w2 = Workplace.builder()
                                .id(2L)
                                .companyName("B Corp")
                                .ethicalTags(EnumSet.of(EthicalPolicy.EQUAL_PAY_POLICY))
                                .reviewCount(1L)
                                .build();

                Page<Workplace> page = new PageImpl<>(List.of(w1, w2), PageRequest.of(0, 10), 2);

                when(workplaceRepository.findByDeletedFalse(any(Pageable.class)))
                                .thenReturn(page);

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(1L))
                                .thenReturn(4.0);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(2L))
                                .thenReturn(2.0);

                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null, // sector
                                null, // location
                                EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), // filter only this tag
                                3.0, // min rating
                                null, // sortBy
                                null // search
                );

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(1);
                WorkplaceBriefResponse brief = res.getContent().getFirst();
                assertThat(brief.getId()).isEqualTo(1L);
                assertThat(brief.getCompanyName()).isEqualTo("A Corp");
                assertThat(brief.getOverallAvg()).isEqualTo(4.0);
                assertThat(brief.getEthicalTags())
                                .contains(EthicalPolicy.SALARY_TRANSPARENCY.getLabel());
        }

        @Test
        void listBrief_whenSortByRating_sortsByOverallAvgDescAndNullsLast() {
                Workplace w1 = Workplace.builder()
                                .id(1L)
                                .companyName("A Corp")
                                .reviewCount(1L)
                                .build();

                Workplace w2 = Workplace.builder()
                                .id(2L)
                                .companyName("B Corp")
                                .reviewCount(1L)
                                .build();

                Workplace w3 = Workplace.builder()
                                .id(3L)
                                .companyName("C Corp")
                                .reviewCount(1L)
                                .build();

                Page<Workplace> page = new PageImpl<>(List.of(w1, w2, w3), PageRequest.of(0, 10), 3);

                when(workplaceRepository.findByDeletedFalse(any(Pageable.class)))
                                .thenReturn(page);

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(1L))
                                .thenReturn(3.5); // middle
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(2L))
                                .thenReturn(null); // should go last
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(3L))
                                .thenReturn(4.7); // highest

                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null,
                                null,
                                null,
                                null,
                                "ratingDesc",
                                null);

                assertThat(res).isNotNull();
                assertThat(res.getContent()).hasSize(3);

                List<WorkplaceBriefResponse> items = res.getContent();

                assertThat(items.getFirst().getId()).isEqualTo(3L);
                assertThat(items.get(1).getId()).isEqualTo(1L);
                assertThat(items.get(2).getId()).isEqualTo(2L);

                assertThat(items.get(0).getOverallAvg()).isEqualTo(4.7);
                assertThat(items.get(1).getOverallAvg()).isEqualTo(3.5);
                assertThat(items.get(2).getOverallAvg()).isNull();
        }

        @Test
        void listBrief_whenSortByReviewCountDesc_sortsByReviewCountThenRating() {
                Workplace w1 = Workplace.builder()
                                .id(1L)
                                .companyName("A Corp")
                                .reviewCount(5L)
                                .build();
                Workplace w2 = Workplace.builder()
                                .id(2L)
                                .companyName("B Corp")
                                .reviewCount(10L)
                                .build();

                Page<Workplace> page = new PageImpl<>(List.of(w1, w2), PageRequest.of(0, 10), 2);

                when(workplaceRepository.findByDeletedFalse(any(Pageable.class)))
                                .thenReturn(page);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(1L)).thenReturn(3.0);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(2L)).thenReturn(4.0);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null,
                                null,
                                null,
                                null,
                                "reviewCountDesc",
                                null);

                assertThat(res.getContent()).hasSize(2);
                assertThat(res.getContent().getFirst().getId()).isEqualTo(2L);
        }

        @Test
        void listBrief_whenSortByReviewCountAsc_sortsByReviewCountThenRating() {
                Workplace w1 = Workplace.builder()
                                .id(1L)
                                .companyName("A Corp")
                                .reviewCount(5L)
                                .build();
                Workplace w2 = Workplace.builder()
                                .id(2L)
                                .companyName("B Corp")
                                .reviewCount(10L)
                                .build();

                Page<Workplace> page = new PageImpl<>(List.of(w1, w2), PageRequest.of(0, 10), 2);

                when(workplaceRepository.findByDeletedFalse(any(Pageable.class)))
                                .thenReturn(page);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(1L)).thenReturn(3.0);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(2L)).thenReturn(4.0);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null,
                                null,
                                null,
                                null,
                                "reviewCountAsc",
                                null);

                assertThat(res.getContent()).hasSize(2);
                assertThat(res.getContent().getFirst().getId()).isEqualTo(1L);
        }

        @Test
        void listBrief_whenSearchProvided_usesSearchRepositoryMethod() {
                Page<Workplace> page = new PageImpl<>(List.of(wp), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findByDeletedFalseAndCompanyNameContainingIgnoreCase(eq("Ethica"),
                                any(Pageable.class)))
                                .thenReturn(page);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(anyLong()))
                                .thenReturn(null);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null,
                                null,
                                null,
                                null,
                                null,
                                "Ethica");

                assertThat(res.getContent()).hasSize(1);
                verify(workplaceRepository).findByDeletedFalseAndCompanyNameContainingIgnoreCase(eq("Ethica"),
                                any(Pageable.class));
        }

        @Test
        void listBrief_whenSectorProvided_usesSectorRepositoryMethod() {
                Page<Workplace> page = new PageImpl<>(List.of(wp), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findByDeletedFalseAndSectorIgnoreCase(eq("Tech"), any(Pageable.class)))
                                .thenReturn(page);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(anyLong()))
                                .thenReturn(null);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                "Tech",
                                null,
                                null,
                                null,
                                null,
                                null);

                assertThat(res.getContent()).hasSize(1);
                verify(workplaceRepository).findByDeletedFalseAndSectorIgnoreCase(eq("Tech"), any(Pageable.class));
        }

        @Test
        void listBrief_whenLocationProvided_usesLocationRepositoryMethod() {
                Page<Workplace> page = new PageImpl<>(List.of(wp), PageRequest.of(0, 10), 1);

                when(workplaceRepository.findByDeletedFalseAndLocationIgnoreCase(eq("Istanbul"), any(Pageable.class)))
                                .thenReturn(page);
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(anyLong()))
                                .thenReturn(null);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(anyLong()))
                                .thenReturn(Collections.emptyList());

                PaginatedResponse<WorkplaceBriefResponse> res = workplaceService.listBrief(
                                0, 10,
                                null,
                                "Istanbul",
                                null,
                                null,
                                null,
                                null);

                assertThat(res.getContent()).hasSize(1);
                verify(workplaceRepository).findByDeletedFalseAndLocationIgnoreCase(eq("Istanbul"),
                                any(Pageable.class));
        }

        @Test
        void getDetail_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 999L;
                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.getDetail(workplaceId, true, 5))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void getDetail_withoutReviews_doesNotLoadRecentReviews() {
                Long workplaceId = wp.getId();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(workplaceId))
                                .thenReturn(4.0);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(workplaceId))
                                .thenReturn(Collections.emptyList());
                when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                                .thenReturn(Collections.emptyList());

                WorkplaceDetailResponse res = workplaceService.getDetail(workplaceId, false, 0);

                assertThat(res).isNotNull();
                assertThat(res.getRecentReviews()).isEmpty();
                verify(reviewRepository, never()).findByWorkplace_Id(eq(workplaceId), any(PageRequest.class));
        }

        // =========
        // DETAIL
        // =========

        @Test
        void getDetail_withIncludeReviews_returnsFullDetailResponse() {
                Long workplaceId = wp.getId();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(workplaceId))
                                .thenReturn(4.5);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(workplaceId))
                                .thenReturn(List.<Object[]>of(
                                                new Object[] { EthicalPolicy.SALARY_TRANSPARENCY, 4.5d }));

                User reviewer = User.builder()
                                .id(300L)
                                .username("reviewer")
                                .email("reviewer@test.com")
                                .build();

                Review review = Review.builder()
                                .id(10L)
                                .workplace(wp)
                                .user(reviewer)
                                .title("Great place")
                                .content("Nice culture")
                                .overallRating(4.5)
                                .anonymous(false)
                                .helpfulCount(2)
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .build();

                when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                                .thenReturn(List.of(
                                                EmployerWorkplace.builder()
                                                                .workplace(wp)
                                                                .user(creator)
                                                                .role(EmployerRole.OWNER)
                                                                .createdAt(Instant.now())
                                                                .build()));

                when(profileRepository.findByUserId(anyLong()))
                                .thenReturn(Optional.empty());

                Page<Review> reviewPage = new PageImpl<>(List.of(review));
                when(reviewRepository.findByWorkplace_Id(eq(workplaceId), any(PageRequest.class)))
                                .thenReturn(reviewPage);

                // Mock ReviewService.toResponse
                ReviewResponse reviewResponse = ReviewResponse.builder()
                                .id(10L)
                                .workplaceId(workplaceId)
                                .userId(300L)
                                .title("Great place")
                                .content("Nice culture")
                                .overallRating(4.5)
                                .anonymous(false)
                                .helpfulCount(2)
                                .createdAt(review.getCreatedAt())
                                .updatedAt(review.getUpdatedAt())
                                .build();
                when(reviewService.toResponse(any(Review.class), eq(false)))
                                .thenReturn(reviewResponse);

                WorkplaceDetailResponse res = workplaceService.getDetail(workplaceId, true, 5);

                assertThat(res).isNotNull();
                assertThat(res.getId()).isEqualTo(workplaceId);
                assertThat(res.getOverallAvg()).isEqualTo(4.5);
                assertThat(res.getEthicalAverages())
                                .containsEntry(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4.5d);
                assertThat(res.getEmployers()).hasSize(1);
                assertThat(res.getEmployers().getFirst().getUserId()).isEqualTo(creator.getId());
                assertThat(res.getEmployers().getFirst().getNameSurname()).isEmpty();
                assertThat(res.getRecentReviews()).hasSize(1);
                assertThat(res.getRecentReviews().getFirst().getId()).isEqualTo(10L);
        }

        // =========
        // UPDATE
        // =========

        @Test
        void update_whenEmployer_updatesWorkplaceAndReturnsDetail() {
                Long workplaceId = wp.getId();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, creator.getId()))
                                .thenReturn(true);
                when(workplaceRepository.save(any(Workplace.class)))
                                .thenAnswer(inv -> inv.getArgument(0));

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(workplaceId))
                                .thenReturn(3.5);
                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(workplaceId))
                                .thenReturn(Collections.emptyList());
                when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                                .thenReturn(Collections.emptyList());

                WorkplaceUpdateRequest req = WorkplaceUpdateRequest.builder()
                                .companyName("Updated Corp")
                                .sector("Finance")
                                .location("Ankara")
                                .shortDescription("New short")
                                .detailedDescription("New detailed")
                                .website("https://updated.example")
                                .ethicalTags(List.of(EthicalPolicy.MENTORSHIP_PROGRAM.getLabel()))
                                .build();

                WorkplaceDetailResponse res = workplaceService.update(workplaceId, req, creator);

                assertThat(res).isNotNull();
                assertThat(res.getCompanyName()).isEqualTo("Updated Corp");
                assertThat(res.getSector()).isEqualTo("Finance");
                assertThat(res.getLocation()).isEqualTo("Ankara");
                assertThat(res.getWebsite()).isEqualTo("https://updated.example");
                assertThat(res.getEthicalTags())
                                .containsExactly(EthicalPolicy.MENTORSHIP_PROGRAM.getLabel());

                ArgumentCaptor<Workplace> captor = ArgumentCaptor.forClass(Workplace.class);
                verify(workplaceRepository).save(captor.capture());
                Workplace saved = captor.getValue();
                assertThat(saved.getCompanyName()).isEqualTo("Updated Corp");
        }

        @Test
        void update_whenNotEmployer_throwsHandleException() {
                Long workplaceId = wp.getId();
                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, creator.getId()))
                                .thenReturn(false);

                WorkplaceUpdateRequest req = WorkplaceUpdateRequest.builder()
                                .companyName("Updated Corp")
                                .build();

                assertThatThrownBy(() -> workplaceService.update(workplaceId, req, creator))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);
        }

        @Test
        void update_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 999L;
                WorkplaceUpdateRequest req = WorkplaceUpdateRequest.builder()
                                .companyName("Updated Corp")
                                .build();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.update(workplaceId, req, creator))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        @Test
        void getRating_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 999L;

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.getRating(workplaceId))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }

        // =========
        // getRating
        // =========

        @Test
        void getRating_returnsEthicalAverages_andOverall() {
                Long workplaceId = 42L;

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));

                when(reviewRepository.averageOverallByWorkplaceUsingPolicies(workplaceId))
                                .thenReturn(4.0);

                when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(workplaceId))
                                .thenReturn(List.of(
                                                new Object[] { EthicalPolicy.SALARY_TRANSPARENCY, 4.2d },
                                                new Object[] { EthicalPolicy.EQUAL_PAY_POLICY, 3.6d }));

                WorkplaceRatingResponse res = workplaceService.getRating(workplaceId);

                assertThat(res).isNotNull();
                assertThat(res.getWorkplaceId()).isEqualTo(workplaceId);

                assertThat(res.getEthicalAverages())
                                .containsEntry(EthicalPolicy.SALARY_TRANSPARENCY.getLabel(), 4.2d)
                                .containsEntry(EthicalPolicy.EQUAL_PAY_POLICY.getLabel(), 3.6d);

                assertThat(res.getOverallAvg()).isEqualTo(4.0);
                assertThat(res.getReviewCount()).isEqualTo(5L);

                verify(reviewPolicyRatingRepository).averageByPolicyForWorkplace(workplaceId);
                verify(reviewRepository).averageOverallByWorkplaceUsingPolicies(workplaceId);
                verify(workplaceRepository).findById(workplaceId);
        }

        // =========
        // softDelete
        // =========

        @Test
        void softDelete_whenOwner_marksWorkplaceAsDeleted() {
                Long workplaceId = wp.getId();
                Long ownerId = creator.getId();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                                workplaceId, ownerId, EmployerRole.OWNER)).thenReturn(true);

                workplaceService.softDelete(workplaceId, creator);

                ArgumentCaptor<Workplace> captor = ArgumentCaptor.forClass(Workplace.class);
                verify(workplaceRepository).save(captor.capture());

                Workplace saved = captor.getValue();
                assertThat(saved.isDeleted()).isTrue();
        }

        @Test
        void softDelete_whenNotOwner_throwsHandleException() {
                Long workplaceId = wp.getId();
                Long userId = creator.getId();

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.of(wp));
                when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                                workplaceId, userId, EmployerRole.OWNER)).thenReturn(false);

                assertThatThrownBy(() -> workplaceService.softDelete(workplaceId, creator))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.ACCESS_DENIED);

                verify(workplaceRepository, never()).save(any());
        }

        @Test
        void softDelete_whenWorkplaceNotFound_throwsHandleException() {
                Long workplaceId = 999L;

                when(workplaceRepository.findById(workplaceId))
                                .thenReturn(Optional.empty());

                assertThatThrownBy(() -> workplaceService.softDelete(workplaceId, creator))
                                .isInstanceOf(HandleException.class)
                                .extracting("code")
                                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);
        }
}