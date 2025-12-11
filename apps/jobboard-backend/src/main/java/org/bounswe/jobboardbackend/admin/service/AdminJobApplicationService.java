package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminJobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    @Transactional
    public void deleteJobApplication(Long applicationId, String reason) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(
                        () -> new HandleException(ErrorCode.JOB_APPLICATION_NOT_FOUND, "Job application not found"));

        jobApplicationRepository.delete(application);
    }
}
