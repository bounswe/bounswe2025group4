package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminProfileService {

    private final ProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;

    @Transactional
    public void deleteProfile(Long profileId, String reason) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new HandleException(ErrorCode.PROFILE_NOT_FOUND, "Profile not found"));

        profileRepository.delete(profile);
        profileRepository.flush(); // Force immediate deletion
    }

    @Transactional
    public void deleteBadge(Long badgeId, String reason) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Badge not found"));

        badgeRepository.delete(badge);
    }
}
