package org.bounswe.backend.common.exception;

import lombok.Getter;

@Getter
public class EmailAlreadyExistsException extends RuntimeException {
    private final String email;
    public EmailAlreadyExistsException(String email) {
        super("An account using this email already exists: " + email);
        this.email = email;
    }
    
}
