package org.bounswe.jobboardbackend.workplace.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum EthicalPolicy {

    SALARY_TRANSPARENCY("Salary Transparency"),
    EQUAL_PAY_POLICY("Equal Pay Policy"),
    LIVING_WAGE_EMPLOYER("Living Wage Employer"),
    COMPREHENSIVE_HEALTH_INSURANCE("Comprehensive Health Insurance"),
    PERFORMANCE_BASED_BONUS("Performance-Based Bonus"),
    RETIREMENT_PLAN_SUPPORT("Retirement Plan Support"),
    FLEXIBLE_HOURS("Flexible Hours"),
    REMOTE_FRIENDLY("Remote-Friendly"),
    NO_AFTER_HOURS_WORK_CULTURE("No After-Hours Work Culture"),
    MENTAL_HEALTH_SUPPORT("Mental Health Support"),
    GENEROUS_PAID_TIME_OFF("Generous Paid Time Off"),
    PAID_PARENTAL_LEAVE("Paid Parental Leave"),
    INCLUSIVE_HIRING_PRACTICES("Inclusive Hiring Practices"),
    DIVERSE_LEADERSHIP("Diverse Leadership"),
    LGBTQ_PLUS_FRIENDLY_WORKPLACE("LGBTQ+ Friendly Workplace"),
    DISABILITY_INCLUSIVE_WORKPLACE("Disability-Inclusive Workplace"),
    SUPPORTS_WOMEN_IN_LEADERSHIP("Supports Women in Leadership"),
    MENTORSHIP_PROGRAM("Mentorship Program"),
    LEARNING_AND_DEVELOPMENT_BUDGET("Learning & Development Budget"),
    TRANSPARENT_PROMOTION_PATHS("Transparent Promotion Paths"),
    INTERNAL_MOBILITY("Internal Mobility"),
    SUSTAINABILITY_FOCUSED("Sustainability-Focused"),
    ETHICAL_SUPPLY_CHAIN("Ethical Supply Chain"),
    COMMUNITY_VOLUNTEERING("Community Volunteering"),
    CERTIFIED_B_CORPORATION("Certified B-Corporation");

    private final String label;

    EthicalPolicy(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static EthicalPolicy fromLabel(String value) {
        if (value == null) return null;
        String norm = normalize(value);
        return Arrays.stream(values())
                .filter(p -> normalize(p.label).equals(norm))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown ethical policy label: " + value));
    }

    private static String normalize(String s) {
        String v = s.trim().toLowerCase()
                .replace('_', ' ');
        return v.replaceAll("\\s+", " ");
    }
}