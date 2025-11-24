package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProfileRepositoryTest {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUserId_whenProfileExists_returnsProfile() {
        User user = User.builder()
                .email("test@example.com")
                .username("testuser")
                .password("password")
                .role(Role.ROLE_JOBSEEKER)
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .firstName("John")
                .lastName("Doe")
                .bio("Test bio")
                .build();
        profileRepository.save(profile);

        Optional<Profile> found = profileRepository.findByUserId(user.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("John");
        assertThat(found.get().getLastName()).isEqualTo("Doe");
    }
}
