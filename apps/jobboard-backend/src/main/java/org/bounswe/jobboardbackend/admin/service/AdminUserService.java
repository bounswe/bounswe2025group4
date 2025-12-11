package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.admin.dto.BanUserRequest;
import org.bounswe.jobboardbackend.admin.dto.UserListResponse;
import org.bounswe.jobboardbackend.admin.service.AdminWorkplaceService;
import org.springframework.context.annotation.Lazy;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorshipRequestRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    @Lazy
    private final AdminWorkplaceService adminWorkplaceService;
    private final WorkplaceRepository workplaceRepository;
    private final BadgeRepository badgeRepository;

    public Page<UserListResponse> listUsers(Pageable pageable, Role role, Boolean isBanned) {
        Page<User> users;

        if (role != null && isBanned != null) {
            users = userRepository.findByRoleAndIsBanned(role, isBanned, pageable);
        } else if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else if (isBanned != null) {
            users = userRepository.findByIsBanned(isBanned, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::mapToUserListResponse);
    }

    @Transactional
    public void banUser(Long userId, BanUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "User is already banned");
        }

        user.setIsBanned(true);
        user.setBanReason(request.getReason());
        userRepository.save(user);
        userRepository.flush(); // Force immediate ban status update

        // CASCADE DELETIONS
        // 1. Delete profile
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            profileRepository.delete(profile);
            profileRepository.flush(); // Force immediate deletion
        });

        badgeRepository.deleteAllByUserId(userId);

        // 2. Delete mentorships if user is a mentor
        mentorProfileRepository.findByUserId(userId).ifPresent(mentor -> {
            mentorshipRequestRepository.deleteAllByMentorId(mentor.getId());
            mentorProfileRepository.delete(mentor);
        });

        // 3. Delete job applications
        jobApplicationRepository.deleteAllByJobSeekerId(userId);

        // 4. Delete owned workplaces (where user is OWNER) using proper cascade
        employerWorkplaceRepository.findByUser_IdAndRole(userId, EmployerRole.OWNER)
                .forEach(ew -> adminWorkplaceService.deleteWorkplace(ew.getWorkplace().getId(),
                        "Owner banned: " + request.getReason()));

        // NOTE: Forum posts/comments and workplace reviews/replies are PRESERVED
        // They will be displayed as content from "banned user"
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (!Boolean.TRUE.equals(user.getIsBanned())) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "User is not banned");
        }

        user.setIsBanned(false);
        user.setBanReason(null);

        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Cascade delete will be handled by database constraints
        userRepository.delete(user);
    }

    private UserListResponse mapToUserListResponse(User user) {
        return UserListResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .isBanned(user.getIsBanned())
                .banReason(user.getBanReason())
                .build();
    }

    @Transactional
    public void banMentor(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getIsMentorBanned())) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "User is already banned from mentorship");
        }

        user.setIsMentorBanned(true);
        user.setMentorBanReason(reason);
        userRepository.save(user);
    }

    @Transactional
    public void unbanMentor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (Boolean.FALSE.equals(user.getIsMentorBanned())) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "User is not banned from mentorship");
        }

        user.setIsMentorBanned(false);
        user.setMentorBanReason(null);
        userRepository.save(user);
    }
}
