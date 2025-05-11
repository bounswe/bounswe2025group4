package org.bounswe.backend.common.exception;

import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

public record ApiErrorResponse(String error, String message, HttpStatus status) {
    public Map<String, String> toMap() {
        Map<String, String> map = new HashMap<>();
        map.put("error", error);
        map.put("message", message);
        map.put("status", String.valueOf(status));
        return map;
    }
}
