package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminJobPostService {

    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Transactional
    public void deleteJobPost(Long jobPostId, String reason) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_POST_NOT_FOUND, "Job post not found"));

        // Delete related job applications first (cascade)
        jobApplicationRepository.deleteAllByJobPostId(jobPostId);

        jobPostRepository.delete(jobPost);

        // TODO: Log deletion with reason for audit
    }
}
