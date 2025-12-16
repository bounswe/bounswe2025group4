package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import org.springframework.stereotype.Service;
import org.bounswe.jobboardbackend.mentorship.model.MentorProfile;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;

@Service
@RequiredArgsConstructor
public class AdminMentorService {

    private final MentorProfileRepository mentorProfileRepository;
    private final UserRepository userRepository;
    private final MentorshipService mentorshipService;

    @Transactional
    public void deleteMentor(Long mentorProfileId, String reason) {
        MentorProfile mentorProfile = mentorProfileRepository.findById(mentorProfileId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Mentor profile not found"));
        Long userId = mentorProfile.getUser().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));
        user.setIsMentorBanned(true);
        user.setMentorBanReason(reason);
        userRepository.save(user);
        userRepository.flush();

        mentorshipService.deleteMentorProfile(userId);

        // TODO: Log deletion with reason for audit
    }
}
