package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReplyServiceTest {

    @Mock private WorkplaceRepository workplaceRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private ReviewReplyRepository replyRepository;
    @Mock private EmployerWorkplaceRepository employerWorkplaceRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ReplyService replyService;

    private Workplace workplace;
    private Review review;
    private ReviewReply reply;
    private User employer;

    @BeforeEach
    void setup() {
        workplace = new Workplace();
        workplace.setId(1L);
        workplace.setCompanyName("TestCorp");

        review = new Review();
        review.setId(10L);
        review.setWorkplace(workplace);

        employer = new User();
        employer.setId(55L);

        reply = new ReviewReply();
        reply.setId(100L);
        reply.setReview(review);
        reply.setEmployerUser(employer);
        reply.setContent("Initial content");
    }

    // ------------------------------------------------------------------------
    // GET REPLY
    // ------------------------------------------------------------------------

    @Test
    void getReply_whenReplyExists_returnsDto() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.of(reply));

        ReplyResponse res = replyService.getReply(1L, 10L);

        assertThat(res).isNotNull();
        assertThat(res.getId()).isEqualTo(100L);
        verify(reviewRepository).findById(10L);
    }

    @Test
    void getReply_whenNoReplyExists_returnsNull() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.empty());

        ReplyResponse res = replyService.getReply(1L, 10L);

        assertThat(res).isNull();
    }

    @Test
    void getReply_whenWorkplaceNotFound_throws() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> replyService.getReply(1L, 10L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void getReply_whenReviewNotBelongsToWorkplace_throws() {
        Workplace otherWp = new Workplace();
        otherWp.setId(999L);
        review.setWorkplace(otherWp);

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> replyService.getReply(1L, 10L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Review does not belong");
    }

    // ------------------------------------------------------------------------
    // CREATE REPLY
    // ------------------------------------------------------------------------

    @Test
    void createReply_whenValidEmployer_createsReply() {
        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("New reply");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.empty());
        when(userRepository.findById(55L)).thenReturn(Optional.of(employer));
        when(replyRepository.save(any())).thenReturn(reply);

        ReplyResponse response = replyService.createReply(1L, 10L, req, 55L, false);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).isEqualTo("Initial content");
    }

    @Test
    void createReply_whenReplyAlreadyExists_throws() {
        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("Duplicate");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.of(reply));

        assertThatThrownBy(() -> replyService.createReply(1L, 10L, req, 55L, false))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void createReply_whenUnauthorizedUser_throws() {
        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("Unauthorized");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(false);

        assertThatThrownBy(() -> replyService.createReply(1L, 10L, req, 55L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createReply_whenAdmin_allowedEvenIfNotEmployer() {
        ReplyCreateRequest req = new ReplyCreateRequest();
        req.setContent("Admin content");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.empty());
        when(userRepository.findById(55L)).thenReturn(Optional.of(employer));
        when(replyRepository.save(any())).thenReturn(reply);

        ReplyResponse res = replyService.createReply(1L, 10L, req, 55L, true);

        assertThat(res).isNotNull();
    }

    // ------------------------------------------------------------------------
    // UPDATE REPLY
    // ------------------------------------------------------------------------

    @Test
    void updateReply_whenValid_updatesReply() {
        ReplyUpdateRequest req = new ReplyUpdateRequest();
        req.setContent("Updated");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.of(reply));
        when(replyRepository.save(any())).thenReturn(reply);

        ReplyResponse res = replyService.updateReply(1L, 10L, req, 55L, false);

        assertThat(res.getId()).isEqualTo(100L);
    }

    @Test
    void updateReply_whenReplyMissing_throws() {
        ReplyUpdateRequest req = new ReplyUpdateRequest();
        req.setContent("Updated");

        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> replyService.updateReply(1L, 10L, req, 55L, false))
                .isInstanceOf(NoSuchElementException.class);
    }

    // ------------------------------------------------------------------------
    // DELETE REPLY
    // ------------------------------------------------------------------------

    @Test
    void deleteReply_whenValid_deletesReply() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L)).thenReturn(Optional.of(reply));

        replyService.deleteReply(1L, 10L, 55L, false);

        verify(replyRepository).delete(reply);
    }

    @Test
    void deleteReply_whenReplyMissing_throws() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(true);
        when(replyRepository.findByReview_Id(10L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> replyService.deleteReply(1L, 10L, 55L, false))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void deleteReply_whenNotEmployerAndNotAdmin_throws() {
        when(workplaceRepository.findById(1L)).thenReturn(Optional.of(workplace));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(1L, 55L))
                .thenReturn(false);

        assertThatThrownBy(() -> replyService.deleteReply(1L, 10L, 55L, false))
                .isInstanceOf(AccessDeniedException.class);
    }
}