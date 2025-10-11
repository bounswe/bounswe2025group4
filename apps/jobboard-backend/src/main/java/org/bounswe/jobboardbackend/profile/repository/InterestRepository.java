package org.bounswe.jobboardbackend.profile.repository;

import org.bounswe.jobboardbackend.profile.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    List<Interest> findAllByProfileId(Long profileId);

    Optional<Interest> findByIdAndProfileId(Long interestId, Long profileId);

    List<Interest> findAllByProfileUserId(Long userId);

    boolean existsByProfileIdAndNameIgnoreCase(Long profileId, String name);
}