package org.bounswe.backend.common.exception;

public class UnauthorizedUserException extends RuntimeException {
    public UnauthorizedUserException(String action) {
        super("Unauthorized user: " + action);
    }
}
