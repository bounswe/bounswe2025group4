package org.bounswe.jobboardbackend.workplace.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.model.*;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.bounswe.jobboardbackend.workplace.repository.*;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.exception.ErrorCode;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

        private final WorkplaceRepository workplaceRepository;
        private final ReviewRepository reviewRepository;
        private final ReviewPolicyRatingRepository reviewPolicyRatingRepository;
        private final ReviewReplyRepository reviewReplyRepository;
        private final EmployerWorkplaceRepository employerWorkplaceRepository;
        private final UserRepository userRepository;
        private final ProfileRepository profileRepository;
        private final ReviewReactionRepository reviewReactionRepository;

        // === CREATE REVIEW ===
        @Transactional
        public ReviewResponse createReview(Long workplaceId, ReviewCreateRequest req, User currentUser) {
                Workplace wp = workplaceRepository.findById(workplaceId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.WORKPLACE_NOT_FOUND,
                                                "Workplace not found"));

                boolean isEmployer = employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId,
                                currentUser.getId());
                if (isEmployer) {
                        throw new HandleException(
                                        ErrorCode.WORKPLACE_UNAUTHORIZED,
                                        "Employers cannot review their own workplace");
                }

                boolean alreadyReviewed = reviewRepository.existsByWorkplace_IdAndUser_Id(workplaceId,
                                currentUser.getId());
                if (alreadyReviewed) {
                        throw new HandleException(
                                        ErrorCode.REVIEW_ALREADY_EXISTS,
                                        "You have already submitted a review for this workplace.");
                }

                currentUser = userRepository.findById(currentUser.getId())
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.USER_NOT_FOUND,
                                                "User not found"));

                Set<EthicalPolicy> allowed = wp.getEthicalTags();
                if (allowed == null || allowed.isEmpty()) {
                        throw new HandleException(
                                        ErrorCode.VALIDATION_ERROR,
                                        "This workplace has no declared ethical tags to rate.");
                }

                Map<String, Integer> policyMap = req.getEthicalPolicyRatings();
                if (policyMap == null || policyMap.isEmpty()) {
                        throw new HandleException(
                                        ErrorCode.VALIDATION_ERROR,
                                        "ethicalPolicyRatings must contain at least one policy rating (1..5)");
                }

                List<Map.Entry<EthicalPolicy, Integer>> validated = new ArrayList<>();
                for (Map.Entry<String, Integer> e : policyMap.entrySet()) {
                        String key = e.getKey();
                        Integer score = e.getValue();

                        if (score == null || score < 1 || score > 5) {
                                throw new HandleException(
                                                ErrorCode.VALIDATION_ERROR,
                                                "Score for '" + key + "' must be between 1 and 5.");
                        }

                        EthicalPolicy policy;
                        try {
                                policy = EthicalPolicy.fromLabel(key);
                        } catch (IllegalArgumentException ex) {
                                throw new HandleException(
                                                ErrorCode.VALIDATION_ERROR,
                                                "Unknown ethical policy: " + key);
                        }

                        if (!allowed.contains(policy)) {
                                throw new HandleException(
                                                ErrorCode.VALIDATION_ERROR,
                                                "Policy '" + policy.name() + "' is not declared by this workplace.");
                        }

                        validated.add(Map.entry(policy, score));
                }

                Review review = Review.builder()
                                .workplace(wp)
                                .user(currentUser)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .anonymous(req.isAnonymous())
                                .helpfulCount(0)
                                .build();
                review = reviewRepository.save(review);

                for (Map.Entry<EthicalPolicy, Integer> e : validated) {
                        ReviewPolicyRating rpr = ReviewPolicyRating.builder()
                                        .review(review)
                                        .policy(e.getKey())
                                        .score(e.getValue())
                                        .build();
                        reviewPolicyRatingRepository.save(rpr);
                }

                double avg = validated.stream().mapToInt(Map.Entry::getValue).average().orElse(0.0);
                double overall = Math.round(Math.max(1.0, Math.min(5.0, avg)) * 10.0) / 10.0;
                review.setOverallRating(overall);
                reviewRepository.save(review);

                wp.setReviewCount(wp.getReviewCount() + 1);
                workplaceRepository.save(wp);

                return toResponse(review, true, currentUser);
        }

        // === LIST REVIEWS ===
        @Transactional(readOnly = true)
        public PaginatedResponse<ReviewResponse> listReviews(Long workplaceId, Integer page, Integer size,
                        String ratingFilter, String sortBy, Boolean hasComment,
                        String policy, Integer policyMin, User currentUser) {
                workplaceRepository.findById(workplaceId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.WORKPLACE_NOT_FOUND,
                                                "Workplace not found"));

                Pageable pageable = makeSort(page, size, sortBy);

                Page<Review> pg;
                if (ratingFilter != null && !ratingFilter.isBlank()) {
                        List<Double> values = Arrays.stream(ratingFilter.split(","))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .map(Double::parseDouble)
                                        .map(d -> Math.max(1.0, Math.min(5.0, d)))
                                        .sorted()
                                        .toList();

                        if (values.size() == 1) {
                                pg = reviewRepository.findByWorkplace_IdAndOverallRatingIn(workplaceId, values,
                                                pageable);
                        } else {
                                Double min = values.getFirst();
                                Double max = values.getLast();
                                pg = reviewRepository.findByWorkplace_IdAndOverallRatingBetween(workplaceId, min, max,
                                                pageable);
                        }
                } else if (Boolean.TRUE.equals(hasComment)) {
                        pg = reviewRepository.findByWorkplace_IdAndContentIsNotNullAndContentNot(workplaceId, "",
                                        pageable);
                } else {
                        pg = reviewRepository.findByWorkplace_Id(workplaceId, pageable);
                }

                List<Review> reviews = pg.getContent();
                Set<Long> likedReviewIds = new HashSet<>();
                if (currentUser != null) {
                        List<Long> reviewIds = reviews.stream().map(Review::getId).toList();
                        if (!reviewIds.isEmpty()) {
                                likedReviewIds = reviewReactionRepository
                                                .findByUser_IdAndReview_IdIn(currentUser.getId(), reviewIds)
                                                .stream()
                                                .map(rr -> rr.getReview().getId())
                                                .collect(Collectors.toSet());
                        }
                }

                Set<Long> finalLikedReviewIds = likedReviewIds;
                List<ReviewResponse> content = reviews.stream()
                                .map(r -> toResponse(r, true, finalLikedReviewIds.contains(r.getId())))
                                .collect(Collectors.toList());

                return PaginatedResponse.of(content, pg.getNumber(), pg.getSize(), pg.getTotalElements());
        }

        // === GET ONE ===
        @Transactional(readOnly = true)
        public ReviewResponse getOne(Long workplaceId, Long reviewId, User currentUser) {
                Review r = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.REVIEW_NOT_FOUND,
                                                "Review not found"));
                if (!Objects.equals(r.getWorkplace().getId(), workplaceId)) {
                        throw new HandleException(
                                        ErrorCode.REVIEW_NOT_FOUND,
                                        "Review does not belong to workplace");
                }
                return toResponse(r, true, currentUser);
        }

        // === UPDATE REVIEW ===
        @Transactional
        public ReviewResponse updateReview(Long workplaceId, Long reviewId, ReviewUpdateRequest req, User currentUser) {
                Review r = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.REVIEW_NOT_FOUND,
                                                "Review not found"));
                if (!Objects.equals(r.getWorkplace().getId(), workplaceId)) {
                        throw new HandleException(
                                        ErrorCode.REVIEW_NOT_FOUND,
                                        "Review does not belong to workplace");
                }
                if (!Objects.equals(r.getUser().getId(), currentUser.getId())) {
                        throw new HandleException(
                                        ErrorCode.ACCESS_DENIED,
                                        "Only owner can edit the review");
                }

                if (req.getTitle() != null)
                        r.setTitle(req.getTitle());
                if (req.getContent() != null)
                        r.setContent(req.getContent());
                if (req.getIsAnonymous() != null)
                        r.setAnonymous(req.getIsAnonymous());
                reviewRepository.save(r);

                if (req.getEthicalPolicyRatings() != null) {
                        Set<EthicalPolicy> allowed = r.getWorkplace().getEthicalTags();
                        if (allowed == null || allowed.isEmpty()) {
                                throw new HandleException(
                                                ErrorCode.VALIDATION_ERROR,
                                                "This workplace has no declared ethical tags to rate.");
                        }

                        List<ReviewPolicyRating> existing = reviewPolicyRatingRepository.findByReview_Id(r.getId());
                        Map<EthicalPolicy, ReviewPolicyRating> byPolicy = existing.stream()
                                        .collect(Collectors.toMap(ReviewPolicyRating::getPolicy, x -> x));

                        for (Map.Entry<String, Integer> e : req.getEthicalPolicyRatings().entrySet()) {
                                String key = e.getKey();
                                Integer score = e.getValue();

                                if (score == null || score < 1 || score > 5) {
                                        throw new HandleException(
                                                        ErrorCode.VALIDATION_ERROR,
                                                        "Score for '" + key + "' must be between 1 and 5.");
                                }

                                EthicalPolicy policy;
                                try {
                                        policy = EthicalPolicy.fromLabel(key);
                                } catch (IllegalArgumentException ex) {
                                        throw new HandleException(
                                                        ErrorCode.VALIDATION_ERROR,
                                                        "Unknown ethical policy: " + key);
                                }

                                if (!allowed.contains(policy)) {
                                        throw new HandleException(
                                                        ErrorCode.VALIDATION_ERROR,
                                                        "Policy '" + policy.name()
                                                                        + "' is not declared by this workplace.");
                                }

                                ReviewPolicyRating entity = byPolicy.get(policy);
                                if (entity != null) {
                                        // UPDATE
                                        entity.setScore(score);
                                } else {
                                        // INSERT
                                        ReviewPolicyRating created = ReviewPolicyRating.builder()
                                                        .review(r)
                                                        .policy(policy)
                                                        .score(score)
                                                        .build();
                                        reviewPolicyRatingRepository.save(created);
                                        byPolicy.put(policy, created);
                                }
                        }

                        List<ReviewPolicyRating> current = reviewPolicyRatingRepository.findByReview_Id(r.getId());
                        if (!current.isEmpty()) {
                                double avg = current.stream().mapToInt(ReviewPolicyRating::getScore).average()
                                                .orElse(0.0);
                                double overall = Math.round(Math.max(1.0, Math.min(5.0, avg)) * 10.0) / 10.0;
                                r.setOverallRating(overall);
                        }
                        reviewRepository.save(r);
                }

                return toResponse(r, true, currentUser);
        }

        // === TOGGLE HELPFUL ===
        @Transactional
        public ReviewResponse toggleHelpful(Long workplaceId, Long reviewId, User currentUser) {
                Review r = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.REVIEW_NOT_FOUND,
                                                "Review not found"));

                if (!Objects.equals(r.getWorkplace().getId(), workplaceId)) {
                        throw new HandleException(
                                        ErrorCode.REVIEW_NOT_FOUND,
                                        "Review does not belong to workplace");
                }

                if (Objects.equals(r.getUser().getId(), currentUser.getId())) {
                        throw new HandleException(
                                        ErrorCode.VALIDATION_ERROR,
                                        "You cannot mark your own review as helpful.");
                }

                Optional<ReviewReaction> reaction = reviewReactionRepository.findByReview_IdAndUser_Id(reviewId,
                                currentUser.getId());
                boolean isHelpful;

                if (reaction.isPresent()) {
                        // Unlike
                        reviewReactionRepository.delete(reaction.get());
                        r.setHelpfulCount(Math.max(0, r.getHelpfulCount() - 1));
                        isHelpful = false;
                } else {
                        // Like
                        ReviewReaction newReaction = ReviewReaction.builder()
                                        .review(r)
                                        .user(currentUser)
                                        .build();
                        reviewReactionRepository.save(newReaction);
                        r.setHelpfulCount(r.getHelpfulCount() + 1);
                        isHelpful = true;
                }

                reviewRepository.save(r);
                return toResponse(r, true, isHelpful);
        }

        // === DELETE REVIEW ===
        @Transactional
        public void deleteReview(Long workplaceId, Long reviewId, User currentUser, boolean isAdmin) {
                Review r = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.REVIEW_NOT_FOUND,
                                                "Review not found"));
                if (!Objects.equals(r.getWorkplace().getId(), workplaceId)) {
                        throw new HandleException(
                                        ErrorCode.REVIEW_NOT_FOUND,
                                        "Review does not belong to workplace");
                }
                boolean reviewOwner = Objects.equals(r.getUser().getId(), currentUser.getId());
                if (!(reviewOwner || isAdmin)) {
                        throw new HandleException(
                                        ErrorCode.ACCESS_DENIED,
                                        "Only review owner or admin can delete the review");
                }

                reviewReplyRepository.findByReview_Id(reviewId).ifPresent(reviewReplyRepository::delete);
                reviewPolicyRatingRepository.deleteAll(reviewPolicyRatingRepository.findByReview_Id(reviewId));
                reviewRepository.delete(r);

                Workplace wp = workplaceRepository.findById(workplaceId)
                                .orElseThrow(() -> new HandleException(
                                                ErrorCode.WORKPLACE_NOT_FOUND,
                                                "Workplace not found"));
                long currentCount = wp.getReviewCount();
                wp.setReviewCount(Math.max(0, currentCount - 1));
                workplaceRepository.save(wp);
        }

        // === HELPERS ===

        public ReviewResponse toResponse(Review r, boolean withExtras) {
                return toResponse(r, withExtras, false);
        }

        private Pageable makeSort(int page, int size, String sortBy) {
                if (sortBy == null) {
                        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                }
                return switch (sortBy) {
                        case "ratingAsc" -> PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "overallRating"));
                        case "ratingDesc" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "overallRating"));
                        case "helpfulness" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "helpfulCount"));
                        default -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
                };
        }

        private ReviewResponse toResponse(Review r, boolean withExtras, User currentUser) {
                boolean isHelpful = false;
                if (currentUser != null) {
                        isHelpful = reviewReactionRepository.existsByReview_IdAndUser_Id(r.getId(),
                                        currentUser.getId());
                }
                return toResponse(r, withExtras, isHelpful);
        }

        private ReviewResponse toResponse(Review r, boolean withExtras, boolean isHelpfulByUser) {
                Map<String, Integer> policies = Collections.emptyMap();
                ReplyResponse replyDto = null;
                if (withExtras) {
                        policies = reviewPolicyRatingRepository.findByReview_Id(r.getId()).stream()
                                        .collect(Collectors.toMap(
                                                        rpr -> rpr.getPolicy().getLabel(),
                                                        ReviewPolicyRating::getScore));
                        replyDto = reviewReplyRepository.findByReview_Id(r.getId())
                                        .map(this::toReplyResponse)
                                        .orElse(null);
                }

                String nameSurname = profileRepository.findByUserId(r.getUser().getId())
                                .map(p -> p.getFirstName() + " " + p.getLastName())
                                .orElse("");

                return ReviewResponse.builder()
                                .id(r.getId())
                                .workplaceId(r.getWorkplace().getId())
                                .userId(r.isAnonymous() ? null : r.getUser().getId())
                                .username(r.isAnonymous() ? "" : r.getUser().getUsername())
                                .nameSurname(r.isAnonymous() ? "anonymousUser" : nameSurname)
                                .title(r.getTitle())
                                .content(r.getContent())
                                .overallRating(r.getOverallRating())
                                .anonymous(r.isAnonymous())
                                .helpfulCount(r.getHelpfulCount())
                                .isHelpfulByUser(isHelpfulByUser)
                                .ethicalPolicyRatings(policies)
                                .reply(replyDto)
                                .createdAt(r.getCreatedAt())
                                .updatedAt(r.getUpdatedAt())
                                .build();
        }

        private ReplyResponse toReplyResponse(ReviewReply reply) {
                return ReplyResponse.builder()
                                .id(reply.getId())
                                .reviewId(reply.getReview().getId())
                                .employerUserId(reply.getEmployerUser() != null ? reply.getEmployerUser().getId()
                                                : null)
                                .workplaceName(reply.getReview().getWorkplace().getCompanyName())
                                .content(reply.getContent())
                                .createdAt(reply.getCreatedAt())
                                .updatedAt(reply.getUpdatedAt())
                                .build();
        }
}