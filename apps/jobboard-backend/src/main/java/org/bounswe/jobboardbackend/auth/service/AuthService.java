package org.bounswe.jobboardbackend.auth.service;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.dto.*;
import org.bounswe.jobboardbackend.auth.model.*;
import org.bounswe.jobboardbackend.auth.repository.OtpRepository;
import org.bounswe.jobboardbackend.auth.repository.PasswordResetTokenRepository;
import org.bounswe.jobboardbackend.auth.repository.TokenRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.security.JwtUtils;
import org.bounswe.jobboardbackend.activity.service.ActivityService;
import org.bounswe.jobboardbackend.activity.model.ActivityType;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.profile.model.Profile;
import org.bounswe.jobboardbackend.profile.repository.ProfileRepository;
import org.bounswe.jobboardbackend.profile.service.ProfileService;
import org.bounswe.jobboardbackend.forum.service.ForumService;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
import org.bounswe.jobboardbackend.jobpost.service.JobPostService;
import org.bounswe.jobboardbackend.jobapplication.service.JobApplicationService;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
//    @Value("${app.env}")
//    private String appEnv;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OtpService otpService;
    private final OtpRepository otpRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final ProfileRepository profileRepository;
    private final ProfileService profileService;
    private final ActivityService activityService;
    private final ForumService forumService;
    private final ReviewService reviewService;
    private final JobPostService jobPostService;
    private final JobApplicationService jobApplicationService;
    private final MentorshipService mentorshipService;
    private final NotificationService notificationService;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final WorkplaceService workplaceService;

    @Transactional
    public OtpRequestResponse initiateLogin(@Valid LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND,
                        "User not found. Please check your username."));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified. Please verify your email.");
        }

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            String reason = user.getBanReason() != null ? user.getBanReason() : "Your account has been banned.";
            throw new HandleException(ErrorCode.ACCOUNT_BANNED, reason);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        String temporaryToken = jwtUtils.generateOtpToken(authentication);

        otpService.sendOtp(user.getUsername(), temporaryToken);

        return new OtpRequestResponse(
                user.getUsername(),
                "Verification code to login has been sent to your mail",
                temporaryToken);
    }

    @Transactional
    public JwtResponse completeLogin(OtpVerifyRequest otpRequest) {

        User user = userRepository.findByUsername(otpRequest.getUsername())
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified. Please verify your email.");
        }

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            String reason = user.getBanReason() != null ? user.getBanReason() : "Your account has been banned.";
            throw new HandleException(ErrorCode.ACCOUNT_BANNED, reason);
        }

        Otp otp = otpService.validateOtpAndToken(
                otpRequest.getUsername(),
                otpRequest.getOtpCode(),
                otpRequest.getTemporaryToken());

        otpRepository.delete(otp);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());

        String accessToken = jwtUtils.generateAccessToken(auth);

        SecurityContextHolder.getContext().setAuthentication(auth);

        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new HandleException(ErrorCode.ROLE_INVALID, "User has no role assigned"));

        return new JwtResponse(accessToken, user.getId(), user.getUsername(), user.getEmail(), role);
    }

    @Transactional
    public MessageResponse registerAndSendVerification(@Valid RegisterRequest registerRequest) {

        Optional<User> user = userRepository.findByUsername(registerRequest.getUsername());

        if (user.isPresent()) {
            if (user.get().getEmailVerified()) {
                throw new HandleException(ErrorCode.USER_ALREADY_EXISTS, "User already exists with verified email");
            }
            sendEmailForRegister(user.get());
            return new MessageResponse(
                    "Registration is already exists, verification link is sent again. Please verify your email.");
        }

        User newUser = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()));

        String strRole = registerRequest.getRole();

        Role role = switch (strRole) {
//            case "ROLE_ADMIN" -> Role.ROLE_ADMIN; // Disabled for security
            case "ROLE_EMPLOYER" -> Role.ROLE_EMPLOYER;
            case "ROLE_JOBSEEKER" -> Role.ROLE_JOBSEEKER;
            default -> throw new HandleException(ErrorCode.ROLE_INVALID, "User has no role assigned");
        };

        newUser.setRole(role);
        newUser.setEmailVerified(true);
        //newUser.setEmailVerified(!appEnv.equals("prod"));
        userRepository.save(newUser);

        Profile profile = Profile.builder()
                .user(newUser)
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .bio(registerRequest.getBio())
                .pronounSet(PronounSet.valueOf(registerRequest.getPronounSet().toUpperCase()))
                .imageUrl(null)
                .build();

        profileRepository.save(profile);

//        if (appEnv.equals("prod")) {
//            sendEmailForRegister(newUser);
//        }

        activityService.logActivity(newUser, ActivityType.REGISTER, newUser.getId(), "User");

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

        if (!Boolean.TRUE.equals(user.getEmailVerified()))
            throw new HandleException(ErrorCode.EMAIL_NOT_VERIFIED, "Email not verified.");

        passwordResetTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString();
        Instant expires = Instant.now().plus(Duration.ofMinutes(20));
        passwordResetTokenRepository.save(new PasswordResetToken(null, token, user.getId(), expires, null));

        emailService.sendPasswordResetEmail(user.getEmail(), token);

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
    public void changePassword(Authentication auth, @NotBlank String currentPassword,
            @Size(min = 8, max = 128) String newPassword) {
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
            throw new HandleException(ErrorCode.PASSWORD_SAME_AS_OLD,
                    "New password must be different from the current one.");
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

        emailService.sendVerificationEmail(user.getEmail(), token);
    }

    @Transactional
    public void deleteAccount(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Long userId = user.getId();
        String username = user.getUsername();

        notificationService.deleteUserData(username);
        jobApplicationService.deleteUserData(userId);
        jobPostService.deleteUserData(userId);
        mentorshipService.deleteUserData(userId);
        forumService.deleteUserData(userId);
        reviewService.deleteUserData(userId);
        workplaceService.deleteUserData(userId);
        activityService.deleteActivitiesByUserId(userId);
        profileService.deleteProfileByUserId(userId);

        tokenRepository.deleteByUserId(userId);
        passwordResetTokenRepository.deleteByUserId(userId);
        otpRepository.deleteByUsername(username);
        employerWorkplaceRepository.deleteByUser_Id(userId);

        userRepository.delete(user);
    }
}
