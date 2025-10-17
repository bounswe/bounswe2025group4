package org.bounswe.jobboardbackend.auth.service;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.dto.*;
import org.bounswe.jobboardbackend.auth.model.EmailVerificationToken;
import org.bounswe.jobboardbackend.auth.model.PasswordResetToken;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.PasswordResetTokenRepository;
import org.bounswe.jobboardbackend.auth.repository.TokenRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.security.JwtUtils;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    @Value("${app.verifyEmailUrl}")
    private String verifyEmailUrl;
    @Value("${app.resetPasswordUrl}")
    private String resetPasswordUrl;

    @Transactional
    public JwtResponse authUser(@Valid LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() ->  new HandleException(ErrorCode.USER_NOT_FOUND, "User not found. Please check your username."));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified. Please verify your email.");
        }
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new HandleException(ErrorCode.ROLE_INVALID, "User has no role assigned"));

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), role);
    }


    @Transactional
    public MessageResponse registerAndSendVerification(@Valid RegisterRequest registerRequest) {

        Optional<User> user = userRepository.findByUsername(registerRequest.getUsername());

        if(user.isPresent()) {
            if(user.get().getEmailVerified()) {
                throw new HandleException(ErrorCode.USER_ALREADY_EXISTS, "User already exists with verified email");
            }
            sendEmailForRegister(user.get());
            return new MessageResponse("Registration is already exists, verification link is sent again. Please verify your email.");
        }


        User newUser = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()
                ));

        String strRole = registerRequest.getRole();
        
        Role role = switch (strRole) {
            case "ROLE_ADMIN" -> Role.ROLE_ADMIN;
            case "ROLE_EMPLOYER" -> Role.ROLE_EMPLOYER;
            case "ROLE_JOBSEEKER" -> Role.ROLE_JOBSEEKER;
            default -> throw new HandleException(ErrorCode.ROLE_INVALID, "User has no role assigned");
        };

        newUser.setRole(role);
        newUser.setEmailVerified(false);
        userRepository.save(newUser);
        sendEmailForRegister(newUser);

        return new MessageResponse("User registered. Please verify your email.");
    }

    @Transactional
    public void verifyEmailToken(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new HandleException(ErrorCode.INVALID_TOKEN, "Invalid token"));

        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(verificationToken);
            throw new HandleException(ErrorCode.TOKEN_EXPIRED, "Token expired");
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
    }

    @Transactional
    public void issueResetTokenIfExists(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, email + " not found"));


        if (!Boolean.TRUE.equals(user.getEmailVerified())) throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified.");

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
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified.");
        }

        if (!encoder.matches(currentPassword, user.getPassword())) {
            throw new HandleException(ErrorCode.CURRENT_PASSWORD_INVALID, "Current password is invalid.");
        }

        if (encoder.matches(newPassword, user.getPassword())) {
            throw new HandleException(ErrorCode.PASSWORD_SAME_AS_OLD, "New password must be different from the current one.");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse getUserDetails(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        String role = user.getRole().name();
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), role);
    }

    private void sendEmailForRegister(User user) {
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
    }
}
