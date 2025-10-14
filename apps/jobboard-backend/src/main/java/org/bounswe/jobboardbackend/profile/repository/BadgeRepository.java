package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    // Profil bazlı tüm rozetler
    List<Badge> findAllByProfileId(Long profileId);

    // Kullanıcı bazlı tüm rozetler (Profile → User zinciri)
    List<Badge> findAllByProfileUserId(Long userId);

    // Aynı badge tekrar verilmesin
    boolean existsByProfileIdAndNameIgnoreCase(Long profileId, String name);
}