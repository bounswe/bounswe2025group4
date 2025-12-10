package org.bounswe.jobboardbackend.badge.repository;

import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.badge.model.BadgeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    /**
     * Find all badges for a user.
     */
    List<Badge> findAllByUserId(Long userId);

    /**
     * Check if a user already has a specific badge type.
     * Used to prevent duplicate badge awards.
     */
    boolean existsByUserIdAndBadgeType(Long userId, BadgeType badgeType);
    
    /**
     * Count how many users have earned a specific badge type.
     */
    long countByBadgeType(BadgeType badgeType);
}

