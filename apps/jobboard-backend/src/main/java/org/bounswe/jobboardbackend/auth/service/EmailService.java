package org.bounswe.jobboardbackend.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String smtpFrom;

    @Value("${app.verifyEmailUrl:http://localhost:8080/verify-email}")
    private String verifyEmailUrl;

    @Value("${app.resetPasswordUrl:http://localhost:8080/reset-password}")
    private String resetPasswordUrl;



    @Async
    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = verifyEmailUrl + "?token=" + token;
        String subject = "Verify your email address";

        String html = buildHtmlEmail(
                "Verify your email",
                verifyUrl,
                "Please verify your email address by clicking the button below. This link expires in <b>20 minutes</b>."
        );
        String plain = """
                Verify your email

                Please verify your email address by opening this link (expires in ~20 minutes):
                %s

                If you didn’t request this, you can ignore this email.
                """.formatted(verifyUrl);

        sendHtml(to, subject, html, plain);
    }


    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = resetPasswordUrl + "?token=" + token;
        String subject = "Reset your EthicalJob password";

        String html = buildHtmlEmail(
                "Reset your password",
                resetUrl,
                "We received a request to reset your password. Click below to set a new one. This link expires in <b>20 minutes</b>."
        );
        String plain = """
                Reset your password

                We received a password reset request. Open this link to continue (expires in ~20 minutes):
                %s

                If you didn’t request this, you can ignore this email.
                """.formatted(resetUrl);

        sendHtml(to, subject, html, plain /*disableTracking=*/);
    }

    @Async
    public void sendOtpEmail(String to, String otpCode) {

        String spaced = otpCode.replaceAll("(\\d{3})(\\d{3})", "$1 $2");

        String subject = "Your EthicalJob 2FA Code";

        String html = buildOtpEmailTemplate(spaced);
        String plain = """
                Two-Factor Authentication

                Your EthicalJob verification code: %s
                This code expires in 5 minutes.

                If you didn’t request this, you can ignore this email.
                """.formatted(otpCode);

        sendHtml(to, subject, html, plain);
    }

    private void sendHtml(String to, String subject, String htmlBody, String plainText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(smtpFrom, "EthicalJob"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainText, htmlBody); // plain + HTML

            message.addHeader("X-SMTPAPI",
                    "{\"filters\":{\"clicktrack\":{\"settings\":{\"enable\":0}},\"opentrack\":{\"settings\":{\"enable\":0}}}}");


            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }


    /** Generic "button email" (for verify/reset) */
    private String buildHtmlEmail(String title, String actionUrl, String message) {
        return """
            <div style="font-family:Arial,sans-serif;color:#111;max-width:520px;margin:auto;line-height:1.55;">
                <h2 style="color:#3b82f6;margin:0 0 12px;">%s</h2>
                <p style="margin:0 0 16px;">%s</p>
                <div style="text-align:center;margin:26px 0;">
                    <a href="%s" style="
                        background-color:#3b82f6;
                        color:#fff;
                        padding:12px 20px;
                        border-radius:8px;
                        text-decoration:none;
                        font-weight:700;
                        display:inline-block;">
                        %s
                    </a>
                </div>
                <p style="margin:0 0 6px;">If the button doesn’t work, copy and paste this link into your browser:</p>
                <p style="word-break:break-all;margin:0;"><a href="%s" style="color:#2563eb;text-decoration:underline;">%s</a></p>
                <p style="font-size:12px;color:#777;margin:12px 0 0;">If you didn’t request this, you can safely ignore this email.</p>
            </div>
        """.formatted(title, message, actionUrl, title, actionUrl, actionUrl);
    }

    /** OTP template with 6 boxed digits */
    private String buildOtpEmailTemplate(String otpSpaced) {
        return """
            <div style="font-family:Arial,sans-serif;color:#111;max-width:520px;margin:auto;line-height:1.55;">
              <h2 style="color:#3b82f6;margin:0 0 12px;">%s</h2>
              <p style="margin:0 0 12px;">Enter this code to continue signing in to <b>EthicalJob</b>:</p>
              <div style="text-align:center;margin:20px 0;">
                <div style="display:inline-flex;gap:10px;">%s</div>
              </div>
              <p style="margin:12px 0 8px;">This code expires in <b>5 minutes</b>.</p>
              <p style="font-size:12px;color:#666;margin:0;">If you didn’t request this, you can safely ignore this email.</p>
            </div>
        """.formatted("Two-Factor Authentication", renderOtpBoxes(otpSpaced));
    }


    private String renderOtpBoxes(String otpSpaced) {
        String digits = otpSpaced.replaceAll("\\s+", ""); // "123456"
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < digits.length(); i++) {
            char c = digits.charAt(i);
            sb.append("""
                <div style="width:48px;height:56px;border:1px solid #e5e7eb;border-radius:8px;
                            display:flex;align-items:center;justify-content:center;
                            font-size:22px;font-weight:700;letter-spacing:2px;">
                  %c
                </div>
            """.formatted(c));
            if (i == 2) {
                sb.append("<div style=\"width:16px;\"></div>"); // gap between 3+3
            }
        }
        return sb.toString();
    }
}


