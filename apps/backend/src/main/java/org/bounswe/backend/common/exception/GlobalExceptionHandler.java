package org.bounswe.backend.common.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

//@ControllerAdvice // Not @RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    @ResponseBody // Add this instead of @RestControllerAdvice
//    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
//        Map<String, String> errors = new HashMap<>();
//        ex.getBindingResult().getFieldErrors()
//                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
//        return ResponseEntity.badRequest().body(errors);
//    }
//}
