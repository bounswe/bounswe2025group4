package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    // Profil var mı yok mu hızlı kontrol
    boolean existsByUserId(Long userId);
}