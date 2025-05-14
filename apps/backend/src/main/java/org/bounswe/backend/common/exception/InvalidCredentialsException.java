package org.bounswe.backend.common.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid Login Credentials");
    }
}
