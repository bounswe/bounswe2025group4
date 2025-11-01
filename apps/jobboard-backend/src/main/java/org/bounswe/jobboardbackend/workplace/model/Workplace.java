package org.bounswe.jobboardbackend.workplace.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table
public class Workplace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String companyName;

    @Column(length = 255)
    private String sector;

    @Column(length = 255)
    private String location;

    @Column(length = 500)
    private String shortDescription;

    @Column(length = 4000)
    private String detailedDescription;

    @Column(length = 255)
    private String website;

    @Column(length = 500)
    private String imageUrl;

    @ElementCollection(targetClass = EthicalPolicy.class, fetch = FetchType.LAZY)
    @CollectionTable(
        name = "workplace_ethical_tags",
        joinColumns = @JoinColumn(name = "workplace_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"workplace_id", "policy"})
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "policy", length = 64, nullable = false)
    @Builder.Default
    private Set<EthicalPolicy> ethicalTags = new HashSet<>();

    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
