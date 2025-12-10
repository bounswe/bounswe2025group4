package org.bounswe.jobboardbackend.mentorship.service;

import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.bounswe.jobboardbackend.mentorship.model.*;
import org.bounswe.jobboardbackend.mentorship.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MentorshipServiceImpl implements MentorshipService {

    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorReviewRepository mentorReviewRepository;
    private final UserRepository userRepository;
    private final ResumeReviewRepository resumeReviewRepository;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationRepository conversationRepository;
    private final Storage storage = StorageOptions.getDefaultInstance().getService();
    // private final NotificationService notificationService; // (Future implementation)


    @Value("${app.gcs.bucket}")
    private String gcsBucket;

    @Value("${app.gcs.public}")
    private boolean gcsPublic;

    @Value("${app.gcs.publicBaseUrl}")
    private String gcsPublicBaseUrl;

    @Value("${app.env}")
    private String appEnv;


    @Override
    @Transactional
    public ResumeFileResponseDTO uploadResumeFile(Long resumeReviewId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HandleException(ErrorCode.RESUME_FILE_REQUIRED, "Resume file is required");
        }

        String ct = file.getContentType();
        if (!"application/pdf".equalsIgnoreCase(ct)) {
            throw new HandleException(ErrorCode.RESUME_FILE_CONTENT_TYPE_INVALID, "Only PDF files are allowed");
        }

        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "Resume review not found"));

        if (review.getResumeUrl() != null) {
            String oldObject = extractObjectNameFromUrl(review.getResumeUrl());
            if (oldObject != null) {
                deleteFromGcs(oldObject);
            }
        }

        String objectName = buildObjectNameForResume(resumeReviewId, file.getOriginalFilename());
        String url;
        try {
            url = uploadToGcs(file.getBytes(), ct, objectName);
        } catch (IOException e) {
            throw new HandleException(ErrorCode.RESUME_FILE_UPLOAD_FAILED, "Upload failed", e);
        }

        LocalDateTime now = LocalDateTime.now();
        review.setResumeUrl(url);
        //review.setStatus(ReviewStatus.ACTIVE);
        review.setResumeUploadedAt(now);

        return ResumeFileResponseDTO.builder()
                .resumeReviewId(review.getId())
                .fileUrl(review.getResumeUrl())
                .reviewStatus(review.getStatus())
                .uploadedAt(review.getResumeUploadedAt())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public ResumeFileUrlDTO getResumeFileUrl(Long resumeReviewId) {
        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "Resume review not found"));

        if (review.getResumeUrl() == null) {
            throw new HandleException(ErrorCode.RESUME_FILE_NOT_FOUND, "Resume file not uploaded yet");
        }

        return ResumeFileUrlDTO.builder()
                .fileUrl(review.getResumeUrl())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public ResumeReviewDTO getResumeReview(Long resumeReviewId) {
        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "Resume review not found"));

        return ResumeReviewDTO.builder()
                .resumeReviewId(review.getId())
                .fileUrl(review.getResumeUrl())
                .reviewStatus(review.getStatus())
                .feedback(review.getFeedback())
                .build();
    }





    @Override
    @Transactional(readOnly = true)
    public List<MentorProfileDetailDTO> searchMentors() {

        List<MentorProfile> allMentors = mentorProfileRepository.findAllWithReviews();
        Stream<MentorProfile> stream = allMentors.stream();

        return stream
            .map(this::toMentorProfileDetailDTO)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorshipRequestDTO> getMentorshipRequestsOfMentor(Long mentorId, Long currentUserId) {

        if (!mentorId.equals(currentUserId)) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "User not allowed to access requests.");
        }

        List<MentorshipRequest> requests = mentorshipRequestRepository.findByMentorId(mentorId);

        return requests.stream()
                .map(this::toMentorshipRequestDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorshipDetailsDTO> getMentorshipDetailsForMentee(Long menteeId, Long currentUserId) {

        if (!menteeId.equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to view another user's requests.");
        }

        return mentorshipRequestRepository.findAllMentorshipDetailsByMenteeId(menteeId);
    }

    @Override
    @Transactional
    public MentorProfileDTO createMentorProfile(Long userId, CreateMentorProfileDTO createDTO) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found. Please check your username."));

        if (mentorProfileRepository.existsById(userId)) {
            throw new HandleException(ErrorCode.MENTOR_PROFILE_ALREADY_EXISTS, "Mentor Profile is already exists.");
        }


        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setUser(user);
        mentorProfile.setExpertise(createDTO.expertise());
        mentorProfile.setMaxMentees(createDTO.maxMentees());
        mentorProfile.setCurrentMentees(0);
        mentorProfile.setAverageRating(0.0f);
        mentorProfile.setReviewCount(0);

        MentorProfile savedProfile = mentorProfileRepository.save(mentorProfile);
        return toMentorProfileDTO(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorProfileDetailDTO getMentorProfile(Long userId) {
        MentorProfile profile = mentorProfileRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.MENTOR_PROFILE_NOT_FOUND, "Mentor profile not found"));
        return toMentorProfileDetailDTO(profile);
    }

    @Override
    @Transactional
    public MentorProfileDTO updateMentorProfile(Long userId, UpdateMentorProfileDTO updateDTO) {

        MentorProfile profile = mentorProfileRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.MENTOR_PROFILE_NOT_FOUND, "Mentor profile not found for user."));

        if (updateDTO.maxMentees() < profile.getCurrentMentees()) {
            throw new HandleException(ErrorCode.MENTEE_CAPACITY_CONFLICT, "Cannot set max mentees lower than current mentee count.");
        }

        profile.setExpertise(updateDTO.expertise());
        profile.setMaxMentees(updateDTO.maxMentees());

        MentorProfile updatedProfile = mentorProfileRepository.save(profile);
        return toMentorProfileDTO(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteMentorProfile(Long userId) {
        MentorProfile profile = mentorProfileRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.MENTOR_PROFILE_NOT_FOUND, "Mentor profile not found for user."));

        if (profile.getCurrentMentees() > 0) {
            throw new HandleException(ErrorCode.ACTIVE_MENTORSHIP_EXIST, "Please complete or close all active mentorship before deleting your profile.");
        }

        mentorProfileRepository.delete(profile);
    }

    @Override
    @Transactional
    public MentorshipRequestDTO createMentorshipRequest(CreateMentorshipRequestDTO requestDTO, Long jobSeekerId) {
        MentorProfile mentor = mentorProfileRepository.findById(requestDTO.mentorId())
                .orElseThrow(() -> new HandleException(ErrorCode.MENTOR_PROFILE_NOT_FOUND, "Mentor profile not found for user."));
        User jobSeeker = userRepository.findById(jobSeekerId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "Job seeker not found for user."));

        if (!mentor.canAccept()) {
            throw new HandleException(ErrorCode.MENTOR_UNAVAILABLE, "Mentor is unavailable");
        }

        MentorshipRequest newRequest = new MentorshipRequest();
        newRequest.setMentor(mentor);
        newRequest.setRequester(jobSeeker);
        newRequest.setStatus(RequestStatus.PENDING);
        newRequest.setCreatedAt(LocalDateTime.now());
        newRequest.setMotivation(requestDTO.motivation());
        MentorshipRequest savedRequest = mentorshipRequestRepository.save(newRequest);

        // Trigger notification
        // notificationService.notifyMentor(mentor.getUser(), "New mentorship request");  // (Future implementation)

        return toMentorshipRequestDTO(savedRequest);
    }

    @Override
    @Transactional
    public MentorshipRequestResponseDTO respondToMentorshipRequest(Long requestId, RespondToRequestDTO respondToRequestDTO, Long mentorId) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new HandleException(ErrorCode.REQUEST_NOT_FOUND, "Request not found"));

        if (!request.getMentor().getId().equals(mentorId)) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "Forbidden to access this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new HandleException(ErrorCode.REQUEST_ALREADY_PROCESSED, "This request has already been responded to.");
        }



        if (respondToRequestDTO.accept()) {

            request.accept(respondToRequestDTO.responseMessage());

            ResumeReview review = new ResumeReview();
            review.setJobSeeker(request.getRequester());
            review.setMentor(request.getMentor());
            review.setMentorshipRequest(request);
            review.setStatus(ReviewStatus.ACTIVE);
            review.setCreatedAt(LocalDateTime.now());
            ResumeReview savedReview = resumeReviewRepository.save(review);

            chatService.createConversationForReview(savedReview);

            MentorProfile mentor = request.getMentor();
            mentor.setCurrentMentees(mentor.getCurrentMentees() + 1);
            mentorProfileRepository.save(mentor);

            // Trigger notification
            // notificationService.notifyUser(request.getRequester(), "Your request was accepted!"); // (Future implementation)

        } else {
            request.decline(respondToRequestDTO.responseMessage());

            // Trigger notification
            // notificationService.notifyUser(request.getRequester(), "Your request was declined."); // (Future implementation)
        }

        MentorshipRequest updatedRequest = mentorshipRequestRepository.save(request);
        return toMentorshipRequestResponseDTO(updatedRequest);
    }

    @Override
    @Transactional
    public void rateMentor(CreateRatingDTO ratingDTO, Long jobSeekerId) {

        ResumeReview review = resumeReviewRepository.findById(ratingDTO.resumeReviewId())
                .orElseThrow(() -> new HandleException(ErrorCode.REVIEW_NOT_FOUND, "Review not found"));
        User jobSeeker = userRepository.findById(jobSeekerId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        MentorProfile mentor = review.getMentor();


        if (!review.getJobSeeker().getId().equals(jobSeekerId)) {
            throw new HandleException(ErrorCode.UNAUTHORIZED_REVIEW_ACCESS, "You can only rate reviews you participated in.");
        }

        if (review.getStatus() != ReviewStatus.COMPLETED) {
            throw new HandleException(ErrorCode.REVIEW_NOT_FOUND, "Cannot rate an incomplete review.");
        }

        MentorReview mentorReview = new MentorReview();
        mentorReview.setMentor(mentor);
        mentorReview.setReviewer(jobSeeker);
        mentorReview.setRating(ratingDTO.rating());
        mentorReview.setComment(ratingDTO.comment());
        mentorReview.setCreatedAt(LocalDateTime.now());
        mentorReviewRepository.save(mentorReview);

        mentor.recalcRating(ratingDTO.rating());
        mentorProfileRepository.save(mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorshipRequestResponseDTO getMentorshipRequest(Long requestId, Long userId) {



        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new HandleException(ErrorCode.REQUEST_NOT_FOUND, "Request not found"));

        Long mentorId = request.getMentor().getUser().getId();
        Long requesterId = request.getRequester().getId();

        if (!userId.equals(mentorId) && !userId.equals(requesterId)) {
            throw new HandleException(ErrorCode.UNAUTHORIZED_REVIEW_ACCESS, "User is not authorized to see this request");
        }
        return toMentorshipRequestResponseDTO(request);
    }

    @Override
    @Transactional
    public void completeMentorship(Long resumeReviewId, Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Long userId = userDetails.getId();
        validateReviewParticipant(resumeReviewId, userId);

        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "ResumeReview not found"));

        if (review.getStatus() != ReviewStatus.ACTIVE) {
            throw new HandleException(ErrorCode.MENTORSHIP_NOT_ACTIVE, "This mentorship is not active.");
        }

        review.setStatus(ReviewStatus.COMPLETED);
        review.getMentorshipRequest().setStatus(RequestStatus.COMPLETED);

        closeChatAndNotify(review, "This mentorship has been completed. You can now rate your mentor.");

        decrementMentorCount(review.getMentor());

        resumeReviewRepository.save(review);
        mentorshipRequestRepository.save(review.getMentorshipRequest());
    }

    @Override
    @Transactional
    public void closeMentorship(Long resumeReviewId, Authentication auth) {

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Long userId = userDetails.getId();
        validateReviewParticipant(resumeReviewId, userId);

        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "ResumeReview not found"));

        if (review.getStatus() != ReviewStatus.ACTIVE) {
            throw new HandleException(ErrorCode.MENTORSHIP_NOT_ACTIVE, "This mentorship is not active.");
        }

        review.setStatus(ReviewStatus.CLOSED);
        review.getMentorshipRequest().setStatus(RequestStatus.CLOSED);

        closeChatAndNotify(review, "This mentorship has been closed by one of the participants. No new messages can be sent.");

        decrementMentorCount(review.getMentor());

        resumeReviewRepository.save(review);
        mentorshipRequestRepository.save(review.getMentorshipRequest());
    }

    private MentorProfileDetailDTO toMentorProfileDetailDTO(MentorProfile mentor) {
        String username = (mentor.getUser() != null) ? mentor.getUser().getUsername() : "N/A";

        List<MentorReviewDTO> reviewDTOs = mentor.getMentorReviews().stream()
                .map(this::toMentorReviewDTO)
                .collect(Collectors.toList());

        return new MentorProfileDetailDTO(
                mentor.getId().toString(),
                username,
                mentor.getExpertise(),
                mentor.getCurrentMentees(),
                mentor.getMaxMentees(),
                mentor.getAverageRating(),
                mentor.getReviewCount(),
                reviewDTOs
        );
    }

    private MentorReviewDTO toMentorReviewDTO(MentorReview review) {
        String reviewerUsername = (review.getReviewer() != null) ? review.getReviewer().getUsername() : "Anonymous";
        return new MentorReviewDTO(
                review.getId(),
                reviewerUsername,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    private void closeChatAndNotify(ResumeReview review, String systemMessageText) {
        Conversation conversation = conversationRepository.findByResumeReviewId(review.getId())
                .orElse(null);

        if (conversation != null) {
            conversation.setClosedAt(LocalDateTime.now());
            conversationRepository.save(conversation);

            ChatMessageDTO systemMessage = new ChatMessageDTO(
                    "system-" + LocalDateTime.now(),
                    conversation.getId().toString(),
                    "system",
                    "System",
                    systemMessageText,
                    LocalDateTime.now()
            );

            messagingTemplate.convertAndSend(
                    "/topic/conversation/" + conversation.getId(),
                    systemMessage
            );
        }
    }

    private void decrementMentorCount(MentorProfile mentor) {
        int currentMentees = mentor.getCurrentMentees();
        if (currentMentees > 0) {
            mentor.setCurrentMentees(currentMentees - 1);
        }
        mentorProfileRepository.save(mentor);
    }

    private void validateReviewParticipant(Long resumeReviewId, Long userId) {
        ResumeReview review = resumeReviewRepository.findById(resumeReviewId)
                .orElseThrow(() -> new HandleException(ErrorCode.RESUME_REVIEW_NOT_FOUND, "ResumeReview not found"));

        Long jobSeekerId = review.getJobSeeker().getId();
        Long mentorUserId = review.getMentor().getUser().getId();

        if (!userId.equals(jobSeekerId) && !userId.equals(mentorUserId)) {
            throw new HandleException(ErrorCode.UNAUTHORIZED_REVIEW_ACCESS, "User is not authorized for this review");
        }
    }

    private MentorProfileDTO toMentorProfileDTO(MentorProfile mentor) {
        String username = (mentor.getUser() != null) ? mentor.getUser().getUsername() : "N/A";

        return new MentorProfileDTO(
                mentor.getId().toString(),
                username,
                mentor.getExpertise(),
                mentor.getCurrentMentees(),
                mentor.getMaxMentees(),
                mentor.getAverageRating(),
                mentor.getReviewCount()
        );
    }

    private MentorshipRequestDTO toMentorshipRequestDTO(MentorshipRequest request) {
        return new MentorshipRequestDTO(
                request.getId().toString(),
                request.getRequester().getId().toString(),
                request.getMentor().getId().toString(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getMotivation()
        );
    }

    private MentorshipRequestResponseDTO toMentorshipRequestResponseDTO(MentorshipRequest request) {
        return new MentorshipRequestResponseDTO(
                request.getId().toString(),
                request.getRequester().getId().toString(),
                request.getMentor().getId().toString(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getMotivation(),
                request.getResponseMessage()
        );
    }

    private String buildObjectNameForResume(Long resumeReviewId, String originalFilename) {
        String ext = ".pdf";
        if (originalFilename != null && originalFilename.contains(".")) {
            String candidate = originalFilename.substring(originalFilename.lastIndexOf('.'));
            if (candidate.equalsIgnoreCase(".pdf")) {
                ext = candidate;
            }
        }
        return appEnv + "/resumes/" + resumeReviewId + ext;
    }

    private String publicUrl(String objectName) {
        return gcsPublicBaseUrl + "/" + gcsBucket + "/" + objectName;
    }

    private String extractObjectNameFromUrl(String url) {
        String prefix = gcsPublicBaseUrl + "/" + gcsBucket + "/";
        if (url != null && url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        return null;
    }

    private String uploadToGcs(byte[] content, String contentType, String objectName) {
        BlobInfo info = BlobInfo.newBuilder(gcsBucket, objectName)
                .setContentType(contentType != null ? contentType : "application/pdf")
                .build();
        storage.create(info, content);

        if (gcsPublic) {
            return publicUrl(objectName);
        } else {
            URL signed = storage.signUrl(
                    BlobInfo.newBuilder(gcsBucket, objectName).build(),
                    15, TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.httpMethod(HttpMethod.GET)
            );
            return signed.toString();
        }
    }

    private void deleteFromGcs(String objectName) {
        if (objectName == null) return;
        try {
            storage.delete(gcsBucket, objectName);
        } catch (StorageException ignore) {
        }
    }

}
