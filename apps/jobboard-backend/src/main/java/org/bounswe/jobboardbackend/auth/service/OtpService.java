package org.bounswe.jobboardbackend.auth.service;


import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.Otp;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.OtpRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.security.JwtUtils;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final JwtUtils jwtUtils;

    private static final Duration OTP_EXPIRATION_TIME = Duration.ofMinutes(5);

    @Transactional
    public void sendOtp(String username, String temporaryToken) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));

        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plus(OTP_EXPIRATION_TIME);

        otpRepository.deleteByUsername(username);

        Otp otp = new Otp();
        otp.setUsername(username);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(expiresAt);
        otp.setTemporaryToken(temporaryToken);
        otpRepository.save(otp);

        sendOtpEmail(user.getEmail(), otpCode);
    }


    @Transactional
    public Otp validateOtpAndToken(String username, String otpCode, String temporaryToken) {

        if (!jwtUtils.validateJwtToken(temporaryToken) || !jwtUtils.isPreauthToken(temporaryToken)) {
            throw new HandleException(ErrorCode.INVALID_TOKEN, "Invalid or unsupported temporary token");
        }

        Claims claims = jwtUtils.getClaims(temporaryToken);
        String tokenSub = claims.getSubject();

        if (!username.equals(tokenSub)) {
            throw new HandleException(ErrorCode.INVALID_CREDENTIALS, "Token subject does not match user");
        }

        Otp otp = otpRepository.findByUsernameAndOtpCode(username, otpCode)
                .orElseThrow(() -> new HandleException(ErrorCode.INVALID_TOKEN, "Invalid OTP code"));


        if (otp.isExpired() || (otp.getExpiresAt() != null && otp.getExpiresAt().isBefore(LocalDateTime.now()))) {
            otpRepository.delete(otp);
            throw new HandleException(ErrorCode.TOKEN_EXPIRED, "OTP has expired");
        }

        otp.setVerifiedAt(LocalDateTime.now());

        return otp;
    }



    private String generateOtp() {

        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }



    private void sendOtpEmail(String email, String otpCode) {
        String subject = "Your JobBoard Login Verification Code";
        String body = """
                Your verification code for JobBoard login is: %s
                
                This code will expire in 5 minutes.
                
                If you did not request this code, please ignore this email or contact support if you have concerns.
                """.formatted(otpCode);

        emailService.sendEmail(email, subject, body);
    }

}
