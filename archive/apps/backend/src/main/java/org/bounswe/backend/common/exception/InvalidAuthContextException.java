package org.bounswe.backend.common.exception;

public class InvalidAuthContextException extends RuntimeException {
    public InvalidAuthContextException() {
        super("Invalid authentication context");
    }
}
