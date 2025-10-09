package org.bounswe.jobboardbackend.jwt.service;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.jwt.dto.*;
import org.bounswe.jobboardbackend.jwt.model.*;
import org.bounswe.jobboardbackend.jwt.repository.PasswordResetTokenRepository;
import org.bounswe.jobboardbackend.jwt.repository.TokenRepository;
import org.bounswe.jobboardbackend.jwt.repository.UserRepository;
import org.bounswe.jobboardbackend.jwt.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;




@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.verifyEmailUrl}")
    private String verifyEmailUrl;
    @Value("${app.resetPasswordUrl}")
    private String resetPasswordUrl;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;


    @Transactional
    public JwtResponse authUser(@Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), roles);
    }


    @Transactional
    public MessageResponse registerAndSendVerification(@Valid RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()));

        Set<String> strRoles = registerRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = Role.ROLE_JOBSEEKER;
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "ROLE_ADMIN":
                        Role adminRole = Role.ROLE_ADMIN;

                        roles.add(adminRole);

                    case "ROLE_EMPLOYER":
                        Role employerRole = Role.ROLE_EMPLOYER;
                        roles.add(employerRole);

                    default:
                        Role jobseekerRole = Role.ROLE_JOBSEEKER;

                        roles.add(jobseekerRole);
                        break;
                }
            });
        }

        user.setRoles(roles);
        user.setEmailVerified(false);
        userRepository.save(user);

        String token = UUID.randomUUID().toString();
        Instant expires = Instant.now().plus(Duration.ofMinutes(20));
        tokenRepository.deleteByUserId(user.getId());
        tokenRepository.save(new EmailVerificationToken(token, user.getId(), expires));
        String link = UriComponentsBuilder
                .fromUriString(verifyEmailUrl)
                .queryParam("token", token)
                .build().toUriString();

        String body = """
            Please click to verify your email (expires in ~20m):
            %s
            If you didn't request this, ignore.
        """.formatted(link);

        emailService.sendEmail(user.getEmail(), "Verify your email", body);


        return new MessageResponse("Verification email sent. Please verify your email.");
    }

    @Transactional
    public void verifyEmailToken(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token expired");
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
    }

    @Transactional
    public void issueResetTokenIfExists(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));


        if (!Boolean.TRUE.equals(user.getEmailVerified())) return;

        passwordResetTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString();
        Instant expires = Instant.now().plus(Duration.ofMinutes(20));
        passwordResetTokenRepository.save(new PasswordResetToken(null, token, user.getId(), expires, null));


        String link = UriComponentsBuilder
                .fromUriString(resetPasswordUrl)
                .queryParam("token", token)
                .build()
                .toUriString();

        emailService.sendEmail(
                user.getEmail(),
                "Reset your password",
                """
                You requested a password reset. This link expires in ~20 minutes.

                %s

                If you didn't request this, you can ignore this email.
                """.formatted(link)
        );
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (prt.getUsedAt() != null || prt.getExpiresAt().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(prt);
            throw new IllegalArgumentException("Invalid or expired token");
        }

        User user = userRepository.findById(prt.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(prt);
    }

    @Transactional
    public void changePassword(Authentication auth, @NotBlank String currentPassword, @Size(min = 8, max = 128) String newPassword) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalStateException("Account is not active.");
        }

        if (!encoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid current password");
        }

        if (encoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current one.");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse getUserDetails(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<String> roles = user.getRoles()
                .stream()
                .map(Enum::name)
                .collect(Collectors.toList());
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), roles);
    }
}
