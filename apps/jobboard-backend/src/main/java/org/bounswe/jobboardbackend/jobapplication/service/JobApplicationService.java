package org.bounswe.jobboardbackend.jobapplication.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.CvUploadResponse;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.storage.*;

import java.io.IOException;
import java.net.URL;
import java.util.concurrent.TimeUnit;
import java.util.Arrays;
import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;

    // === GCS config ===
    @Value("${app.gcs.bucket:bounswe-jobboard}")
    private String gcsBucket;

    @Value("${app.gcs.public:true}")
    private boolean gcsPublic;

    @Value("${app.gcs.publicBaseUrl:https://storage.googleapis.com}")
    private String gcsPublicBaseUrl;

    @Value("${app.env}")
    private String appEnv;

    // Google Cloud Storage client
    private final Storage storage = StorageOptions.getDefaultInstance().getService();

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 UserRepository userRepository,
                                 JobPostRepository jobPostRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobPostRepository = jobPostRepository;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getByJobSeekerId(Long jobSeekerId) {
        return applicationRepository.findByJobSeekerId(jobSeekerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getByJobPostId(Long jobPostId) {
        return applicationRepository.findByJobPostId(jobPostId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getById(Long id) {
        return applicationRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + id + " not found"));
    }

    @Transactional
    @PreAuthorize( "hasRole('ROLE_JOBSEEKER')")
    public JobApplicationResponse create(CreateJobApplicationRequest dto) {
        User jobSeeker = getCurrentUser();



        // Get job post
        JobPost jobPost = jobPostRepository.findById(dto.getJobPostId())
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_POST_NOT_FOUND, "Job post with ID " + dto.getJobPostId() + " not found"));

        // Create application
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .specialNeeds(dto.getSpecialNeeds())
                .coverLetter(dto.getCoverLetter())
                .appliedDate(LocalDateTime.now())
                .build();

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse approve(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can approve
        User employer = getCurrentUser();

        if (!application.getJobPost().getEmployer().getId().equals(employer.getId())) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "Only the employer who posted the job can approve applications");
        }

        // Update status
        application.setStatus(JobApplicationStatus.APPROVED);
        if (feedback != null && !feedback.isEmpty()) {
            application.setFeedback(feedback);
        }

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse reject(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can reject
        User employer = getCurrentUser();

        if (!application.getJobPost().getEmployer().getId().equals(employer.getId())) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "Only the employer who posted the job can reject applications");
        }

        // Update status
        application.setStatus(JobApplicationStatus.REJECTED);
        if (feedback != null && !feedback.isEmpty()) {
            application.setFeedback(feedback);
        }

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public void delete(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the applicant can delete their own application
        User user = getCurrentUser();

        if (!application.getJobSeeker().getId().equals(user.getId())) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "Only the applicant can delete their own application");
        }

        applicationRepository.delete(application);
    }

    private JobApplicationResponse toResponseDto(JobApplication application) {
        JobPost jobPost = application.getJobPost();
        User jobSeeker = application.getJobSeeker();

        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobSeekerId(jobSeeker.getId())
                .applicantName(jobSeeker.getUsername())
                .jobPostId(jobPost.getId())
                .title(jobPost.getTitle())
                .company(jobPost.getCompany())
                .status(application.getStatus())
                .specialNeeds(application.getSpecialNeeds())
                .feedback(application.getFeedback())
                .cvUrl(application.getCvUrl())
                .coverLetter(application.getCoverLetter())
                .appliedDate(application.getAppliedDate())
                .build();
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "Authenticated user not found in the system"));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "No authentication context found");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new HandleException(ErrorCode.INVALID_CREDENTIALS, "Invalid authentication context");
    }

    // =========================
    // CV / RESUME (GCS integration)
    // =========================

    private String buildCvObjectName(Long applicationId, String originalFilename) {
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".pdf";
        // Add timestamp to avoid cache issues when updating CV
        long timestamp = System.currentTimeMillis();
        return appEnv + "/" + "cvs/" + "application_" + applicationId + "_" + timestamp + ext;
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
                .setContentType(contentType != null ? contentType : "application/octet-stream")
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

    private boolean isValidCvContentType(String contentType) {
        if (contentType == null) return false;
        List<String> allowedTypes = Arrays.asList(
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        return allowedTypes.contains(contentType);
    }

    @Transactional
    public CvUploadResponse uploadCv(Long applicationId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "CV file is required");
        }

        String ct = file.getContentType();
        if (!isValidCvContentType(ct)) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "Only PDF, DOC, and DOCX files are allowed");
        }

        // File size limit: 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new HandleException(ErrorCode.BAD_REQUEST, "CV file too large (max 5MB)");
        }

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + applicationId + " not found"));

        // Check authorization: only the applicant can upload their CV
        User currentUser = getCurrentUser();
        if (!application.getJobSeeker().getId().equals(currentUser.getId())) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "Only the applicant can upload CV for their application");
        }

        // Delete old CV if exists
        if (application.getCvUrl() != null) {
            String oldObject = extractObjectNameFromUrl(application.getCvUrl());
            if (oldObject != null) {
                deleteFromGcs(oldObject);
            }
        }

        String objectName = buildCvObjectName(applicationId, file.getOriginalFilename());
        String url;
        try {
            url = uploadToGcs(file.getBytes(), ct, objectName);
        } catch (IOException e) {
            throw new HandleException(ErrorCode.INTERNAL_ERROR, "CV upload failed");
        }

        application.setCvUrl(url);
        applicationRepository.save(application);

        return CvUploadResponse.builder()
                .cvUrl(url)
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public String getCvUrl(Long applicationId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + applicationId + " not found"));

        // Check authorization: only the applicant or the employer can view CV
        User currentUser = getCurrentUser();
        boolean isApplicant = application.getJobSeeker().getId().equals(currentUser.getId());
        boolean isEmployer = application.getJobPost().getEmployer().getId().equals(currentUser.getId());

        if (!isApplicant && !isEmployer) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "You are not authorized to view this CV");
        }

        if (application.getCvUrl() == null) {
            throw new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "No CV uploaded for this application");
        }

        return application.getCvUrl();
    }

    @Transactional
    public void deleteCv(Long applicationId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Application with ID " + applicationId + " not found"));

        // Check authorization: only the applicant can delete their CV
        User currentUser = getCurrentUser();
        if (!application.getJobSeeker().getId().equals(currentUser.getId())) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "Only the applicant can delete their CV");
        }

        if (application.getCvUrl() != null) {
            String objectName = extractObjectNameFromUrl(application.getCvUrl());
            if (objectName != null) {
                deleteFromGcs(objectName);
            }
            application.setCvUrl(null);
            applicationRepository.save(application);
        }
    }
}
