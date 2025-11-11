package org.bounswe.jobboardbackend.profile;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.model.*;
import org.bounswe.jobboardbackend.profile.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class ProfileRepositoryTests {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testProfileRepositoryFindByUserId() {
        User user = User.builder()
                .username("testuser")
                .email("test@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Test bio")
                .build();
        profileRepository.save(profile);

        Optional<Profile> found = profileRepository.findByUserId(user.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getBio()).isEqualTo("Test bio");
    }

    @Test
    void testBadgeRepositoryFindAllByProfileId() {
        User user = User.builder()
                .username("badgeuser")
                .email("badge@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Badge test")
                .build();
        profile = profileRepository.save(profile);

        Badge badge = Badge.builder()
                .name("Achievement")
                .description("Test badge")
                .profile(profile)
                .build();
        badgeRepository.save(badge);

        List<Badge> badges = badgeRepository.findAllByProfileId(profile.getId());

        assertThat(badges).hasSize(1);
        assertThat(badges.getFirst().getName()).isEqualTo("Achievement");
    }

    @Test
    void testEducationRepositoryFindAllByProfileId() {
        User user = User.builder()
                .username("eduuser")
                .email("edu@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Education test")
                .build();
        profile = profileRepository.save(profile);

        Education education = Education.builder()
                .profile(profile)
                .school("Test University")
                .degree("Bachelor")
                .build();
        educationRepository.save(education);

        List<Education> educations = educationRepository.findAllByProfileId(profile.getId());

        assertThat(educations).hasSize(1);
        assertThat(educations.getFirst().getSchool()).isEqualTo("Test University");
    }

    @Test
    void testExperienceRepositoryFindAllByProfileId() {
        User user = User.builder()
                .username("expuser")
                .email("exp@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Experience test")
                .build();
        profile = profileRepository.save(profile);

        Experience experience = Experience.builder()
                .profile(profile)
                .company("Test Company")
                .position("Developer")
                .build();
        experienceRepository.save(experience);

        List<Experience> experiences = experienceRepository.findAllByProfileId(profile.getId());

        assertThat(experiences).hasSize(1);
        assertThat(experiences.getFirst().getCompany()).isEqualTo("Test Company");
    }

    @Test
    void testInterestRepositoryFindAllByProfileId() {
        User user = User.builder()
                .username("intuser")
                .email("int@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Interest test")
                .build();
        profile = profileRepository.save(profile);

        Interest interest = Interest.builder()
                .profile(profile)
                .name("Programming")
                .build();
        interestRepository.save(interest);

        List<Interest> interests = interestRepository.findAllByProfileId(profile.getId());

        assertThat(interests).hasSize(1);
        assertThat(interests.getFirst().getName()).isEqualTo("Programming");
    }

    @Test
    void testSkillRepositoryFindAllByProfileId() {
        User user = User.builder()
                .username("skilluser")
                .email("skill@test.com")
                .password("password")
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .bio("Skill test")
                .build();
        profile = profileRepository.save(profile);

        Skill skill = Skill.builder()
                .profile(profile)
                .name("Java")
                .build();
        skillRepository.save(skill);

        List<Skill> skills = skillRepository.findAllByProfileId(profile.getId());

        assertThat(skills).hasSize(1);
        assertThat(skills.getFirst().getName()).isEqualTo("Java");
    }
}
