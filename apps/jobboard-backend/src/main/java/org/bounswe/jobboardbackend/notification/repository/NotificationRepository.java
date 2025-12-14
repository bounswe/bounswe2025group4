package org.bounswe.jobboardbackend.notification.repository;

import org.bounswe.jobboardbackend.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    //List<Notification> findByUsernameAndReadFlagFalse(String username);
    //List<Notification> findByUsername(String username);
    @Query("""
        SELECT n FROM Notification n
        WHERE n.username = :username
        AND (n.readFlag = false OR n.updatedAt >= :oneDayAgo)
    """)
    List<Notification> findActiveNotificationsByUsername(String username, long oneDayAgo);


}