package org.bounswe.backend.job.entity;

import org.bounswe.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_posts")
public class JobPost {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id")
    private User employer;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String company;

    private String location;

    private boolean remote;

    private String ethicalTags; // comma-separated for now (e.g. "open-source,remote-first")

    private Integer minSalary;

    private Integer maxSalary;
    
    private String contact;
}
