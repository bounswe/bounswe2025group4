package org.bounswe.backend.auth.controller;

import jakarta.validation.Valid;
import org.bounswe.backend.auth.dto.*;
import org.bounswe.backend.auth.jwt.JwtTokenProvider;
import org.bounswe.backend.auth.service.PasswordResetTokenService;
import org.bounswe.backend.auth.service.EmailService;
import org.bounswe.backend.common.exception.*;
import org.bounswe.backend.profile.entity.Profile;
import org.bounswe.backend.profile.repository.ProfileRepository;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PasswordResetTokenService passwordResetTokenService;
    private final EmailService emailService;
    private final ProfileRepository profileRepository;

    public AuthController(UserRepository userRepository,
                          JwtTokenProvider jwtTokenProvider,
                          BCryptPasswordEncoder passwordEncoder,
                          PasswordResetTokenService passwordResetTokenService,
                          EmailService emailService, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenService = passwordResetTokenService;
        this.emailService = emailService;
        this.profileRepository = profileRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty.");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        if (request.getMentorshipStatus() == null) {
            throw new IllegalArgumentException("Mentorship status must be selected.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException(request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userType(request.getUserType())
                .mentorshipStatus(request.getMentorshipStatus())
                .build();

        userRepository.save(user);

        Profile profile = Profile.builder()
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .location(request.getLocation())
            .occupation(request.getOccupation())
            .profilePicture(request.getProfilePicture())
            .bio(request.getBio())
            .user(user)
            .build();

        profileRepository.save(profile);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getUserType().name());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .userType(user.getUserType().name())
                .id(user.getId())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getUserType().name());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .userType(user.getUserType().name())
                .id(user.getId())
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetResponse> forgotPassword(@RequestBody @Valid PasswordForgotRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User"));


        String token = passwordResetTokenService.createPasswordResetToken(user);
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Password Reset",
                "Click the link to reset your password: " + resetLink);

        return ResponseEntity.ok(
                PasswordResetResponse.builder()
                        .message("Password reset link sent to your email.")
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponse> resetPassword(@RequestBody @Valid PasswordResetRequest request) {

        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new InvalidResetTokenException("Reset token is missing.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        passwordResetTokenService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(
                PasswordResetResponse.builder()
                        .message("Password reset successful.")
                        .build()
        );
    }

}
