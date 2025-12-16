package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import java.util.List;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerRequestRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminWorkplaceService {

    private final WorkplaceRepository workplaceRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    private final ReplyService replyService;
    private final JobPostRepository jobPostRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final EmployerRequestRepository employerRequestRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Transactional
    public void deleteWorkplace(Long workplaceId, String reason) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, "Workplace not found"));

        jobApplicationRepository.deleteAllByJobPost_Workplace_Id(workplaceId);

        jobPostRepository.deleteAllByWorkplaceId(workplaceId);

        employerRequestRepository.deleteAllByWorkplace_Id(workplaceId);

        employerWorkplaceRepository.deleteAllByWorkplace_Id(workplaceId);

        reviewReplyRepository.deleteAllByReview_Workplace_Id(workplaceId);

        reviewRepository.deleteAllByWorkplace_Id(workplaceId);

        workplaceRepository.delete(workplace);

    }

    @Transactional
    public void deleteReview(Long reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.REVIEW_NOT_FOUND, "Review not found"));

        reviewService.deleteReview(review.getWorkplace().getId(), reviewId, null, true);

    }

    @Transactional
    public void deleteReviewReply(Long replyId, String reason) {
        ReviewReply reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Review reply not found"));

        Long workplaceId = reply.getReview().getWorkplace().getId();
        Long reviewId = reply.getReview().getId();

        replyService.deleteReply(workplaceId, reviewId, null, true);

    }
}
