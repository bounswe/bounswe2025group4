package org.bounswe.backend.profile.repository;

import org.bounswe.backend.profile.entity.Profile;
import org.bounswe.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUser(User user);
    Optional<Profile> findByUserId(Long userId);
}
