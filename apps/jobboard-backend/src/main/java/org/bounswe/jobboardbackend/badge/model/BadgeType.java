package org.bounswe.jobboardbackend.badge.model;

import lombok.Getter;

/**
 * Defines all available badge types in the system.
 * Each badge has a display name, description, icon (emoji for now, GCS URL later), and criteria.
 */
@Getter
public enum BadgeType {

    // ==================== FORUM POST BADGES ====================
    
    FIRST_VOICE(
        "First Voice",
        "Published your first forum post",
        "📝",
        "Create your first forum post",
        1
    ),
    THOUGHT_LEADER(
        "Thought Leader",
        "Published 10 forum posts",
        "💡",
        "Create 10 forum posts",
        10
    ),
    COMMUNITY_PILLAR(
        "Community Pillar",
        "A foundational voice with 25 posts",
        "🏛️",
        "Create 25 forum posts",
        25
    ),

    // ==================== FORUM COMMENT BADGES ====================
    
    CONVERSATION_STARTER(
        "Conversation Starter",
        "Made your first comment",
        "💬",
        "Comment on a forum post",
        1
    ),
    ACTIVE_VOICE(
        "Active Voice",
        "Contributed 10 comments to discussions",
        "🗣️",
        "Make 10 comments",
        10
    ),
    DISCUSSION_DRIVER(
        "Discussion Driver",
        "Driving discussions with 50 comments",
        "🎯",
        "Make 50 comments",
        50
    ),

    // ==================== UPVOTE BADGES ====================
    
    HELPFUL(
        "Helpful",
        "Your comments helped 10 people",
        "👍",
        "Receive 10 upvotes on your comments",
        10
    ),
    VALUABLE_CONTRIBUTOR(
        "Valuable Contributor",
        "Received 50 upvotes for helpful content",
        "⭐",
        "Receive 50 upvotes on your comments",
        50
    );

    private final String displayName;
    private final String description;
    private final String icon;
    private final String criteria;
    private final int threshold;

    BadgeType(String displayName, String description, String icon, String criteria, int threshold) {
        this.displayName = displayName;
        this.description = description;
        this.icon = icon;
        this.criteria = criteria;
        this.threshold = threshold;
    }
}

