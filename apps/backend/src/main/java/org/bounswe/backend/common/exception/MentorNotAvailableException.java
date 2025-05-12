package org.bounswe.backend.common.exception;

public class MentorNotAvailableException extends RuntimeException {
    public MentorNotAvailableException() {
        super("Mentor is not available for mentorship");
    }
}
