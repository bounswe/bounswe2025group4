package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findAllByProfileId(Long profileId);

    Optional<Skill> findByIdAndProfileId(Long skillId, Long profileId);

    List<Skill> findAllByProfileUserId(Long userId);

    // Aynı isimden birden fazla varsa seviyeye göre kontrol etmek için
    boolean existsByProfileIdAndNameIgnoreCase(Long profileId, String name);
}