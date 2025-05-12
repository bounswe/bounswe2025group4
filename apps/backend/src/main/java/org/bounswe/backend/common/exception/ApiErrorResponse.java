package org.bounswe.backend.common.exception;

import org.springframework.http.HttpStatus;

public record ApiErrorResponse(String error, String message, HttpStatus status) {
}
