package org.bounswe.jobboardbackend.workplace.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.model.*;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRequestStatus;
import org.bounswe.jobboardbackend.workplace.repository.*;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.springframework.data.domain.*;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerService {

    private final WorkplaceRepository workplaceRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final EmployerRequestRepository employerRequestRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final WorkplaceService workplaceService;

    // === HELPERS ===
    private Workplace requireWorkplace(Long id) {
        return workplaceRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, "Workplace not found"));
    }

    private User managedUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }

    private boolean isEmployer(Long workplaceId, Long userId) {
        return employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId);
    }

    private boolean isOwner(Long workplaceId, Long userId) {
        return employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, userId, EmployerRole.OWNER);
    }

    private void assertEmployerOrAdmin(boolean isAdmin, Long workplaceId, Long userId) {
        if (!(isAdmin || isEmployer(workplaceId, userId))) {
            throw new HandleException(ErrorCode.WORKPLACE_UNAUTHORIZED, "Only employer or admin can perform this action");
        }
    }

    private void assertOwnerOrAdmin(boolean isAdmin, Long workplaceId, Long userId) {
        if (!(isAdmin || isOwner(workplaceId, userId))) {
            throw new HandleException(ErrorCode.WORKPLACE_UNAUTHORIZED, "Only owner or admin can perform this action");
        }
    }

    // === LIST EMPLOYERS ===
    @Transactional(readOnly = true)
    public List<EmployerListItem> listEmployers(Long workplaceId) {
        requireWorkplace(workplaceId);
        return employerWorkplaceRepository.findByWorkplace_Id(workplaceId)
                .stream()
                .map(ew -> EmployerListItem.builder()
                        .userId(ew.getUser().getId())
                        .username(ew.getUser().getUsername())
                        .nameSurname(profileRepository.findByUserId(ew.getUser().getId())
                                .map(p -> p.getFirstName() + " " + p.getLastName())
                                .orElse(""))
                        .email(ew.getUser().getEmail())
                        .role(ew.getRole() != null ? ew.getRole().name() : null)
                        .joinedAt(ew.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // === LIST WORKPLACES OF EMPLOYER ===
    @Transactional(readOnly = true)
    public List<EmployerWorkplaceBrief> listWorkplacesOfEmployer(Long userId) {
        User u = managedUser(userId);
        if (u.getRole() == null || !Role.ROLE_EMPLOYER.equals(u.getRole())) {
            throw new HandleException(ErrorCode.WORKPLACE_UNAUTHORIZED, "You are not an employer");
        }

        var links = employerWorkplaceRepository.findByUser_Id(userId);

        return links.stream()
                .filter(link -> {
                    Workplace wp = link.getWorkplace();
                    return wp != null && !wp.isDeleted();
                })
                .sorted(Comparator.comparing(EmployerWorkplace::getCreatedAt).reversed())
                .map(link -> {
                    Workplace wp = link.getWorkplace();
                    WorkplaceBriefResponse brief = workplaceService.toBriefResponse(wp);

                    return EmployerWorkplaceBrief.builder()
                            .role(link.getRole() != null ? link.getRole().name() : null)
                            .workplace(brief)
                            .build();
                })
                .toList();
    }

    // === LIST REQUESTS (employer/owner only) ===
    @Transactional(readOnly = true)
    public PaginatedResponse<EmployerRequestResponse> listRequests(Long workplaceId, int page, int size, Long viewerUserId, boolean isAdmin) {
        assertOwnerOrAdmin(isAdmin, workplaceId, viewerUserId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmployerRequest> pg = employerRequestRepository.findByWorkplace_Id(workplaceId, pageable);
        List<EmployerRequestResponse> content = pg.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return PaginatedResponse.of(content, pg.getNumber(), pg.getSize(), pg.getTotalElements());
    }

    // === CREATE REQUEST ===
    @Transactional
    public void createRequest(Long workplaceId, EmployerRequestCreate req, Long applicantUserId) {
        Workplace wp = requireWorkplace(workplaceId);
        User applicantUser = managedUser(applicantUserId);
        if (!Role.ROLE_EMPLOYER.equals(applicantUser.getRole())) {
            throw new HandleException(ErrorCode.ROLE_INVALID, "Only users with EMPLOYER role can apply to be employers");
        }

        if (isEmployer(workplaceId, applicantUserId)) {
            throw new HandleException(ErrorCode.EMPLOYER_ALREADY_ASSIGNED, "You are already an employer of this workplace");
        }

        boolean dup = employerRequestRepository.existsByWorkplace_IdAndCreatedBy_IdAndStatus(
                workplaceId,
                applicantUserId,
                EmployerRequestStatus.PENDING
        );
        if (dup) {
            throw new HandleException(ErrorCode.EMPLOYER_REQUEST_ALREADY_EXISTS, "You already have a pending request for this workplace");
        }

        User applicant = managedUser(applicantUserId);

        EmployerRequest er = EmployerRequest.builder()
                .workplace(wp)
                .createdBy(applicant)
                .status(EmployerRequestStatus.PENDING)
                .note(req.getNote())
                .build();

        employerRequestRepository.save(er);
    }

    // === GET ONE REQUEST ===
    @Transactional(readOnly = true)
    public EmployerRequestResponse getRequest(Long workplaceId, Long requestId, Long viewerUserId, boolean isAdmin) {
        assertOwnerOrAdmin(isAdmin, workplaceId, viewerUserId);
        EmployerRequest er = employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.EMPLOYER_REQUEST_NOT_FOUND, "Request not found"));
        return toDto(er);
    }

    // === RESOLVE REQUEST (APPROVE / REJECT) ===
    @Transactional
    public void resolveRequest(Long workplaceId, Long requestId, EmployerRequestResolve req, Long resolverUserId, boolean isAdmin) {
        assertOwnerOrAdmin(isAdmin, workplaceId, resolverUserId);

        EmployerRequest er = employerRequestRepository.findByIdAndWorkplace_Id(requestId, workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.EMPLOYER_REQUEST_NOT_FOUND, "Request not found"));

        if (!EmployerRequestStatus.PENDING.equals(er.getStatus())) {
            throw new HandleException(ErrorCode.EMPLOYER_REQUEST_ALREADY_RESOLVED, "Request already resolved");
        }

        Long applicantId = Optional.ofNullable(er.getCreatedBy())
                .map(User::getId)
                .orElseThrow(() -> new HandleException(ErrorCode.EMPLOYER_REQUEST_NO_APPLICANT, "Request has no applicant"));

        String action = req.getAction() != null ? req.getAction().trim().toUpperCase() : "";
        switch (action) {
            case "APPROVE": {
                if (isEmployer(workplaceId, applicantId)) {
                    er.setStatus(EmployerRequestStatus.APPROVED);
                    employerRequestRepository.save(er);
                    return;
                }

                Workplace wp = requireWorkplace(workplaceId);
                User applicant = managedUser(applicantId);

                EmployerWorkplace link = EmployerWorkplace.builder()
                        .workplace(wp)
                        .user(applicant)
                        .role(EmployerRole.MANAGER)
                        .build();
                employerWorkplaceRepository.save(link);

                er.setStatus(EmployerRequestStatus.APPROVED);
                employerRequestRepository.save(er);
                break;
            }
            case "REJECT": {
                er.setStatus(EmployerRequestStatus.REJECTED);
                employerRequestRepository.save(er);
                break;
            }
            default:
                throw new HandleException(ErrorCode.EMPLOYER_REQUEST_INVALID_ACTION, "action must be APPROVE or REJECT");
        }
    }

    // === REMOVE EMPLOYER ===
    @Transactional
    public void removeEmployer(Long workplaceId, Long employerUserId, Long actingUserId, boolean isAdmin) {
        assertOwnerOrAdmin(isAdmin, workplaceId, actingUserId);
        List<EmployerWorkplace> links = employerWorkplaceRepository.findByWorkplace_Id(workplaceId);
        Optional<EmployerWorkplace> target = links.stream().filter(l -> Objects.equals(l.getUser().getId(), employerUserId)).findFirst();
        if (target.isEmpty()) {
            throw new HandleException(ErrorCode.EMPLOYER_LINK_NOT_FOUND, "Employer link not found");
        }

        EmployerWorkplace toRemove = target.get();
        boolean removingOwner = EmployerRole.OWNER.equals(toRemove.getRole());
        if (removingOwner) {
            long ownerCount = links.stream().filter(l -> EmployerRole.OWNER.equals(l.getRole())).count();
            if (ownerCount <= 1) {
                throw new HandleException(ErrorCode.WORKPLACE_OWNER_MINIMUM_REQUIRED, "At least one owner must remain");
            }
        }
        employerWorkplaceRepository.delete(toRemove);
    }

    // === LIST MY REQUESTS (applicant side) ===
    @Transactional(readOnly = true)
    public PaginatedResponse<EmployerRequestResponse> listMyRequests(Long applicantUserId,
                                                                     int page,
                                                                     int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmployerRequest> pg = employerRequestRepository.findByCreatedBy_Id(applicantUserId, pageable);

        List<EmployerRequestResponse> content = pg.getContent()
                .stream()
                .map(this::toDto)
                .toList();

        return PaginatedResponse.of(
                content,
                pg.getNumber(),
                pg.getSize(),
                pg.getTotalElements()
        );
    }

    // === MAPPERS ===
    private EmployerRequestResponse toDto(EmployerRequest er) {
        String nameSurname = profileRepository.findByUserId(er.getCreatedBy().getId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("");
        return EmployerRequestResponse.builder()
                .id(er.getId())
                .workplaceId(er.getWorkplace().getId())
                .workplaceCompanyName(er.getWorkplace().getCompanyName())
                .createdByUserId(er.getCreatedBy() != null ? er.getCreatedBy().getId() : null)
                .username(er.getCreatedBy() != null ? er.getCreatedBy().getUsername() : null)
                .nameSurname(nameSurname)
                .note(er.getNote())
                .status(er.getStatus() != null ? er.getStatus().name() : null)
                .createdAt(er.getCreatedAt())
                .updatedAt(er.getUpdatedAt())
                .build();
    }
}
