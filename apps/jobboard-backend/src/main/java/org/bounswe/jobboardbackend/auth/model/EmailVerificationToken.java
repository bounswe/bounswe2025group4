package org.bounswe.jobboardbackend.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Entity
@Table(name = "email_verification_tokens", indexes = @Index(columnList = "token", unique = true))
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant expiresAt;

    public EmailVerificationToken(String token, Long id, Instant expires) {
        this.token = token;
        this.userId = id;
        this.expiresAt = expires;
    }
}
