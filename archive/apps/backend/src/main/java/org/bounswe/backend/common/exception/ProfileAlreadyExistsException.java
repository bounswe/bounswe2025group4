package org.bounswe.backend.common.exception;

public class ProfileAlreadyExistsException extends RuntimeException {
    public ProfileAlreadyExistsException(String username) {
        super("Profile already exists for the user: " + username);
    }
}
