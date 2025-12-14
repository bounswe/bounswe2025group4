package org.bounswe.jobboardbackend.auth.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.auth.dto.*;
import org.bounswe.jobboardbackend.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<OtpRequestResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        return new ResponseEntity<>(authService.initiateLogin(loginRequest), HttpStatus.OK);

    }

    @PostMapping("/login/verify")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest otpVerifyRequest) {
        return new ResponseEntity<>(authService.completeLogin(otpVerifyRequest), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {

        return new ResponseEntity<>(authService.registerAndSendVerification(registerRequest), HttpStatus.CREATED);

    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyRequest verifyRequest) {

        authService.verifyEmailToken(verifyRequest.getToken());
        return ResponseEntity.ok(new MessageResponse("Email verified. You can login now."));

    }

    @PostMapping("/password-reset")
    public ResponseEntity<MessageResponse> requestReset(@Valid @RequestBody PasswordResetRequest resetRequest) {
        authService.issueResetTokenIfExists(resetRequest.getEmail());
        return ResponseEntity.accepted().body(new MessageResponse("If that email exists, a reset link has been sent."));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<MessageResponse> confirmReset(@Valid @RequestBody PasswordResetConfirmRequest resetConfirmRequest) {
        authService.resetPassword(resetConfirmRequest.getToken(), resetConfirmRequest.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password has been reset. You can log in now."));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/password-change")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody PasswordChangeRequest req, Authentication auth) {
        authService.changePassword(auth, req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication auth) {
        return new ResponseEntity<>(authService.getUserDetails(auth), HttpStatus.OK);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/me")
    public ResponseEntity<MessageResponse> deleteAccount(Authentication auth) {
        authService.deleteAccount(auth);
        return ResponseEntity.ok(new MessageResponse("Account deleted successfully."));
    }
}

