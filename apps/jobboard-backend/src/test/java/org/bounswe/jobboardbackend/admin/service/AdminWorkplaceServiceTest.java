package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.EmployerRequestRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminWorkplaceServiceTest {

    @Mock
    private WorkplaceRepository workplaceRepository;
    @Mock
    private JobPostRepository jobPostRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private EmployerRequestRepository employerRequestRepository;
    @Mock
    private EmployerWorkplaceRepository employerWorkplaceRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewReplyRepository reviewReplyRepository;
    @Mock
    private ReviewService reviewService;
    @Mock
    private ReplyService replyService;

    @InjectMocks
    private AdminWorkplaceService adminWorkplaceService;

    private Workplace testWorkplace;

    @BeforeEach
    void setUp() {
        testWorkplace = new Workplace();
        testWorkplace.setId(1L);
        testWorkplace.setCompanyName("Test Company");
    }

    @Test
    void deleteWorkplace_Success_DeletesInCorrectOrder() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        adminWorkplaceService.deleteWorkplace(1L, "Test deletion");
        var inOrder = inOrder(
                jobApplicationRepository,
                jobPostRepository,
                employerRequestRepository,
                employerWorkplaceRepository,
                reviewReplyRepository,
                reviewRepository,
                workplaceRepository);
        inOrder.verify(jobApplicationRepository).deleteAllByJobPost_Workplace_Id(1L);
        inOrder.verify(jobPostRepository).deleteAllByWorkplaceId(1L);
        inOrder.verify(employerRequestRepository).deleteAllByWorkplace_Id(1L);
        inOrder.verify(employerWorkplaceRepository).deleteAllByWorkplace_Id(1L);
        inOrder.verify(reviewReplyRepository).deleteAllByReview_Workplace_Id(1L);
        inOrder.verify(reviewRepository).deleteAllByWorkplace_Id(1L);
        inOrder.verify(workplaceRepository).delete(testWorkplace);
    }

    @Test
    void deleteWorkplace_NotFound_ThrowsException() {
        when(workplaceRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminWorkplaceService.deleteWorkplace(999L, "Test"));
        verify(jobApplicationRepository, never()).deleteAllByJobPost_Workplace_Id(anyLong());
        verify(jobPostRepository, never()).deleteAllByWorkplaceId(anyLong());
        verify(workplaceRepository, never()).delete(any());
    }

    @Test
    void deleteWorkplace_CascadeJobsAndApplications() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        adminWorkplaceService.deleteWorkplace(1L, "Cascade test");
        verify(jobApplicationRepository).deleteAllByJobPost_Workplace_Id(1L);
        verify(jobPostRepository).deleteAllByWorkplaceId(1L);
    }

    @Test
    void deleteWorkplace_CascadeReviewsAndReplies() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        adminWorkplaceService.deleteWorkplace(1L, "Cascade test");
        verify(reviewReplyRepository).deleteAllByReview_Workplace_Id(1L);
        verify(reviewRepository).deleteAllByWorkplace_Id(1L);
    }

    @Test
    void deleteWorkplace_CascadeEmployerRelationships() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        adminWorkplaceService.deleteWorkplace(1L, "Cascade test");
        verify(employerRequestRepository).deleteAllByWorkplace_Id(1L);
        verify(employerWorkplaceRepository).deleteAllByWorkplace_Id(1L);
    }

    @Test
    void deleteWorkplace_WithReason_ProcessesCorrectly() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        String reason = "Owner banned for policy violation";
        adminWorkplaceService.deleteWorkplace(1L, reason);
        verify(workplaceRepository).delete(testWorkplace);
    }

    @Test
    void deleteWorkplace_AllCascadeLayers_Verified() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(testWorkplace));
        adminWorkplaceService.deleteWorkplace(1L, null);
        verify(jobApplicationRepository, times(1)).deleteAllByJobPost_Workplace_Id(1L);
        verify(jobPostRepository, times(1)).deleteAllByWorkplaceId(1L);
        verify(employerRequestRepository, times(1)).deleteAllByWorkplace_Id(1L);
        verify(employerWorkplaceRepository, times(1)).deleteAllByWorkplace_Id(1L);
        verify(reviewReplyRepository, times(1)).deleteAllByReview_Workplace_Id(1L);
        verify(reviewRepository, times(1)).deleteAllByWorkplace_Id(1L);
        verify(workplaceRepository, times(1)).delete(testWorkplace);
    }

    @Test
    void deleteReview_CallsReviewService() {
        Review review = new Review();
        review.setId(10L);
        Workplace workplace = new Workplace();
        workplace.setId(100L);
        review.setWorkplace(workplace);

        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        adminWorkplaceService.deleteReview(10L, "Inappropriate review");
        verify(reviewService).deleteReview(eq(100L), eq(10L), isNull(), eq(true));
    }

    @Test
    void deleteReview_NotFound_ThrowsException() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminWorkplaceService.deleteReview(999L, "Test"));

        verify(reviewService, never()).deleteReview(anyLong(), anyLong(), any(), anyBoolean());
    }

    @Test
    void deleteReviewReply_CallsReplyService() {
        ReviewReply reply = new ReviewReply();
        reply.setId(20L);

        Review review = new Review();
        review.setId(10L);
        Workplace workplace = new Workplace();
        workplace.setId(100L);
        review.setWorkplace(workplace);

        reply.setReview(review);

        when(reviewReplyRepository.findById(20L)).thenReturn(Optional.of(reply));
        adminWorkplaceService.deleteReviewReply(20L, "Inappropriate reply");
        verify(replyService).deleteReply(eq(100L), eq(10L), isNull(), eq(true));
    }

    @Test
    void deleteReviewReply_NotFound_ThrowsException() {
        when(reviewReplyRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminWorkplaceService.deleteReviewReply(999L, "Test"));

        verify(replyService, never()).deleteReply(anyLong(), anyLong(), any(), anyBoolean());
    }
}
