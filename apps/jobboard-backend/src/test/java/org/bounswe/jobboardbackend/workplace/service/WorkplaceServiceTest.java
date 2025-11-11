package org.bounswe.jobboardbackend.workplace.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceCreateRequest;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceDetailResponse;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceRatingResponse;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewPolicyRatingRepository;
import org.bounswe.jobboardbackend.workplace.repository.ReviewRepository;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkplaceServiceTest {

    @Mock private WorkplaceRepository workplaceRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private ReviewPolicyRatingRepository reviewPolicyRatingRepository;
    @Mock private EmployerWorkplaceRepository employerWorkplaceRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private WorkplaceService workplaceService;

    private Workplace wp;
    private User creator;

    @BeforeEach
    void setUp() {
        creator = User.builder().id(100L).email("creator@test.com").username("creator").build();

        wp = Workplace.builder()
                .id(42L)
                .companyName("Ethica Corp")
                .sector("Tech")
                .location("Istanbul")
                .shortDescription("Short")
                .detailedDescription("Detailed")
                .ethicalTags(EnumSet.of(
                        EthicalPolicy.SALARY_TRANSPARENCY,
                        EthicalPolicy.EQUAL_PAY_POLICY
                ))
                .website("https://ethica.example")
                .imageUrl(null)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .reviewCount(0L)
                .build();
    }

    @Test
    void create_whenValidRequest_returnsDetailResponse() {
        WorkplaceCreateRequest req = WorkplaceCreateRequest.builder()
                .companyName("Ethica Corp")
                .sector("Tech")
                .location("Istanbul")
                .shortDescription("Short")
                .detailedDescription("Detailed")
                .ethicalTags(List.of(
                        EthicalPolicy.SALARY_TRANSPARENCY.name(),
                        EthicalPolicy.EQUAL_PAY_POLICY.name()
                ))
                .website("https://ethica.example")
                .build();

        when(workplaceRepository.save(any(Workplace.class)))
                .thenAnswer(inv -> {
                    Workplace saved = inv.getArgument(0);
                    saved.setId(42L);
                    return saved;
                });

        WorkplaceDetailResponse res = workplaceService.create(req, creator);

        assertThat(res).isNotNull();
        assertThat(res.getId()).isEqualTo(42L);
        assertThat(res.getCompanyName()).isEqualTo("Ethica Corp");
        assertThat(res.getEthicalTags())
                .containsExactlyInAnyOrder(
                        EthicalPolicy.SALARY_TRANSPARENCY.name(),
                        EthicalPolicy.EQUAL_PAY_POLICY.name()
                );

        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    void getRating_returnsEthicalAverages_andOverall() {
        Long workplaceId = 42L;

        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(wp));

        when(reviewPolicyRatingRepository.averageByPolicyForWorkplace(workplaceId))
                .thenReturn(List.of(
                        new Object[]{ EthicalPolicy.SALARY_TRANSPARENCY.name(), 4.2d },
                        new Object[]{ EthicalPolicy.EQUAL_PAY_POLICY.name(), 3.6d }
                ));

        WorkplaceRatingResponse res = workplaceService.getRating(workplaceId);

        assertThat(res).isNotNull();
        assertThat(res.getEthicalAverages())
                .containsEntry(EthicalPolicy.SALARY_TRANSPARENCY.name(), 4.2d)
                .containsEntry(EthicalPolicy.EQUAL_PAY_POLICY.name(), 3.6d);

        if (res.getOverallAvg() != null) {
            assertThat(res.getOverallAvg()).isBetween(1.0, 5.0);
        }

        verify(reviewPolicyRatingRepository).averageByPolicyForWorkplace(workplaceId);
        verify(workplaceRepository).findById(workplaceId);
    }
}