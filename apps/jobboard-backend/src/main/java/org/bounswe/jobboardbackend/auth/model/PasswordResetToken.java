package org.bounswe.jobboardbackend.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens", indexes = @Index(columnList = "token", unique = true))
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    String token;
    @Column(nullable = false)
    Long userId;
    @Column(nullable = false)
    Instant expiresAt;
    Instant usedAt;


}
