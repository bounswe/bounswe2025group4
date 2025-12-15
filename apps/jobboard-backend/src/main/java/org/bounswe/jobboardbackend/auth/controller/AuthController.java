package org.bounswe.jobboardbackend.auth.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.auth.dto.*;
import org.bounswe.jobboardbackend.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and management")
public class AuthController {

    final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Initiate Login", description = "Initiates the login process by validating credentials and potentially sending an OTP.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login initiated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid credentials", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"INVALID_CREDENTIALS\", \"message\": \"Invalid username or password\", \"path\": \"/api/auth/login\" }")))
    })
    @PostMapping("/login")
    public ResponseEntity<OtpRequestResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        return new ResponseEntity<>(authService.initiateLogin(loginRequest), HttpStatus.OK);

    }

    @Operation(summary = "Verify OTP", description = "Verifies the OTP sent to the user and issues a JWT if successful.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "OTP verified, JWT issued"),
            @ApiResponse(responseCode = "400", description = "Invalid OTP or credentials", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"INVALID_TOKEN\", \"message\": \"Invalid or expired token\", \"path\": \"/api/auth/login/verify\" }")))
    })
    @PostMapping("/login/verify")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest otpVerifyRequest) {
        return new ResponseEntity<>(authService.completeLogin(otpVerifyRequest), HttpStatus.OK);
    }

    @Operation(summary = "Register User", description = "Registers a new user and sends a verification email.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully, verification email sent"),
            @ApiResponse(responseCode = "400", description = "Invalid registration data", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"USER_ALREADY_EXISTS\", \"message\": \"User already exists with verified email\", \"path\": \"/api/auth/register\" }")))
    })
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        return new ResponseEntity<>(authService.registerAndSendVerification(registerRequest), HttpStatus.CREATED);

    }

    @Operation(summary = "Verify Email", description = "Verifies the user's email address using a token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"INVALID_TOKEN\", \"message\": \"Invalid token\", \"path\": \"/api/auth/verify-email\" }")))
    })
    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyRequest verifyRequest) {

        authService.verifyEmailToken(verifyRequest.getToken());
        return ResponseEntity.ok(new MessageResponse("Email verified. You can login now."));

    }

    @Operation(summary = "Request Password Reset", description = "Requests a password reset link to be sent to the user's email.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Reset link request processed"),
            @ApiResponse(responseCode = "400", description = "Invalid email format", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"USER_NOT_FOUND\", \"message\": \"User not found\", \"path\": \"/api/auth/password-reset\" }")))
    })
    @PostMapping("/password-reset")
    public ResponseEntity<MessageResponse> requestReset(@Valid @RequestBody PasswordResetRequest resetRequest) {
        authService.issueResetTokenIfExists(resetRequest.getEmail());
        return ResponseEntity.accepted().body(new MessageResponse("If that email exists, a reset link has been sent."));
    }

    @Operation(summary = "Confirm Password Reset", description = "Resets the user's password using a valid token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid token or password format", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"INVALID_TOKEN\", \"message\": \"Invalid or expired token\", \"path\": \"/api/auth/password-reset/confirm\" }")))
    })
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<MessageResponse> confirmReset(
            @Valid @RequestBody PasswordResetConfirmRequest resetConfirmRequest) {
        authService.resetPassword(resetConfirmRequest.getToken(), resetConfirmRequest.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password has been reset. You can log in now."));
    }

    @Operation(summary = "Change Password", description = "Allows an authenticated user to change their password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid password format or current password invalid", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"CURRENT_PASSWORD_INVALID\", \"message\": \"Current password is invalid.\", \"path\": \"/api/auth/password-change\" }"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/auth/password-change\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/password-change")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody PasswordChangeRequest req,
            Authentication auth) {
        authService.changePassword(auth, req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    @Operation(summary = "Get Current User", description = "Retrieves details of the currently authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User details retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/auth/me\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication auth) {
        return new ResponseEntity<>(authService.getUserDetails(auth), HttpStatus.OK);
    }

    @Operation(summary = "Delete Account", description = "Permanently deletes the currently authenticated user's account.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/auth/me\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/me")
    public ResponseEntity<MessageResponse> deleteAccount(Authentication auth) {
        authService.deleteAccount(auth);
        return ResponseEntity.ok(new MessageResponse("Account deleted successfully."));
    }
}
