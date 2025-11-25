package org.bounswe.jobboardbackend.jobapplication.repository;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class JobApplicationRepositoryTest {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private WorkplaceRepository workplaceRepository;

    // Shared entities for tests
    private User jobSeeker;
    private User otherSeeker;
    private JobPost jobPost;
    private JobPost otherJobPost;
    private Workplace workplace;

    @BeforeEach
    void setUp() {
        // 1. Clean up database to ensure isolation
        jobApplicationRepository.deleteAll();
        jobPostRepository.deleteAll();
        workplaceRepository.deleteAll();
        userRepository.deleteAll();

        // 2. Create Employer
        // FIXED: Password length increased to meet validation requirements (min 8 chars)
        User employer = User.builder()
                .username("employer_test")
                .email("emp@test.com")
                .role(Role.ROLE_EMPLOYER)
                .password("securePassword123")
                .emailVerified(true)
                .build();
        userRepository.save(employer);

        // 3. Create Job Seekers
        // FIXED: Password length increased
        jobSeeker = User.builder()
                .username("seeker_main")
                .email("seeker@test.com")
                .role(Role.ROLE_JOBSEEKER)
                .password("securePassword123")
                .emailVerified(true)
                .build();
        userRepository.save(jobSeeker);

        // FIXED: Password length increased
        otherSeeker = User.builder()
                .username("seeker_other")
                .email("other@test.com")
                .role(Role.ROLE_JOBSEEKER)
                .password("securePassword123")
                .emailVerified(true)
                .build();
        userRepository.save(otherSeeker);

        // 4. Create Workplace
        workplace = Workplace.builder()
                .companyName("Tech Corp")
                .sector("IT")
                .location("New York")
                .shortDescription("Tech Desc")
                .detailedDescription("Detailed Tech Desc")
                .build();
        workplaceRepository.save(workplace);

        // 5. Create Job Posts
        jobPost = JobPost.builder()
                .employer(employer)
                .workplace(workplace)
                .title("Java Developer")
                .description("Desc")
                .minSalary(50000)
                .maxSalary(80000)
                .contact("hr@tech.com")
                .postedDate(LocalDateTime.now())
                .inclusiveOpportunity(false) // Ensure non-null fields are set
                .remote(false)
                .nonProfit(false)
                .build();
        jobPostRepository.save(jobPost);

        otherJobPost = JobPost.builder()
                .employer(employer)
                .workplace(workplace)
                .title("Python Developer")
                .description("Desc")
                .contact("hr@tech.com")
                .postedDate(LocalDateTime.now())
                .inclusiveOpportunity(false)
                .remote(true)
                .nonProfit(false)
                .build();
        jobPostRepository.save(otherJobPost);
    }

    @Test
    @DisplayName("Should find applications by Job Seeker ID")
    void findByJobSeekerId_ShouldReturnList() {
        // Arrange: Create an application for the main seeker
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();
        jobApplicationRepository.save(application);

        // Act
        List<JobApplication> results = jobApplicationRepository.findByJobSeekerId(jobSeeker.getId());

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getJobSeeker().getUsername()).isEqualTo("seeker_main");
    }

    @Test
    @DisplayName("Should find applications by Job Post ID")
    void findByJobPostId_ShouldReturnList() {
        // Arrange: Two different seekers apply to the SAME job
        JobApplication app1 = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();

        JobApplication app2 = JobApplication.builder()
                .jobSeeker(otherSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();

        jobApplicationRepository.saveAll(List.of(app1, app2));

        // Act
        List<JobApplication> results = jobApplicationRepository.findByJobPostId(jobPost.getId());

        // Assert
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should find applications by Workplace ID (Nested Property)")
    void findByJobPost_Workplace_Id_ShouldReturnList() {
        // Arrange: Create application for a job belonging to the created workplace
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost) // This job is linked to 'workplace'
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();
        jobApplicationRepository.save(application);

        // Act
        List<JobApplication> results = jobApplicationRepository.findByJobPost_Workplace_Id(workplace.getId());

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getJobPost().getWorkplace().getCompanyName()).isEqualTo("Tech Corp");
    }

    @Test
    @DisplayName("Should return TRUE if user has already applied to the job")
    void existsByJobSeekerIdAndJobPostId_True() {
        // Arrange
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();
        jobApplicationRepository.save(application);

        // Act
        boolean exists = jobApplicationRepository.existsByJobSeekerIdAndJobPostId(jobSeeker.getId(), jobPost.getId());

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return FALSE if user has NOT applied to the job")
    void existsByJobSeekerIdAndJobPostId_False() {
        // Arrange: User applied to 'jobPost', but we check for 'otherJobPost'
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();
        jobApplicationRepository.save(application);

        // Act
        boolean exists = jobApplicationRepository.existsByJobSeekerIdAndJobPostId(jobSeeker.getId(), otherJobPost.getId());

        // Assert
        assertThat(exists).isFalse();
    }
}