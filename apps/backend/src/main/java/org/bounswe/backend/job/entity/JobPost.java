package org.bounswe.backend.job.entity;

import org.bounswe.backend.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_posts")
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User employer;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    private boolean remote;

    private String ethicalTags; // comma-separated for now (e.g. "open-source,remote-first")

    private Integer minSalary;
    private Integer maxSalary;

    @Column(nullable = false)
    private String contact;
}
