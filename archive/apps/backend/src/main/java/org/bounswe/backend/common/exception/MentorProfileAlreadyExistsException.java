package org.bounswe.backend.common.exception;

public class MentorProfileAlreadyExistsException extends RuntimeException {
    public MentorProfileAlreadyExistsException() {
        super("Mentor profile already exists for this user");
    }
}

