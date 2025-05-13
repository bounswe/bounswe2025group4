package org.bounswe.backend.common.exception;

public class PendingRequestExistsException extends RuntimeException {
    public PendingRequestExistsException() {
        super("A pending request already exists");
    }
}

