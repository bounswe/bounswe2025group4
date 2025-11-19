package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.model.*;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRequestStatus;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.repository.EmployerRequestRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployerServiceTest {

    @Mock
    private WorkplaceRepository workplaceRepository;

    @Mock
    private EmployerWorkplaceRepository employerWorkplaceRepository;

    @Mock
    private EmployerRequestRepository employerRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private WorkplaceService workplaceService;

    @InjectMocks
    private EmployerService employerService;

    // =======================
    // Helpers
    // =======================

    private Workplace sampleWorkplace(Long id, String name, boolean deleted) {
        Workplace w = new Workplace();
        w.setId(id);
        w.setCompanyName(name);
        w.setDeleted(deleted);
        return w;
    }

    private User sampleUser(Long id, String username, String email, Role role) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        u.setEmail(email);
        u.setRole(role);
        return u;
    }

    private Profile sampleProfile(Long userId) {
        Profile p = new Profile();
        p.setId(userId);
        p.setFirstName("John");
        p.setLastName("Doe");
        return p;
    }

    private EmployerWorkplace sampleLink(Long id, Workplace wp, User user, EmployerRole role, Instant createdAt) {
        EmployerWorkplace ew = new EmployerWorkplace();
        ew.setId(id);
        ew.setWorkplace(wp);
        ew.setUser(user);
        ew.setRole(role);
        ew.setCreatedAt(createdAt);
        return ew;
    }

    private EmployerRequest sampleRequest(Long id, Workplace wp, User createdBy, EmployerRequestStatus status) {
        EmployerRequest er = new EmployerRequest();
        er.setId(id);
        er.setWorkplace(wp);
        er.setCreatedBy(createdBy);
        er.setStatus(status);
        er.setNote("note");
        er.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        er.setUpdatedAt(Instant.parse("2025-01-02T00:00:00Z"));
        return er;
    }

    // =======================
    // listEmployers
    // =======================

    @Test
    void listEmployers_whenWorkplaceExists_returnsMappedEmployers() {
        Long workplaceId = 1L;
        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);

        User user = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerWorkplace link = sampleLink(
                100L, wp, user, EmployerRole.MANAGER,
                Instant.parse("2025-01-01T00:00:00Z")
        );

        Profile profile = sampleProfile(user.getId());

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                .thenReturn(List.of(link));
        when(profileRepository.findByUserId(user.getId()))
                .thenReturn(Optional.of(profile));

        List<EmployerListItem> result = employerService.listEmployers(workplaceId);

        assertThat(result).hasSize(1);
        EmployerListItem item = result.getFirst();
        assertThat(item.getUserId()).isEqualTo(user.getId());
        assertThat(item.getUsername()).isEqualTo("empUser");
        assertThat(item.getNameSurname()).isEqualTo("John Doe");
        assertThat(item.getEmail()).isEqualTo("emp@example.com");
        assertThat(item.getRole()).isEqualTo("MANAGER");
    }

    @Test
    void listEmployers_whenProfileMissing_setsEmptyNameSurname() {
        Long workplaceId = 1L;
        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);

        User user = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerWorkplace link = sampleLink(
                100L, wp, user, EmployerRole.MANAGER,
                Instant.parse("2025-01-01T00:00:00Z")
        );

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                .thenReturn(List.of(link));
        when(profileRepository.findByUserId(user.getId()))
                .thenReturn(Optional.empty());

        List<EmployerListItem> result = employerService.listEmployers(workplaceId);

        assertThat(result).hasSize(1);
        EmployerListItem item = result.getFirst();
        assertThat(item.getNameSurname()).isEqualTo("");
    }

    @Test
    void listEmployers_whenWorkplaceNotFound_throwsNoSuchElement() {
        Long workplaceId = 1L;
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employerService.listEmployers(workplaceId))
                .isInstanceOf(NoSuchElementException.class);
    }

    // =======================
    // listWorkplacesOfEmployer
    // =======================

    @Test
    void listWorkplacesOfEmployer_whenUserNotEmployer_throwsAccessDenied() {
        Long userId = 5L;
        User user = sampleUser(userId, "js", "js@example.com", Role.ROLE_JOBSEEKER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> employerService.listWorkplacesOfEmployer(userId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void listWorkplacesOfEmployer_whenUserNotFound_throwsNoSuchElement() {
        Long userId = 5L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employerService.listWorkplacesOfEmployer(userId))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void listWorkplacesOfEmployer_filtersDeletedAndMapsBriefs() {
        Long userId = 5L;
        User user = sampleUser(userId, "emp", "emp@example.com", Role.ROLE_EMPLOYER);

        Workplace wpActive = sampleWorkplace(1L, "ActiveCo", false);
        Workplace wpDeleted = sampleWorkplace(2L, "DeletedCo", true);

        EmployerWorkplace link1 = sampleLink(
                101L, wpActive, user, EmployerRole.OWNER,
                Instant.parse("2025-01-02T00:00:00Z")
        );
        EmployerWorkplace link2 = sampleLink(
                102L, wpDeleted, user, EmployerRole.MANAGER,
                Instant.parse("2025-01-03T00:00:00Z")
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employerWorkplaceRepository.findByUser_Id(userId))
                .thenReturn(List.of(link1, link2));

        WorkplaceBriefResponse brief = WorkplaceBriefResponse.builder()
                .id(wpActive.getId())
                .companyName(wpActive.getCompanyName())
                .build();
        when(workplaceService.toBriefResponse(wpActive)).thenReturn(brief);

        List<EmployerWorkplaceBrief> result = employerService.listWorkplacesOfEmployer(userId);

        assertThat(result).hasSize(1);
        EmployerWorkplaceBrief item = result.getFirst();
        assertThat(item.getRole()).isEqualTo("OWNER");
        assertThat(item.getWorkplace().getId()).isEqualTo(wpActive.getId());
        assertThat(item.getWorkplace().getCompanyName()).isEqualTo("ActiveCo");
    }

    // =======================
    // listRequests
    // =======================

    @Test
    void listRequests_whenViewerNotOwnerOrAdmin_throwsAccessDenied() {
        Long workplaceId = 1L;
        Long viewerUserId = 10L;

        assertThatThrownBy(() ->
                employerService.listRequests(workplaceId, 0, 10, viewerUserId, false)
        ).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void listRequests_whenAdmin_returnsPaginatedResponses() {
        Long workplaceId = 1L;
        Long viewerUserId = 99L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User creator = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(100L, wp, creator, EmployerRequestStatus.PENDING);

        Page<EmployerRequest> page = new PageImpl<>(List.of(er));
        when(employerRequestRepository.findByWorkplace_Id(eq(workplaceId), any(Pageable.class)))
                .thenReturn(page);
        when(profileRepository.findByUserId(creator.getId()))
                .thenReturn(Optional.of(sampleProfile(creator.getId())));

        PaginatedResponse<EmployerRequestResponse> res =
                employerService.listRequests(workplaceId, 0, 10, viewerUserId, true);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
        EmployerRequestResponse dto = res.getContent().getFirst();
        assertThat(dto.getId()).isEqualTo(er.getId());
        assertThat(dto.getWorkplaceId()).isEqualTo(workplaceId);
        assertThat(dto.getWorkplaceCompanyName()).isEqualTo("Acme");
        assertThat(dto.getUsername()).isEqualTo("empUser");
        assertThat(dto.getNameSurname()).isEqualTo("John Doe");
    }

    @Test
    void listRequests_whenOwnerNonAdmin_allowed() {
        Long workplaceId = 1L;
        Long viewerUserId = 50L;

        // owner check
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, viewerUserId, EmployerRole.OWNER
        )).thenReturn(true);

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User creator = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(100L, wp, creator, EmployerRequestStatus.PENDING);

        Page<EmployerRequest> page = new PageImpl<>(List.of(er));
        when(employerRequestRepository.findByWorkplace_Id(eq(workplaceId), any(Pageable.class)))
                .thenReturn(page);
        when(profileRepository.findByUserId(creator.getId()))
                .thenReturn(Optional.of(sampleProfile(creator.getId())));

        PaginatedResponse<EmployerRequestResponse> res =
                employerService.listRequests(workplaceId, 0, 10, viewerUserId, false);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
    }

    // =======================
    // createRequest
    // =======================

    @Test
    void createRequest_whenUserNotEmployer_throwsAccessDenied() {
        Long workplaceId = 1L;
        Long applicantId = 10L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User user = sampleUser(applicantId, "u", "u@example.com", Role.ROLE_JOBSEEKER);

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(userRepository.findById(applicantId)).thenReturn(Optional.of(user));

        EmployerRequestCreate req = new EmployerRequestCreate();
        req.setNote("I want to join");

        assertThatThrownBy(() ->
                employerService.createRequest(workplaceId, req, applicantId)
        ).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createRequest_whenAlreadyEmployer_throwsAccessDenied() {
        Long workplaceId = 1L;
        Long applicantId = 10L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User user = sampleUser(applicantId, "u", "u@example.com", Role.ROLE_EMPLOYER);

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(userRepository.findById(applicantId)).thenReturn(Optional.of(user));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, applicantId))
                .thenReturn(true);

        EmployerRequestCreate req = new EmployerRequestCreate();
        req.setNote("I want to join");

        assertThatThrownBy(() ->
                employerService.createRequest(workplaceId, req, applicantId)
        ).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createRequest_whenDuplicatePending_throwsIllegalState() {
        Long workplaceId = 1L;
        Long applicantId = 10L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User user = sampleUser(applicantId, "u", "u@example.com", Role.ROLE_EMPLOYER);

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(userRepository.findById(applicantId)).thenReturn(Optional.of(user));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, applicantId))
                .thenReturn(false);
        when(employerRequestRepository.existsByWorkplace_IdAndCreatedBy_IdAndStatus(
                workplaceId, applicantId, EmployerRequestStatus.PENDING
        )).thenReturn(true);

        EmployerRequestCreate req = new EmployerRequestCreate();
        req.setNote("I want to join");

        assertThatThrownBy(() ->
                employerService.createRequest(workplaceId, req, applicantId)
        ).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void createRequest_whenWorkplaceNotFound_throwsNoSuchElement() {
        Long workplaceId = 1L;
        Long applicantId = 10L;

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

        EmployerRequestCreate req = new EmployerRequestCreate();
        req.setNote("I want to join");

        assertThatThrownBy(() ->
                employerService.createRequest(workplaceId, req, applicantId)
        ).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void createRequest_whenValid_savesRequest() {
        Long workplaceId = 1L;
        Long applicantId = 10L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User user = sampleUser(applicantId, "u", "u@example.com", Role.ROLE_EMPLOYER);

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(userRepository.findById(applicantId)).thenReturn(Optional.of(user));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, applicantId))
                .thenReturn(false);
        when(employerRequestRepository.existsByWorkplace_IdAndCreatedBy_IdAndStatus(
                workplaceId, applicantId, EmployerRequestStatus.PENDING
        )).thenReturn(false);

        EmployerRequestCreate req = new EmployerRequestCreate();
        req.setNote("I want to join");

        ArgumentCaptor<EmployerRequest> captor = ArgumentCaptor.forClass(EmployerRequest.class);

        employerService.createRequest(workplaceId, req, applicantId);

        verify(employerRequestRepository).save(captor.capture());
        EmployerRequest saved = captor.getValue();
        assertThat(saved.getWorkplace()).isEqualTo(wp);
        assertThat(saved.getCreatedBy()).isEqualTo(user);
        assertThat(saved.getStatus()).isEqualTo(EmployerRequestStatus.PENDING);
        assertThat(saved.getNote()).isEqualTo("I want to join");
    }

    // =======================
    // getRequest
    // =======================

    @Test
    void getRequest_whenAdmin_returnsDto() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long viewerId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User creator = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, creator, EmployerRequestStatus.PENDING);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));
        when(profileRepository.findByUserId(creator.getId()))
                .thenReturn(Optional.of(sampleProfile(creator.getId())));

        EmployerRequestResponse dto =
                employerService.getRequest(workplaceId, requestId, viewerId, true);

        assertThat(dto.getId()).isEqualTo(requestId);
        assertThat(dto.getWorkplaceId()).isEqualTo(workplaceId);
        assertThat(dto.getWorkplaceCompanyName()).isEqualTo("Acme");
        assertThat(dto.getUsername()).isEqualTo("empUser");
        assertThat(dto.getNameSurname()).isEqualTo("John Doe");
    }

    @Test
    void getRequest_whenNotFound_throwsNoSuchElement() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long viewerId = 50L;

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, viewerId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                employerService.getRequest(workplaceId, requestId, viewerId, false)
        ).isInstanceOf(NoSuchElementException.class);
    }

    // =======================
    // resolveRequest
    // =======================

    @Test
    void resolveRequest_approve_createsEmployerLinkAndApproves() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User applicant = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, applicant, EmployerRequestStatus.PENDING);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, applicant.getId()))
                .thenReturn(false);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));
        when(userRepository.findById(applicant.getId())).thenReturn(Optional.of(applicant));

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("APPROVE");

        employerService.resolveRequest(workplaceId, requestId, req, resolverId, false);

        verify(employerWorkplaceRepository).save(any(EmployerWorkplace.class));

        ArgumentCaptor<EmployerRequest> captor = ArgumentCaptor.forClass(EmployerRequest.class);
        verify(employerRequestRepository, atLeastOnce()).save(captor.capture());
        EmployerRequest saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(EmployerRequestStatus.APPROVED);
    }

    @Test
    void resolveRequest_approveWhenAlreadyEmployer_onlyUpdatesStatus() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User applicant = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, applicant, EmployerRequestStatus.PENDING);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));
        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, applicant.getId()))
                .thenReturn(true);

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("APPROVE");

        employerService.resolveRequest(workplaceId, requestId, req, resolverId, false);

        verify(employerWorkplaceRepository, never()).save(any());
        ArgumentCaptor<EmployerRequest> captor = ArgumentCaptor.forClass(EmployerRequest.class);
        verify(employerRequestRepository).save(captor.capture());
        EmployerRequest saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(EmployerRequestStatus.APPROVED);
    }

    @Test
    void resolveRequest_reject_updatesStatusToRejected() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User applicant = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, applicant, EmployerRequestStatus.PENDING);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("REJECT");

        employerService.resolveRequest(workplaceId, requestId, req, resolverId, false);

        verify(employerWorkplaceRepository, never()).save(any());
        ArgumentCaptor<EmployerRequest> captor = ArgumentCaptor.forClass(EmployerRequest.class);
        verify(employerRequestRepository).save(captor.capture());
        EmployerRequest saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(EmployerRequestStatus.REJECTED);
    }

    @Test
    void resolveRequest_whenAlreadyResolved_throwsIllegalState() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User applicant = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, applicant, EmployerRequestStatus.APPROVED);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("APPROVE");

        assertThatThrownBy(() ->
                employerService.resolveRequest(workplaceId, requestId, req, resolverId, false)
        ).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void resolveRequest_whenNoApplicant_throwsIllegalArgument() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        EmployerRequest er = sampleRequest(requestId, wp, null, EmployerRequestStatus.PENDING);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("APPROVE");

        assertThatThrownBy(() ->
                employerService.resolveRequest(workplaceId, requestId, req, resolverId, false)
        ).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void resolveRequest_invalidAction_throwsIllegalArgument() {
        Long workplaceId = 1L;
        Long requestId = 100L;
        Long resolverId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User applicant = sampleUser(10L, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(requestId, wp, applicant, EmployerRequestStatus.PENDING);

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, resolverId, EmployerRole.OWNER
        )).thenReturn(true);

        when(employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId))
                .thenReturn(Optional.of(er));

        EmployerRequestResolve req = new EmployerRequestResolve();
        req.setAction("SOMETHING_ELSE");

        assertThatThrownBy(() ->
                employerService.resolveRequest(workplaceId, requestId, req, resolverId, false)
        ).isInstanceOf(IllegalArgumentException.class);
    }

    // =======================
    // removeEmployer
    // =======================

    @Test
    void removeEmployer_whenNonOwnerCanBeRemoved_deletesLink() {
        Long workplaceId = 1L;
        Long employerUserId = 10L;
        Long actingUserId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User employer = sampleUser(employerUserId, "emp", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerWorkplace link = sampleLink(
                100L, wp, employer, EmployerRole.MANAGER,
                Instant.parse("2025-01-01T00:00:00Z")
        );

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, actingUserId, EmployerRole.OWNER
        )).thenReturn(true);
        when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                .thenReturn(List.of(link));

        employerService.removeEmployer(workplaceId, employerUserId, actingUserId, false);

        verify(employerWorkplaceRepository).delete(link);
    }

    @Test
    void removeEmployer_whenLastOwner_throwsIllegalState() {
        Long workplaceId = 1L;
        Long employerUserId = 10L;
        Long actingUserId = 50L;

        Workplace wp = sampleWorkplace(workplaceId, "Acme", false);
        User employer = sampleUser(employerUserId, "emp", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerWorkplace link = sampleLink(
                100L, wp, employer, EmployerRole.OWNER,
                Instant.parse("2025-01-01T00:00:00Z")
        );

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, actingUserId, EmployerRole.OWNER
        )).thenReturn(true);
        when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                .thenReturn(List.of(link));

        assertThatThrownBy(() ->
                employerService.removeEmployer(workplaceId, employerUserId, actingUserId, false)
        ).isInstanceOf(IllegalStateException.class);

        verify(employerWorkplaceRepository, never()).delete(any());
    }

    @Test
    void removeEmployer_whenLinkNotFound_throwsNoSuchElement() {
        Long workplaceId = 1L;
        Long employerUserId = 10L;
        Long actingUserId = 50L;

        when(employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, actingUserId, EmployerRole.OWNER
        )).thenReturn(true);
        when(employerWorkplaceRepository.findByWorkplace_Id(workplaceId))
                .thenReturn(List.of()); // no links

        assertThatThrownBy(() ->
                employerService.removeEmployer(workplaceId, employerUserId, actingUserId, false)
        ).isInstanceOf(NoSuchElementException.class);

        verify(employerWorkplaceRepository, never()).delete(any());
    }

    // =======================
    // listMyRequests
    // =======================

    @Test
    void listMyRequests_returnsPaginatedResponses() {
        Long applicantId = 10L;

        Workplace wp = sampleWorkplace(1L, "Acme", false);
        User creator = sampleUser(applicantId, "empUser", "emp@example.com", Role.ROLE_EMPLOYER);
        EmployerRequest er = sampleRequest(100L, wp, creator, EmployerRequestStatus.PENDING);

        Page<EmployerRequest> page = new PageImpl<>(List.of(er));
        when(employerRequestRepository.findByCreatedBy_Id(eq(applicantId), any(Pageable.class)))
                .thenReturn(page);
        when(profileRepository.findByUserId(creator.getId()))
                .thenReturn(Optional.of(sampleProfile(creator.getId())));

        PaginatedResponse<EmployerRequestResponse> res =
                employerService.listMyRequests(applicantId, 0, 10);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).hasSize(1);
        EmployerRequestResponse dto = res.getContent().getFirst();
        assertThat(dto.getId()).isEqualTo(er.getId());
        assertThat(dto.getWorkplaceId()).isEqualTo(wp.getId());
        assertThat(dto.getWorkplaceCompanyName()).isEqualTo("Acme");
        assertThat(dto.getUsername()).isEqualTo("empUser");
        assertThat(dto.getNameSurname()).isEqualTo("John Doe");
    }

    @Test
    void listMyRequests_whenNoRequests_returnsEmptyPage() {
        Long applicantId = 10L;

        Page<EmployerRequest> page = new PageImpl<>(List.of());
        when(employerRequestRepository.findByCreatedBy_Id(eq(applicantId), any(Pageable.class)))
                .thenReturn(page);

        PaginatedResponse<EmployerRequestResponse> res =
                employerService.listMyRequests(applicantId, 0, 10);

        assertThat(res).isNotNull();
        assertThat(res.getContent()).isEmpty();
        assertThat(res.getTotalElements()).isZero();
    }
}