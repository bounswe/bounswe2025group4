package org.bounswe.backend.common.exception;

public class MentorCapacityExceededException extends RuntimeException {
    public MentorCapacityExceededException() {
        super("Mentor has reached maximum capacity");
    }
}

