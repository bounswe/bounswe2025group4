package org.bounswe.backend.common.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String object) {
        super(object + " not found");
    }
}
