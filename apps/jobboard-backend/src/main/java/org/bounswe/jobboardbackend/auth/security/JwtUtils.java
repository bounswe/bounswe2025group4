package org.bounswe.jobboardbackend.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component

public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationMs;

    private final UserRepository userRepository;

    public JwtUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String generateOtpToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        return JwtGenerator(userPrincipal.getUsername(), 300000, "preauth", "OTP");

    }

    public String generateAccessToken(Authentication authentication) {

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        return JwtGenerator(userPrincipal.getUsername(), jwtExpirationMs, "auth", "ACCESS");
    }

    public Authentication buildAuthenticationFromAccessToken(String token, UserDetailsService uds) {
        Claims claims = getClaims(token);
        if (!"ACCESS".equals(claims.get("purpose")) || !"auth".equals(claims.getAudience())) {
            throw new HandleException(ErrorCode.INVALID_CREDENTIALS, "Token purpose/audience invalid");
        }

        String subject = claims.getSubject();

        UserDetails userDetails = uds.loadUserByUsername(subject);

        String username = userDetails.getUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));
        if (user.getIsBanned()) {
            throw new HandleException(ErrorCode.USER_BANNED, "User is banned");
        }

        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities());
    }

    public boolean validateJwtToken(String authToken) {
        try {
            jwtParser().parseClaimsJws(authToken);
            logger.info("Valid JWT token.");
            return true;
        } catch (SignatureException ex) {
            logger.debug("Invalid JWT signature: {}", ex.getMessage());
        } catch (JwtException | IllegalArgumentException ex) {
            logger.debug("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }

    public Claims getClaims(String token) {
        return jwtParser().parseClaimsJws(token).getBody();
    }

    public boolean isAccessToken(String token) {
        Claims claim = getClaims(token);
        return "ACCESS".equals(claim.get("purpose")) && "auth".equals(claim.getAudience());
    }

    public boolean isPreauthToken(String token) {
        Claims claim = getClaims(token);
        return "OTP".equals(claim.get("purpose")) && "preauth".equals(claim.getAudience());
    }

    public String getUserNameFromJwtToken(String token) {
        return getClaims(token).getSubject();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    private String JwtGenerator(String username, int expirationTime, String audience, String purpose) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .setAudience(audience)
                .claim("purpose", purpose)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private JwtParser jwtParser() {
        return Jwts.parserBuilder().setSigningKey(key()).build();
    }
}
