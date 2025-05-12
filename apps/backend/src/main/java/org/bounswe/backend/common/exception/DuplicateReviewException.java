package org.bounswe.backend.common.exception;

public class DuplicateReviewException extends RuntimeException {
    public DuplicateReviewException() {
        super("You have already reviewed this mentor");
    }
}

