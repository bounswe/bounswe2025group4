package org.bounswe.jobboardbackend.exception;


import lombok.Getter;

@Getter
public class HandleException extends RuntimeException {
    private final ErrorCode code;

    public HandleException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }
    public HandleException(ErrorCode code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
