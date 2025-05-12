package org.bounswe.backend.tag.exception;

public class TagException extends RuntimeException {
    private final String code;

    public TagException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}