package org.bounswe.jobboardbackend.notification.repository;

import org.bounswe.jobboardbackend.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    //List<Notification> findByUsernameAndReadFlagFalse(String username);
    List<Notification> findByUsername(String username);
}
