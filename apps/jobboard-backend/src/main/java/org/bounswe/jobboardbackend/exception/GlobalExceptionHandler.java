package org.bounswe.jobboardbackend.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(HandleException.class)
    public ResponseEntity<ApiError> handleException(HandleException ex, HttpServletRequest req) {
        return build(ex.getMessage(), ex.getCode(), ex.getCode().status, req, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException ex, HttpServletRequest req) {
        return build("Endpoint not found", ErrorCode.NOT_FOUND, ErrorCode.NOT_FOUND.status, req, null);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUsernameNotFound(UsernameNotFoundException ex, HttpServletRequest req) {
        return build("User not found", ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.status, req, null);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex,
                                                              HttpServletRequest req) {
        List<ApiError.Violation> violations = ex.getConstraintViolations().stream()
                .map(cv -> new ApiError.Violation(cv.getPropertyPath().toString(), cv.getMessage()))
                .collect(Collectors.toList());
        return build("Validation failed", ErrorCode.VALIDATION_FAILED, ErrorCode.VALIDATION_FAILED.status, req, violations);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleMalformedJson(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build("Malformed JSON request", ErrorCode.MALFORMED_JSON, ErrorCode.MALFORMED_JSON.status, req, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiError.Violation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.Violation(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        return build("Validation failed", ErrorCode.VALIDATION_FAILED, ErrorCode.VALIDATION_FAILED.status, req, violations);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBindException(BindException ex, HttpServletRequest req) {
        List<ApiError.Violation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.Violation(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        return build("Validation failed", ErrorCode.VALIDATION_FAILED, ErrorCode.VALIDATION_FAILED.status, req, violations);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String msg = "Parameter '" + ex.getName() + "' has invalid value: " + ex.getValue();
        return build(msg, ErrorCode.VALIDATION_FAILED, ErrorCode.VALIDATION_FAILED.status, req, null);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        String msg = "Missing request parameter: " + ex.getParameterName();
        return build(msg, ErrorCode.VALIDATION_FAILED, ErrorCode.VALIDATION_FAILED.status, req, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return build("Method not allowed", ErrorCode.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED.status, req, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var trust = new AuthenticationTrustResolverImpl();

        if (auth == null || trust.isAnonymous(auth) || trust.isRememberMe(auth)) {
            return build(
                    "Full authentication is required to access this resource",
                    ErrorCode.USER_UNAUTHORIZED,
                    ErrorCode.USER_UNAUTHORIZED.status,
                    req,
                    null
            );
        }

        return build(
                "Access denied",
                ErrorCode.ACCESS_DENIED,
                ErrorCode.ACCESS_DENIED.status,
                req,
                null
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build("Invalid username or password", ErrorCode.INVALID_CREDENTIALS, ErrorCode.INVALID_CREDENTIALS.status, req, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        return build("Authentication failed", ErrorCode.AUTHENTICATION_FAILED, ErrorCode.AUTHENTICATION_FAILED.status, req, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        return build("Resource conflict", ErrorCode.RESOURCE_CONFLICT, ErrorCode.RESOURCE_CONFLICT.status, req, null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return build(ex.getMessage(), ErrorCode.BAD_REQUEST, ErrorCode.BAD_REQUEST.status, req, null);
    }

    private ResponseEntity<ApiError> build(
    String message,
    ErrorCode code,
    HttpStatus status,
    HttpServletRequest req,
    List<ApiError.Violation> violations) {

        ApiError apiError = new ApiError(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                code.name(),
                message,
                req.getRequestURI(),
                violations
        );
        return new ResponseEntity<>(apiError, new HttpHeaders(), status);
    }
}
