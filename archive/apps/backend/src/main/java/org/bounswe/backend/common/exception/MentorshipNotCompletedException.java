package org.bounswe.backend.common.exception;

public class MentorshipNotCompletedException extends RuntimeException {
    public MentorshipNotCompletedException() {
        super("Cannot review a mentor without completing a mentorship");
    }
}

