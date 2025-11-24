package org.bounswe.jobboardbackend.mentorship.service;


import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MentorshipService {



    ResumeFileResponseDTO uploadResumeFile(Long resumeReviewId, MultipartFile file);
    ResumeFileUrlDTO getResumeFileUrl(Long resumeReviewId);
    ResumeReviewDTO getResumeReview(Long resumeReviewId);

    List<MentorshipDetailsDTO> getMentorshipDetailsForMentee(Long menteeId, Long currentUserId);
    List<MentorProfileDetailDTO> searchMentors();
    MentorProfileDTO createMentorProfile(Long userId, CreateMentorProfileDTO createDTO);
    MentorProfileDetailDTO getMentorProfile(Long userId);
    MentorProfileDTO updateMentorProfile(Long userId, UpdateMentorProfileDTO updateDTO);
    void deleteMentorProfile(Long userId);
    MentorshipRequestDTO createMentorshipRequest(CreateMentorshipRequestDTO requestDTO, Long jobSeekerId);
    MentorshipRequestDTO respondToMentorshipRequest(Long requestId, boolean accept, Long mentorId);
    void rateMentor(CreateRatingDTO ratingDTO, Long jobSeekerId);
    MentorshipRequestDTO getMentorshipRequest(Long requestId, Long userId);
    void completeMentorship(Long resumeReviewId, Authentication auth);
    void closeMentorship(Long resumeReviewId, Authentication auth);
    List<MentorshipRequestDTO> getMentorshipRequestsOfMentor(Long mentorId, Long userId);
}
