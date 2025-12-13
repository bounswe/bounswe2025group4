package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.model.MentorReview;
import org.bounswe.jobboardbackend.mentorship.model.MentorshipRequest;
import org.bounswe.jobboardbackend.mentorship.model.Message;
import org.bounswe.jobboardbackend.mentorship.model.ResumeReview;
import org.bounswe.jobboardbackend.mentorship.repository.MentorReviewRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorshipRequestRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MessageRepository;
import org.bounswe.jobboardbackend.mentorship.repository.ResumeReviewRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminMentorshipService {

    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorReviewRepository mentorReviewRepository;
    private final MessageRepository messageRepository;
    private final ResumeReviewRepository resumeReviewRepository;

    @Transactional
    public void deleteMentorshipRequest(Long requestId) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new HandleException(ErrorCode.REQUEST_NOT_FOUND, "Mentorship request not found"));

        mentorshipRequestRepository.delete(request);
    }

    @Transactional
    public void deleteMentorReview(Long reviewId) {
        MentorReview review = mentorReviewRepository.findById(reviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Mentor review not found"));

        mentorReviewRepository.delete(review);
    }

    @Transactional
    public void deleteMessage(String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Message not found"));

        messageRepository.delete(message);
    }

    @Transactional
    public void deleteResumeReview(Long resumeReviewId) {
        ResumeReview resumeReview = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "Resume review not found"));

        resumeReviewRepository.delete(resumeReview);
    }
}
