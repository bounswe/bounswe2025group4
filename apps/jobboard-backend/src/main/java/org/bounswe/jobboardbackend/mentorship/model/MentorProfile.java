package org.bounswe.jobboardbackend.mentorship.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.bounswe.jobboardbackend.auth.model.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class MentorProfile {
    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    private List<String> expertise;
    @NotNull
    private int maxMentees;
    private int currentMentees;
    private float averageRating;
    private int reviewCount;

    @OneToMany(mappedBy = "mentor", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<MentorReview> mentorReviews = new ArrayList<>();

    @OneToMany(
            mappedBy = "mentor",
            fetch = FetchType.LAZY,
            cascade = CascadeType.REMOVE,
            orphanRemoval = true
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<MentorshipRequest> mentorshipRequests = new ArrayList<>();

    @OneToMany(
            mappedBy = "mentor",
            fetch = FetchType.LAZY,
            cascade = CascadeType.REMOVE,
            orphanRemoval = true
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ResumeReview> resumeReviews = new ArrayList<>();

    public boolean canAccept() {
        return currentMentees < maxMentees;
    }

    public void recalcRating(float newRating) {
        this.averageRating = ((this.averageRating * this.reviewCount) + newRating) / (this.reviewCount + 1);
        this.reviewCount++;
    }



}
