package org.bounswe.backend.common.exception;

import lombok.Getter;

@Getter
public class TagException extends RuntimeException {
    private final String errorCode;

    public TagException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

}
