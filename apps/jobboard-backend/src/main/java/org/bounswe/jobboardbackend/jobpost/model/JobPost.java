package org.bounswe.jobboardbackend.jobpost.model;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workplace_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Workplace workplace;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    private boolean remote;

    private boolean inclusiveOpportunity; // targeted toward candidates with disabilities

    private boolean nonProfit; // indicates if this is a non-profit/volunteer position

    private Integer minSalary;
    private Integer maxSalary;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false, updatable = false)
    private LocalDateTime postedDate;
}
