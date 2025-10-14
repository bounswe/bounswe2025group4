package org.bounswe.jobboardbackend.jobpost.model;

import org.bounswe.jobboardbackend.auth.model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    private boolean inclusiveOpportunity; // targeted toward candidates with disabilities

    private Integer minSalary;
    private Integer maxSalary;

    @Column(nullable = false)
    private String contact;


    @Column(nullable = false, updatable = false)
    private LocalDateTime postedDate;
}
