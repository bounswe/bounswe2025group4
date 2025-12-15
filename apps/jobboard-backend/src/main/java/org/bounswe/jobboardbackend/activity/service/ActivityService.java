package org.bounswe.jobboardbackend.activity.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.activity.model.Activity;
import org.bounswe.jobboardbackend.activity.model.ActivityType;
import org.bounswe.jobboardbackend.activity.repository.ActivityRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public void logActivity(User actor, ActivityType type, Long entityId, String entityType) {
        Activity activity = Activity.builder()
                .actor(actor)
                .type(type)
                .entityId(entityId)
                .entityType(entityType)
                .build();
        activityRepository.save(activity);
    }

    public Page<Activity> getActivitiesByActor(Long actorId, Pageable pageable) {
        return activityRepository.findByActorIdOrderByCreatedAtDesc(actorId, pageable);
    }

    public void deleteActivitiesByUserId(Long userId) {
        activityRepository.deleteByActorId(userId);
    }
}
