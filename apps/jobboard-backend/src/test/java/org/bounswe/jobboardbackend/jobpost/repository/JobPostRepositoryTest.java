package org.bounswe.jobboardbackend.jobpost.repository;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class JobPostRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JobPostRepository jobPostRepository;

    private User employer;
    private Workplace workplace;
    private JobPost jobPost;

    @BeforeEach
    void setup() {
        employer = User.builder()
                .username("employer1")
                .email("emp@test.com")
                .password("pass123")
                .role(Role.ROLE_EMPLOYER)
                .emailVerified(true)
                .build();
        entityManager.persist(employer);

        workplace = Workplace.builder()
                .companyName("Tech Corp")
                .sector("IT")
                .location("Istanbul")
                .shortDescription("Tech company")
                .detailedDescription("A technology company")
                .build();
        entityManager.persist(workplace);

        jobPost = JobPost.builder()
                .employer(employer)
                .workplace(workplace)
                .title("Developer")
                .description("Java developer needed")
                .remote(true)
                .inclusiveOpportunity(false)
                .minSalary(50000)
                .maxSalary(80000)
                .contact("hr@techcorp.com")
                .postedDate(LocalDateTime.now())
                .build();
        entityManager.persist(jobPost);
        entityManager.flush();
    }

    @Test
    void testSaveJobPost() {
        JobPost newJob = JobPost.builder()
                .employer(employer)
                .workplace(workplace)
                .title("Tester")
                .description("QA tester")
                .remote(false)
                .inclusiveOpportunity(true)
                .minSalary(40000)
                .maxSalary(60000)
                .contact("hr@test.com")
                .postedDate(LocalDateTime.now())
                .build();

        JobPost saved = jobPostRepository.save(newJob);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Tester");
    }

    @Test
    void testFindById() {
        Optional<JobPost> found = jobPostRepository.findById(jobPost.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Developer");
    }

    @Test
    void testFindByIdNotFound() {
        Optional<JobPost> found = jobPostRepository.findById(9999L);

        assertThat(found).isEmpty();
    }

    @Test
    void testFindByEmployerId() {
        List<JobPost> jobs = jobPostRepository.findByEmployerId(employer.getId());

        assertThat(jobs).hasSize(1);
        assertThat(jobs.getFirst().getTitle()).isEqualTo("Developer");
    }

    @Test
    void testFindByWorkplaceId() {
        List<JobPost> jobs = jobPostRepository.findByWorkplaceId(workplace.getId());

        assertThat(jobs).hasSize(1);
        assertThat(jobs.getFirst().getWorkplace().getCompanyName()).isEqualTo("Tech Corp");
    }

    @Test
    void testFilterByTitle() {
        List<JobPost> jobs = jobPostRepository.findFiltered(
                "Developer", null, null, null, null, null, null, null
        );

        assertThat(jobs).hasSize(1);
        assertThat(jobs.getFirst().getTitle()).isEqualTo("Developer");
    }

    @Test
    void testFilterByRemote() {
        List<JobPost> jobs = jobPostRepository.findFiltered(
                null, null, null, null, null, null, true, null
        );

        assertThat(jobs).hasSize(1);
        assertThat(jobs.getFirst().isRemote()).isTrue();
    }

    @Test
    void testUpdateJobPost() {
        jobPost.setTitle("Senior Developer");
        jobPost.setMinSalary(70000);

        jobPostRepository.save(jobPost);
        entityManager.flush();

        JobPost updated = jobPostRepository.findById(jobPost.getId()).orElseThrow();
        assertThat(updated.getTitle()).isEqualTo("Senior Developer");
        assertThat(updated.getMinSalary()).isEqualTo(70000);
    }

    @Test
    void testDeleteJobPost() {
        Long id = jobPost.getId();

        jobPostRepository.delete(jobPost);
        entityManager.flush();

        Optional<JobPost> deleted = jobPostRepository.findById(id);
        assertThat(deleted).isEmpty();
    }
}
