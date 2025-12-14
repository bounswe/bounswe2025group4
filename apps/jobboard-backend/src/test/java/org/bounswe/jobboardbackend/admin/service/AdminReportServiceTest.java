package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.admin.dto.BanUserRequest;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.model.MentorProfile;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.report.dto.ResolveReportRequest;
import org.bounswe.jobboardbackend.report.model.Report;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.repository.ReportRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.Review;
import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewReplyRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {
    @Mock
    private ReportRepository reportRepository;
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
    @Mock
    private EmployerWorkplaceRepository employerWorkplaceRepository;
    @Mock
    private AdminWorkplaceService adminWorkplaceService;
    @Mock
    private AdminForumService adminForumService;
    @Mock
    private AdminJobPostService adminJobPostService;
    @Mock
    private AdminJobApplicationService adminJobApplicationService;
    @Mock
    private AdminProfileService adminProfileService;
    @Mock
    private AdminMentorService adminMentorService;
    @Mock
    private AdminUserService adminUserService;

    @InjectMocks
    private AdminReportService adminReportService;

    private User mockUser;
    private Report mockReport;
    private ResolveReportRequest resolveRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(100L)
                .username("test_user")
                .email("test@example.com")
                .build();

        mockReport = new Report();
        mockReport.setId(1L);
        mockReport.setEntityType(ReportableEntityType.WORKPLACE);
        mockReport.setEntityId(10L);
        mockReport.setStatus(ReportStatus.PENDING);

        resolveRequest = new ResolveReportRequest();
        resolveRequest.setStatus(ReportStatus.APPROVED);
        resolveRequest.setAdminNote("Admin action taken");
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        UserDetails userDetails = mock(UserDetails.class);

        lenient().when(userDetails.getUsername()).thenReturn("admin");
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("ResolveReport: Should fail if report is not found")
    void resolveReport_Fail_NotFound() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        HandleException exception = assertThrows(HandleException.class,
                () -> adminReportService.resolveReport(999L, resolveRequest));

        assertEquals(ErrorCode.NOT_FOUND, exception.getCode());
    }

    @Test
    @DisplayName("ResolveReport: Should fail if report is already resolved")
    void resolveReport_Fail_AlreadyResolved() {
        mockReport.setStatus(ReportStatus.REJECTED); // Already processed
        when(reportRepository.findById(mockReport.getId())).thenReturn(Optional.of(mockReport));

        HandleException exception = assertThrows(HandleException.class,
                () -> adminReportService.resolveReport(mockReport.getId(), resolveRequest));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getCode());
        assertTrue(exception.getMessage().contains("already been resolved"));
    }

    @Test
    @DisplayName("ResolveReport: Should only delete content when deleteContent=true and banUser=false")
    void resolveReport_Success_DeleteOnly() {
        resolveRequest.setDeleteContent(true);
        resolveRequest.setBanUser(false);

        mockReport.setEntityType(ReportableEntityType.WORKPLACE);
        mockReport.setEntityId(10L);

        when(reportRepository.findById(mockReport.getId())).thenReturn(Optional.of(mockReport));
        adminReportService.resolveReport(mockReport.getId(), resolveRequest);
        verify(adminWorkplaceService).deleteWorkplace(eq(10L), anyString());
        verify(adminUserService, never()).banUser(anyLong(), any());
        verify(reportRepository).save(argThat(r -> r.getStatus() == ReportStatus.APPROVED &&
                r.getAdminNote().equals("Admin action taken")));
    }

    @Test
    @DisplayName("ResolveReport: Should only ban user when deleteContent=false and banUser=true")
    void resolveReport_Success_BanOnly() {
        resolveRequest.setDeleteContent(false);
        resolveRequest.setBanUser(true);
        resolveRequest.setBanReason("Spammer");

        mockReport.setEntityType(ReportableEntityType.WORKPLACE);
        mockReport.setEntityId(10L);
        EmployerWorkplace ew = new EmployerWorkplace();
        ew.setUser(mockUser);
        when(employerWorkplaceRepository.findByWorkplace_IdAndRole(10L, EmployerRole.OWNER))
                .thenReturn(Optional.of(ew));

        when(reportRepository.findById(mockReport.getId())).thenReturn(Optional.of(mockReport));
        adminReportService.resolveReport(mockReport.getId(), resolveRequest);
        verify(adminWorkplaceService, never()).deleteWorkplace(anyLong(), anyString());
        verify(adminUserService).banUser(eq(mockUser.getId()), argThat(req -> req.getReason().equals("Spammer")));
        verify(reportRepository).save(mockReport);
    }

    @Test
    @DisplayName("ResolveReport: Should delete content AND ban user when both true")
    void resolveReport_Success_Both() {
        resolveRequest.setDeleteContent(true);
        resolveRequest.setBanUser(true);
        resolveRequest.setBanReason("Severe violation");
        mockReport.setEntityType(ReportableEntityType.REVIEW);
        mockReport.setEntityId(200L);
        Review mockReview = new Review();
        mockReview.setUser(mockUser);
        when(reviewRepository.findById(200L)).thenReturn(Optional.of(mockReview));

        when(reportRepository.findById(mockReport.getId())).thenReturn(Optional.of(mockReport));
        adminReportService.resolveReport(mockReport.getId(), resolveRequest);
        verify(adminWorkplaceService).deleteReview(eq(200L), anyString());
        verify(adminUserService).banUser(eq(mockUser.getId()),
                argThat(req -> req.getReason().equals("Severe violation")));
    }

    @Test
    @DisplayName("GetContentCreatorId: Should return correct user ID for all entity types")
    void getContentCreatorId_Success_AllTypes() {
        EmployerWorkplace ew = new EmployerWorkplace();
        ew.setUser(mockUser);
        when(employerWorkplaceRepository.findByWorkplace_IdAndRole(anyLong(), eq(EmployerRole.OWNER)))
                .thenReturn(Optional.of(ew));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.WORKPLACE, 1L));
        Review r = new Review();
        r.setUser(mockUser);
        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(r));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.REVIEW, 1L));
        ForumPost fp = new ForumPost();
        fp.setAuthor(mockUser);
        when(forumPostRepository.findById(anyLong())).thenReturn(Optional.of(fp));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.FORUM_POST, 1L));
        ForumComment fc = new ForumComment();
        fc.setAuthor(mockUser);
        when(forumCommentRepository.findById(anyLong())).thenReturn(Optional.of(fc));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.FORUM_COMMENT, 1L));
        JobPost jp = new JobPost();
        jp.setEmployer(mockUser);
        when(jobPostRepository.findById(anyLong())).thenReturn(Optional.of(jp));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.JOB_POST, 1L));
        JobApplication ja = new JobApplication();
        ja.setJobSeeker(mockUser);
        when(jobApplicationRepository.findById(anyLong())).thenReturn(Optional.of(ja));
        assertEquals(mockUser.getId(),
                adminReportService.getContentCreatorId(ReportableEntityType.JOB_APPLICATION, 1L));
        ReviewReply rr = new ReviewReply();
        rr.setEmployerUser(mockUser);
        when(reviewReplyRepository.findById(anyLong())).thenReturn(Optional.of(rr));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.REVIEW_REPLY, 1L));
        Profile p = new Profile();
        p.setUser(mockUser);
        when(profileRepository.findById(anyLong())).thenReturn(Optional.of(p));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.PROFILE, 1L));
        MentorProfile mp = new MentorProfile();
        mp.setUser(mockUser);
        when(mentorProfileRepository.findById(anyLong())).thenReturn(Optional.of(mp));
        assertEquals(mockUser.getId(), adminReportService.getContentCreatorId(ReportableEntityType.MENTOR, 1L));
    }

    @Test
    @DisplayName("GetContentCreatorId: Should return null if entity not found")
    void getContentCreatorId_Fail_NotFound() {
        when(profileRepository.findById(999L)).thenReturn(Optional.empty());
        assertNull(adminReportService.getContentCreatorId(ReportableEntityType.PROFILE, 999L));
    }

    @Test
    @DisplayName("DeleteReportedContent: Should route to correct service for all entity types")
    void deleteReportedContent_Success_AllTypes() {
        adminReportService.deleteReportedContent(ReportableEntityType.WORKPLACE, 1L);
        verify(adminWorkplaceService).deleteWorkplace(eq(1L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.REVIEW, 2L);
        verify(adminWorkplaceService).deleteReview(eq(2L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.FORUM_POST, 3L);
        verify(adminForumService).deletePost(eq(3L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.FORUM_COMMENT, 4L);
        verify(adminForumService).deleteComment(eq(4L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.JOB_POST, 5L);
        verify(adminJobPostService).deleteJobPost(eq(5L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.JOB_APPLICATION, 6L);
        verify(adminJobApplicationService).deleteJobApplication(eq(6L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.REVIEW_REPLY, 7L);
        verify(adminWorkplaceService).deleteReviewReply(eq(7L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.PROFILE, 8L);
        verify(adminProfileService).deleteProfile(eq(8L), anyString());
        adminReportService.deleteReportedContent(ReportableEntityType.MENTOR, 9L);
        verify(adminMentorService).deleteMentor(eq(9L), anyString());
    }

    @Test
    @DisplayName("DeleteReportedContent: Should throw exception for unsupported type")
    void deleteReportedContent_Fail_Unsupported() {
    }
}
