package org.bounswe.jobboardbackend.badge.model;

import lombok.Getter;

/**
 * Defines all available badge types in the system.
 * Each badge has a display name, description, criteria, and threshold.
 * Icons are handled by frontend/mobile.
 */
@Getter
public enum BadgeType {

    // ==================== FORUM POST BADGES ====================
    
    FIRST_VOICE(
        "First Voice",
        "Published your first forum post",
        "Create your first forum post",
        1
    ),
    COMMUNITY_PILLAR(
        "Community Pillar",
        "A foundational voice with 25 posts",
        "Create 25 forum posts",
        25
    ),

    // ==================== FORUM COMMENT BADGES ====================
    
    CONVERSATION_STARTER(
        "Conversation Starter",
        "Made your first comment",
        "Comment on a forum post",
        1
    ),
    DISCUSSION_DRIVER(
        "Discussion Driver",
        "Driving discussions with 50 comments",
        "Make 50 comments",
        50
    ),

    // ==================== UPVOTE BADGES ====================
    
    HELPFUL(
        "Helpful",
        "Your comments helped 10 people",
        "Receive 10 upvotes on your comments",
        10
    ),
    VALUABLE_CONTRIBUTOR(
        "Valuable Contributor",
        "Received 50 upvotes for helpful content",
        "Receive 50 upvotes on your comments",
        50
    ),

    // ==================== JOB POST BADGES (Employer) ====================
    
    FIRST_LISTING(
        "First Listing",
        "Posted your first job listing",
        "Create your first job post",
        1
    ),
    HIRING_MACHINE(
        "Hiring Machine",
        "Posted 15 job listings",
        "Create 15 job posts",
        15
    ),

    // ==================== JOB APPLICATION BADGES (Job Seeker) ====================
    
    FIRST_STEP(
        "First Step",
        "Submitted your first job application",
        "Apply to your first job",
        1
    ),
    PERSISTENT(
        "Persistent",
        "Submitted 15 job applications",
        "Apply to 15 jobs",
        15
    ),

    // ==================== JOB ACCEPTANCE BADGES (Job Seeker) ====================
    
    HIRED(
        "Hired!",
        "Got your first job offer",
        "Get accepted for a job",
        1
    ),
    CAREER_STAR(
        "Career Star",
        "Received 5 job offers",
        "Get accepted for 5 jobs",
        5
    ),

    // ==================== MENTOR BADGES ====================
    
    GUIDE(
        "Guide",
        "Created your mentor profile",
        "Create a mentor profile",
        1
    ),
    FIRST_MENTEE(
        "First Mentee",
        "Accepted your first mentee",
        "Accept your first mentorship request",
        1
    ),
    DEDICATED_MENTOR(
        "Dedicated Mentor",
        "Accepted 5 mentees",
        "Accept 5 mentorship requests",
        5
    ),

    // ==================== MENTEE BADGES ====================
    
    SEEKING_GUIDANCE(
        "Seeking Guidance",
        "Requested your first mentorship",
        "Send your first mentorship request",
        1
    ),
    MENTORED(
        "Mentored",
        "Got accepted by a mentor",
        "Get accepted by a mentor",
        1
    ),
    FEEDBACK_GIVER(
        "Feedback Giver",
        "Left your first mentor review",
        "Review a mentor",
        1
    );

    private final String displayName;
    private final String description;
    private final String criteria;
    private final int threshold;

    BadgeType(String displayName, String description, String criteria, int threshold) {
        this.displayName = displayName;
        this.description = description;
        this.criteria = criteria;
        this.threshold = threshold;
    }
}

