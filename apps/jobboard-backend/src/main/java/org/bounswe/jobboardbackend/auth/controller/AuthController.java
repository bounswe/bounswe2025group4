package org.bounswe.jobboardbackend.auth.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.auth.dto.*;
import org.bounswe.jobboardbackend.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        return new ResponseEntity<>(authService.authUser(loginRequest), HttpStatus.OK);

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
        return ResponseEntity.accepted()
                .body(new MessageResponse("If that email exists, a reset link has been sent."));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<MessageResponse> confirmReset(@Valid @RequestBody PasswordResetConfirmRequest resetConfirmRequest) {
        authService.resetPassword(resetConfirmRequest.getToken(), resetConfirmRequest.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password has been reset. You can log in now."));
    }

    @PostMapping("/password-change")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody PasswordChangeRequest req,
            Authentication auth
    ) {
        authService.changePassword(auth, req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMe(
            Authentication auth
    ) {
        return new ResponseEntity<>(authService.getUserDetails(auth), HttpStatus.OK);
    }

}

