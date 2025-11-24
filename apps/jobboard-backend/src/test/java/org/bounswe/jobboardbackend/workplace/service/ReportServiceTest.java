package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.workplace.dto.ReviewReportCreate;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceReportCreate;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReport;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.model.WorkplaceReport;
import org.bounswe.jobboardbackend.workplace.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.workplace.model.enums.ReviewReportReason;
import org.bounswe.jobboardbackend.workplace.model.enums.WorkplaceReportReason;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReportRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceReportRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private WorkplaceRepository workplaceRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private WorkplaceReportRepository workplaceReportRepository;

    @Mock
    private ReviewReportRepository reviewReportRepository;

    @InjectMocks
    private ReportService reportService;

    // ==== helpers ====

    private Workplace sampleWorkplace(Long id) {
        Workplace w = new Workplace();
        w.setId(id);
        w.setCompanyName("Acme Inc");
        return w;
    }

    private User sampleUser(Long id) {
        User u = new User();
        u.setId(id);
        u.setUsername("user" + id);
        u.setEmail("user" + id + "@test.com");
        return u;
    }

    private Review sampleReview(Long id, Workplace wp) {
        Review r = new Review();
        r.setId(id);
        r.setWorkplace(wp);
        return r;
    }

    // ==== tests ====
    @Test
    void reportWorkplace_whenWorkplaceExists_savesWorkplaceReport() {
        Long workplaceId = 1L;
        Workplace wp = sampleWorkplace(workplaceId);
        User reporter = sampleUser(10L);

        WorkplaceReportCreate req = new WorkplaceReportCreate();
        req.setReasonType(WorkplaceReportReason.SPAM.name());
        req.setDescription("This is spam");

        when(workplaceRepository.findById(workplaceId))
                .thenReturn(Optional.of(wp));

        reportService.reportWorkplace(workplaceId, req, reporter);

        ArgumentCaptor<WorkplaceReport> captor = ArgumentCaptor.forClass(WorkplaceReport.class);
        verify(workplaceReportRepository).save(captor.capture());

        WorkplaceReport saved = captor.getValue();
        assertThat(saved.getWorkplace()).isEqualTo(wp);
        assertThat(saved.getCreatedBy()).isEqualTo(reporter);
        assertThat(saved.getReasonType()).isEqualTo(WorkplaceReportReason.SPAM);
        assertThat(saved.getDescription()).isEqualTo("This is spam");
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    void reportWorkplace_reasonTypeIsCaseInsensitive() {
        Long workplaceId = 1L;
        Workplace wp = sampleWorkplace(workplaceId);
        User reporter = sampleUser(10L);

        WorkplaceReportCreate req = new WorkplaceReportCreate();
        req.setReasonType("spam");
        req.setDescription("This is spam");

        when(workplaceRepository.findById(workplaceId))
                .thenReturn(Optional.of(wp));

        reportService.reportWorkplace(workplaceId, req, reporter);

        ArgumentCaptor<WorkplaceReport> captor = ArgumentCaptor.forClass(WorkplaceReport.class);
        verify(workplaceReportRepository).save(captor.capture());

        WorkplaceReport saved = captor.getValue();
        assertThat(saved.getReasonType()).isEqualTo(WorkplaceReportReason.SPAM);
    }

    @Test
    void reportWorkplace_whenWorkplaceNotFound_throwsHandleException() {
        Long workplaceId = 1L;
        WorkplaceReportCreate req = new WorkplaceReportCreate();
        req.setReasonType(WorkplaceReportReason.SPAM.name());
        req.setDescription("desc");

        when(workplaceRepository.findById(workplaceId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.reportWorkplace(workplaceId, req, sampleUser(11L)))
                .isInstanceOf(HandleException.class)
                .extracting("code")
                .isEqualTo(ErrorCode.WORKPLACE_NOT_FOUND);

        verify(workplaceReportRepository, never()).save(any());
    }

    @Test
    void reportReview_whenReviewExistsAndBelongsToWorkplace_savesReviewReport() {
        Long workplaceId = 1L;
        Long reviewId = 100L;

        Workplace wp = sampleWorkplace(workplaceId);
        Review review = sampleReview(reviewId, wp);
        User reporter = sampleUser(10L);

        ReviewReportCreate req = new ReviewReportCreate();
        req.setReasonType(ReviewReportReason.OFFENSIVE.name());
        req.setDescription("Offensive content");

        when(reviewRepository.findById(reviewId))
                .thenReturn(Optional.of(review));

        reportService.reportReview(workplaceId, reviewId, req, reporter);

        ArgumentCaptor<ReviewReport> captor = ArgumentCaptor.forClass(ReviewReport.class);
        verify(reviewReportRepository).save(captor.capture());

        ReviewReport saved = captor.getValue();
        assertThat(saved.getReview()).isEqualTo(review);
        assertThat(saved.getCreatedBy()).isEqualTo(reporter);
        assertThat(saved.getReasonType()).isEqualTo(ReviewReportReason.OFFENSIVE);
        assertThat(saved.getDescription()).isEqualTo("Offensive content");
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    void reportReview_reasonTypeIsCaseInsensitive() {
        Long workplaceId = 1L;
        Long reviewId = 100L;

        Workplace wp = sampleWorkplace(workplaceId);
        Review review = sampleReview(reviewId, wp);
        User reporter = sampleUser(10L);

        ReviewReportCreate req = new ReviewReportCreate();
        req.setReasonType("offensive");
        req.setDescription("Offensive content");

        when(reviewRepository.findById(reviewId))
                .thenReturn(Optional.of(review));

        reportService.reportReview(workplaceId, reviewId, req, reporter);

        ArgumentCaptor<ReviewReport> captor = ArgumentCaptor.forClass(ReviewReport.class);
        verify(reviewReportRepository, atLeastOnce()).save(captor.capture());

        ReviewReport saved = captor.getValue();
        assertThat(saved.getReasonType()).isEqualTo(ReviewReportReason.OFFENSIVE);
    }

    @Test
    void reportReview_whenReviewNotFound_throwsHandleException() {
        Long workplaceId = 1L;
        Long reviewId = 100L;

        ReviewReportCreate req = new ReviewReportCreate();
        req.setReasonType(ReviewReportReason.SPAM.name());
        req.setDescription("desc");

        when(reviewRepository.findById(reviewId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.reportReview(workplaceId, reviewId, req, sampleUser(10L)))
                .isInstanceOf(HandleException.class)
                .extracting("code")
                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);

        verify(reviewReportRepository, never()).save(any());
    }

    @Test
    void reportReview_whenReviewBelongsToAnotherWorkplace_throwsHandleException() {
        Long workplaceId = 1L;
        Long otherWorkplaceId = 2L;
        Long reviewId = 100L;

        Workplace otherWp = sampleWorkplace(otherWorkplaceId);
        Review review = sampleReview(reviewId, otherWp);

        ReviewReportCreate req = new ReviewReportCreate();
        req.setReasonType(ReviewReportReason.FAKE_REVIEW.name());
        req.setDescription("desc");

        when(reviewRepository.findById(reviewId))
                .thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reportService.reportReview(workplaceId, reviewId, req, sampleUser(10L)))
                .isInstanceOf(HandleException.class)
                .extracting("code")
                .isEqualTo(ErrorCode.REVIEW_NOT_FOUND);

        verify(reviewReportRepository, never()).save(any());
    }
}