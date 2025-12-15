package org.bounswe.jobboardbackend.activity.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.bounswe.jobboardbackend.auth.model.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Represents a user activity in the system")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the activity", example = "1")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @Schema(description = "The user who performed the activity")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Type of the activity", example = "REGISTER")
    private ActivityType type;

    @Column(name = "entity_id")
    @Schema(description = "ID of the entity related to the activity", example = "101")
    private Long entityId;

    @Column(name = "entity_type")
    @Schema(description = "Type of the entity regarding the activity", example = "User")
    private String entityType;

    @CreationTimestamp
    @Column(updatable = false)
    @Schema(description = "Timestamp when the activity was created")
    private LocalDateTime createdAt;
}
