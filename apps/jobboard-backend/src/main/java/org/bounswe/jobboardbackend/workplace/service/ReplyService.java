package org.bounswe.jobboardbackend.workplace.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.ReplyCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.ReplyResponse;
import org.bounswe.jobboardbackend.workplace.dto.ReplyUpdateRequest;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReplyService {

    private final WorkplaceRepository workplaceRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final UserRepository userRepository;

    private Workplace requireWorkplace(Long id) {
        return workplaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));
    }

    private Review requireReview(Long workplaceId, Long reviewId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));
        if (!r.getWorkplace().getId().equals(workplaceId)) {
            throw new NoSuchElementException("Review does not belong to workplace");
        }
        return r;
    }

    private void assertEmployerOrAdmin(Long workplaceId, Long userId, boolean isAdmin) {
        if (isAdmin) return;
        boolean isEmployer = employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId);
        if (!isEmployer) throw new AccessDeniedException("Only employer or admin can perform this action");
    }

    private ReplyResponse toDto(ReviewReply rr) {
        return ReplyResponse.builder()
                .id(rr.getId())
                .reviewId(rr.getReview().getId())
                .employerUserId(rr.getEmployerUser() != null ? rr.getEmployerUser().getId() : null)
                .content(rr.getContent())
                .createdAt(rr.getCreatedAt())
                .updatedAt(rr.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ReplyResponse getReply(Long workplaceId, Long reviewId) {
        requireWorkplace(workplaceId);
        Review review = requireReview(workplaceId, reviewId);
        ReviewReply rr = reviewReplyRepository.findByReview_Id(review.getId())
                .orElse(null);
        return rr == null ? null : toDto(rr);
    }

    @Transactional
    public ReplyResponse createReply(Long workplaceId, Long reviewId, ReplyCreateRequest req, Long employerUserId, boolean isAdmin) {
        requireWorkplace(workplaceId);
        Review review = requireReview(workplaceId, reviewId);
        assertEmployerOrAdmin(workplaceId, employerUserId, isAdmin);
        if (reviewReplyRepository.findByReview_Id(reviewId).isPresent()) {
            throw new IllegalStateException("Reply already exists for this review");
        }

        User employer = userRepository.findById(employerUserId)
                .orElseThrow(() -> new NoSuchElementException("Employer user not found"));
        ReviewReply rr = ReviewReply.builder()
                .review(review)
                .employerUser(employer)
                .content(req.getContent())
                .build();
        rr = reviewReplyRepository.save(rr);
        return toDto(rr);
    }

    @Transactional
    public ReplyResponse updateReply(Long workplaceId, Long reviewId, ReplyUpdateRequest req, Long employerUserId, boolean isAdmin) {
        requireWorkplace(workplaceId);
        requireReview(workplaceId, reviewId);
        assertEmployerOrAdmin(workplaceId, employerUserId, isAdmin);
        ReviewReply rr = reviewReplyRepository.findByReview_Id(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Reply not found"));
        rr.setContent(req.getContent());
        rr = reviewReplyRepository.save(rr);
        return toDto(rr);
    }

    @Transactional
    public void deleteReply(Long workplaceId, Long reviewId, Long actingUserId, boolean isAdmin) {
        requireWorkplace(workplaceId);
        requireReview(workplaceId, reviewId);
        assertEmployerOrAdmin(workplaceId, actingUserId, isAdmin);
        ReviewReply rr = reviewReplyRepository.findByReview_Id(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Reply not found"));
        reviewReplyRepository.delete(rr);
    }
}
