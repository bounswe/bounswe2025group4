package org.bounswe.backend.common.exception;

import lombok.Getter;

@Getter
public class UsernameAlreadyExistsException extends RuntimeException {
    private final String username;
    public UsernameAlreadyExistsException(String username) {
        super("Username already exists: " + username);
        this.username = username;
    }

}
