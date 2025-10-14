package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findAllByProfileId(Long profileId);

    Optional<Experience> findByIdAndProfileId(Long experienceId, Long profileId);

    List<Experience> findAllByProfileUserId(Long userId);
}