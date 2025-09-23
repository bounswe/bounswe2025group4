package org.bounswe.backend.mentor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.user.entity.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
@Table(name = "mentor_profiles")
public class MentorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // List of expertise areas
    @ElementCollection
    @CollectionTable(name = "mentor_expertise", joinColumns = @JoinColumn(name = "mentor_profile_id"))
    @Column(name = "expertise")
    private List<String> expertise = new ArrayList<>();

    // Maximum number of mentees this mentor wants to have
    private Integer capacity;

    // Current number of active mentorships
    private Integer currentMenteeCount;

    // Average rating from 1-5
    private Double averageRating;

    // Total number of reviews received
    private Integer reviewCount;

    // Whether the mentor is currently accepting new mentorship requests
    private Boolean isAvailable;
}
