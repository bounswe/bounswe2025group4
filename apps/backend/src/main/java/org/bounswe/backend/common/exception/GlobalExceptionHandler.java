package org.bounswe.backend.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        return buildErrorResponse("Conflict", "Username already exists: " + ex.getUsername(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return buildErrorResponse("Conflict", "An account using this email already exists: " + ex.getEmail(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidResetTokenException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidResetToken(InvalidResetTokenException ex) {
        return buildErrorResponse("Bad Request", "Invalid or expired reset token.", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return buildErrorResponse("Not Found", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NotFoundException ex) {
        return buildErrorResponse("Not Found", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildErrorResponse("Unauthorized", ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(QuoteFetchException.class)
    public ResponseEntity<ApiErrorResponse> handleQuoteFetchException(QuoteFetchException ex) {
        return buildErrorResponse("Service Error", ex.getMessage(), HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorizedAction(UnauthorizedActionException ex) {
        return buildErrorResponse("Unauthorized Action", ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MentorNotAvailableException.class)
    public ResponseEntity<ApiErrorResponse> handleMentorNotAvailable(MentorNotAvailableException ex) {
        return buildErrorResponse("Unavailable Mentor", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MentorCapacityExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMentorCapacityExceeded(MentorCapacityExceededException ex) {
        return buildErrorResponse("Mentorship Capacity Exceeded", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(PendingRequestExistsException.class)
    public ResponseEntity<ApiErrorResponse> handlePendingRequestExists(PendingRequestExistsException ex) {
        return buildErrorResponse("Conflict", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MentorProfileAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleMentorProfileAlreadyExists(MentorProfileAlreadyExistsException ex) {
        return buildErrorResponse("Conflict", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MentorshipNotCompletedException.class)
    public ResponseEntity<ApiErrorResponse> handleMentorshipNotCompleted(MentorshipNotCompletedException ex) {
        return buildErrorResponse("Forbidden", ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DuplicateReviewException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateReview(DuplicateReviewException ex) {
        return buildErrorResponse("Conflict", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TagException.class)
    public ResponseEntity<ApiErrorResponse> handleTagException(TagException ex) {
        String message = ex.getMessage();
        String errorCode = ex.getErrorCode();

        return buildErrorResponse(errorCode, message, HttpStatus.BAD_REQUEST);
    }








    // Reusable method for building error responses
    private ResponseEntity<ApiErrorResponse> buildErrorResponse(String error, String message, HttpStatus status) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(error, message, status);
        return new ResponseEntity<>(errorResponse, status);
    }
}
