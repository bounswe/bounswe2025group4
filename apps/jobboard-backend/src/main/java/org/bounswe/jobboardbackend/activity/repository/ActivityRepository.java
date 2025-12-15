package org.bounswe.jobboardbackend.activity.repository;

import org.bounswe.jobboardbackend.activity.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    Page<Activity> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    void deleteByActorId(Long actorId);
}
