package org.bounswe.jobboardbackend.report.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.report.dto.CreateReportRequest;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportReasonType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.repository.ReportRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private WorkplaceRepository workplaceRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ForumPostRepository forumPostRepository;
    @Mock
    private ForumCommentRepository forumCommentRepository;
    @Mock
    private JobPostRepository jobPostRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private ReviewReplyRepository reviewReplyRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @InjectMocks
    private ReportService reportService;

    private User testReporter;
    private CreateReportRequest validRequest;

    @BeforeEach
    void setUp() {
        testReporter = new User();
        testReporter.setId(1L);
        testReporter.setUsername("reporter1");

        validRequest = new CreateReportRequest();
        validRequest.setEntityType(ReportableEntityType.WORKPLACE);
        validRequest.setEntityId(100L);
        validRequest.setReasonType(ReportReasonType.SPAM);
        validRequest.setDescription("This workplace is spam");
    }

    @Test
    void createReport_Success_WorkplaceReport() {
        when(workplaceRepository.existsById(100L)).thenReturn(true);
        when(reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(
                ReportableEntityType.WORKPLACE, 100L, testReporter))
                .thenReturn(Optional.empty());

        Report savedReport = createMockReport(1L, ReportableEntityType.WORKPLACE, 100L);
        when(reportRepository.save(any(Report.class))).thenReturn(savedReport);
        when(workplaceRepository.findById(100L)).thenReturn(Optional.empty()); // For entity name
        ReportResponse response = reportService.createReport(validRequest, testReporter);
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(ReportableEntityType.WORKPLACE, response.getEntityType());
        assertEquals(100L, response.getEntityId());
        assertEquals(ReportStatus.PENDING, response.getStatus());
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    void createReport_AllEntityTypes_Success() {
        ReportableEntityType[] types = ReportableEntityType.values();

        for (ReportableEntityType type : types) {
            validRequest.setEntityType(type);
            validRequest.setEntityId(123L);

            mockEntityExists(type, 123L, true);
            when(reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(eq(type), eq(123L), eq(testReporter)))
                    .thenReturn(Optional.empty());

            Report savedReport = createMockReport(1L, type, 123L);
            when(reportRepository.save(any(Report.class))).thenReturn(savedReport);
            mockEntityName(type, 123L);
            ReportResponse response = reportService.createReport(validRequest, testReporter);
            assertNotNull(response);
            assertEquals(type, response.getEntityType());

            reset(reportRepository);
        }
    }

    @Test
    void createReport_DuplicatePrevention_ThrowsException() {
        Report existingReport = createMockReport(99L, ReportableEntityType.WORKPLACE, 100L);
        when(workplaceRepository.existsById(100L)).thenReturn(true);
        when(reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(
                ReportableEntityType.WORKPLACE, 100L, testReporter))
                .thenReturn(Optional.of(existingReport));
        HandleException ex = assertThrows(HandleException.class,
                () -> reportService.createReport(validRequest, testReporter));
        assertTrue(ex.getMessage().contains("already reported"));
        verify(reportRepository, never()).save(any());
    }

    @Test
    void createReport_EntityNotExists_ThrowsException() {
        when(workplaceRepository.existsById(999L)).thenReturn(false);
        validRequest.setEntityId(999L);
        HandleException ex = assertThrows(HandleException.class,
                () -> reportService.createReport(validRequest, testReporter));
        assertTrue(ex.getMessage().contains("does not exist"));
        verify(reportRepository, never()).save(any());
    }

    @Test
    void createReport_AllReasonTypes_Success() {
        ReportReasonType[] reasons = ReportReasonType.values();

        when(workplaceRepository.existsById(100L)).thenReturn(true);
        when(reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(reportRepository.save(any(Report.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(workplaceRepository.findById(100L)).thenReturn(Optional.empty());

        for (ReportReasonType reason : reasons) {
            validRequest.setReasonType(reason);
            ReportResponse response = reportService.createReport(validRequest, testReporter);
            assertNotNull(response);
        }
    }

    @Test
    void createReport_WithDescription_SavesCorrectly() {
        String longDescription = "This is a detailed description explaining why this content should be reported. " +
                "It contains specific examples and reasons.";
        validRequest.setDescription(longDescription);

        when(workplaceRepository.existsById(100L)).thenReturn(true);
        when(reportRepository.findByEntityTypeAndEntityIdAndCreatedBy(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(reportRepository.save(any(Report.class)))
                .thenAnswer(inv -> {
                    Report report = inv.getArgument(0);
                    report.setId(1L);
                    return report;
                });
        when(workplaceRepository.findById(100L)).thenReturn(Optional.empty());
        ReportResponse response = reportService.createReport(validRequest, testReporter);
        verify(reportRepository).save(argThat(report -> report.getDescription().equals(longDescription)));
    }

    @Test
    void listReports_NoFilters_ReturnsAll() {
        List<Report> reports = List.of(
                createMockReport(1L, ReportableEntityType.WORKPLACE, 1L),
                createMockReport(2L, ReportableEntityType.PROFILE, 2L),
                createMockReport(3L, ReportableEntityType.FORUM_POST, 3L));
        Page<Report> reportPage = new PageImpl<>(reports);
        Pageable pageable = PageRequest.of(0, 10);

        when(reportRepository.findAll(pageable)).thenReturn(reportPage);
        mockAllEntityNames();
        Page<ReportResponse> result = reportService.listReports(null, null, pageable);
        assertEquals(3, result.getContent().size());
        verify(reportRepository).findAll(pageable);
        verify(reportRepository, never()).findByStatus(any(), any());
        verify(reportRepository, never()).findByEntityTypeAndStatus(any(), any(), any());
    }

    @Test
    void listReports_ByStatus_FiltersPending() {
        List<Report> pendingReports = List.of(
                createMockReport(1L, ReportableEntityType.WORKPLACE, 1L),
                createMockReport(2L, ReportableEntityType.PROFILE, 2L));
        Page<Report> reportPage = new PageImpl<>(pendingReports);
        Pageable pageable = PageRequest.of(0, 10);

        when(reportRepository.findByStatus(ReportStatus.PENDING, pageable)).thenReturn(reportPage);
        mockAllEntityNames();
        Page<ReportResponse> result = reportService.listReports(ReportStatus.PENDING, null, pageable);
        assertEquals(2, result.getContent().size());
        verify(reportRepository).findByStatus(ReportStatus.PENDING, pageable);
    }

    @Test
    void listReports_ByEntityType_FiltersWorkplace() {
        List<Report> workplaceReports = List.of(
                createMockReport(1L, ReportableEntityType.WORKPLACE, 1L),
                createMockReport(2L, ReportableEntityType.WORKPLACE, 2L));
        Page<Report> reportPage = new PageImpl<>(workplaceReports);
        Pageable pageable = PageRequest.of(0, 10);

        when(reportRepository.findByEntityTypeAndStatus(
                ReportableEntityType.WORKPLACE, ReportStatus.PENDING, pageable))
                .thenReturn(reportPage);
        mockAllEntityNames();
        Page<ReportResponse> result = reportService.listReports(
                ReportStatus.PENDING, ReportableEntityType.WORKPLACE, pageable);
        assertEquals(2, result.getContent().size());
        verify(reportRepository).findByEntityTypeAndStatus(
                ReportableEntityType.WORKPLACE, ReportStatus.PENDING, pageable);
    }

    @Test
    void listReports_EmptyResult_ReturnsEmptyPage() {
        Page<Report> emptyPage = Page.empty();
        Pageable pageable = PageRequest.of(0, 10);
        when(reportRepository.findAll(pageable)).thenReturn(emptyPage);
        Page<ReportResponse> result = reportService.listReports(null, null, pageable);
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    @Test
    void getReport_ExistingReport_ReturnsResponse() {
        Report report = createMockReport(1L, ReportableEntityType.WORKPLACE, 100L);
        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));
        when(workplaceRepository.findById(100L)).thenReturn(Optional.empty());
        ReportResponse response = reportService.getReport(1L);
        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(reportRepository).findById(1L);
    }

    @Test
    void getReport_NotFound_ThrowsException() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());
        HandleException ex = assertThrows(HandleException.class,
                () -> reportService.getReport(999L));
        assertTrue(ex.getMessage().contains("not found"));
    }

    private Report createMockReport(Long id, ReportableEntityType entityType, Long entityId) {
        Report report = new Report();
        report.setId(id);
        report.setEntityType(entityType);
        report.setEntityId(entityId);
        report.setStatus(ReportStatus.PENDING);
        report.setCreatedBy(testReporter);
        report.setReasonType(ReportReasonType.SPAM);
        return report;
    }

    private void mockEntityExists(ReportableEntityType type, Long entityId, boolean exists) {
        switch (type) {
            case WORKPLACE -> when(workplaceRepository.existsById(entityId)).thenReturn(exists);
            case PROFILE -> when(profileRepository.existsById(entityId)).thenReturn(exists);
            case REVIEW -> when(reviewRepository.existsById(entityId)).thenReturn(exists);
            case FORUM_POST -> when(forumPostRepository.existsById(entityId)).thenReturn(exists);
            case FORUM_COMMENT -> when(forumCommentRepository.existsById(entityId)).thenReturn(exists);
            case JOB_POST -> when(jobPostRepository.existsById(entityId)).thenReturn(exists);
            case JOB_APPLICATION -> when(jobApplicationRepository.existsById(entityId)).thenReturn(exists);
            case REVIEW_REPLY -> when(reviewReplyRepository.existsById(entityId)).thenReturn(exists);
            case MENTOR -> when(mentorProfileRepository.existsById(entityId)).thenReturn(exists);
        }
    }

    private void mockEntityName(ReportableEntityType type, Long entityId) {
        lenient().when(workplaceRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(reviewRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(forumPostRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(forumCommentRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(jobPostRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(profileRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(mentorProfileRepository.findById(any())).thenReturn(Optional.empty());
    }

    private void mockAllEntityNames() {
        mockEntityName(null, null);
    }
}
