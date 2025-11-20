package org.bounswe.jobboardbackend.jobpost.repository;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
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
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY) // Uses H2 in-memory DB
class JobPostRepositoryTest {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkplaceRepository workplaceRepository;

    // Shared test entities
    private User testEmployer;

    @BeforeEach
    void setUp() {
        // 1. Clean up database
        jobPostRepository.deleteAll();
        workplaceRepository.deleteAll();
        userRepository.deleteAll();

        // 2. Create Employer
        testEmployer = User.builder()
                .username("test_employer")
                .email("employer@example.com")
                .password("securePass123")
                .role(Role.ROLE_EMPLOYER)
                .emailVerified(true)
                .build();
        userRepository.save(testEmployer);

        // 3. Create Workplaces (Fixed Builder fields based on your Entity)
        // Location: New York
        Workplace techCorpWorkplace = Workplace.builder()
                .companyName("Tech Corp")
                .sector("IT")
                .location("New York")
                .shortDescription("Leading tech firm")
                .detailedDescription("Detailed description about Tech Corp")
                .build();
        workplaceRepository.save(techCorpWorkplace);

        // Location: London
        Workplace softSolWorkplace = Workplace.builder()
                .companyName("Soft Solutions")
                .sector("Software")
                .location("London")
                .shortDescription("Software solutions provider")
                .detailedDescription("Detailed description about Soft Solutions")
                .build();
        workplaceRepository.save(softSolWorkplace);

        // 4. Create Job Posts

        // Job 1: Starts with "Senior", Remote, Inclusive
        createJobPost("Senior Java Engineer", techCorpWorkplace, 90000, 120000, true, true);

        // Job 2: Starts with "Junior", On-site, Not Inclusive
        createJobPost("Junior Java Developer", softSolWorkplace, 40000, 60000, false, false);

        // Job 3: Starts with "Marketing", On-site, Inclusive
        createJobPost("Marketing Manager", techCorpWorkplace, 50000, 70000, false, true);
    }

    private void createJobPost(String title, Workplace wp, int min, int max, boolean remote, boolean inclusive) {
        JobPost job = JobPost.builder()
                .title(title)
                .description("Job description for " + title)
                .employer(testEmployer)
                .workplace(wp)
                .minSalary(min)
                .maxSalary(max)
                .remote(remote)
                .inclusiveOpportunity(inclusive)
                .contact("hr@example.com")
                .postedDate(LocalDateTime.now())
                .build();
        jobPostRepository.save(job);
    }

    // --- FILTERING TESTS ---

    @Test
    @DisplayName("Should return all job posts when no filters are applied")
    void findFiltered_NoFilter_ShouldReturnAll() {
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, null, null, null, null, null, null, null
        );
        assertThat(results).hasSize(3);
    }

    @Test
    @DisplayName("Should filter job posts by title prefix (Case Insensitive)")
    void findFiltered_ByTitle() {
        // FIXED: Search for "Senior" instead of "Java" because the query uses 'STARTS WITH' logic.
        // "Senior Java Engineer" starts with "Senior".
        List<JobPost> results = jobPostRepository.findFiltered(
                "Senior", null, null, null, null, null, null, null, null
        );

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getTitle()).isEqualTo("Senior Java Engineer");
    }

    @Test
    @DisplayName("Should filter job posts by workplace location prefix")
    void findFiltered_ByLocation() {
        // Search for "London"
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, "London", null, null, null, null, null, null
        );

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getWorkplace().getCompanyName()).isEqualTo("Soft Solutions");
    }

    @Test
    @DisplayName("Should filter job posts by minimum salary")
    void findFiltered_ByMinSalary() {
        // Search for jobs paying at least 80,000
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, null, null, 80000, null, null, null, null
        );

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getTitle()).isEqualTo("Senior Java Engineer");
    }

    @Test
    @DisplayName("Should filter job posts by remote availability")
    void findFiltered_ByRemote() {
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, null, null, null, null, true, null, null
        );

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().isRemote()).isTrue();
    }

    @Test
    @DisplayName("Should filter job posts by inclusivity")
    void findFiltered_ByInclusive() {
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, null, null, null, null, null, true, null
        );

        // Senior Java Engineer and Marketing Manager are inclusive
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should handle combined filters correctly")
    void findFiltered_CombinedFilters() {
        // Search for "Inclusive" jobs in "New York"
        List<JobPost> results = jobPostRepository.findFiltered(
                null, null, "New York", null, null, null, null, true, null
        );

        assertThat(results).hasSize(2);
    }
}