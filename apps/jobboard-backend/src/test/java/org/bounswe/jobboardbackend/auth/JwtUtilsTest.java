package org.bounswe.jobboardbackend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.bounswe.jobboardbackend.auth.security.JwtUtils;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the {@link JwtUtils} class.
 * These tests are updated to match the specific implementation using HS256,
 * Base64 secrets, and custom claims like "purpose" and "audience".
 */
@ExtendWith(MockitoExtension.class)
public class JwtUtilsTest {

    @InjectMocks
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetailsImpl userDetails;

    @Mock
    private UserDetailsService userDetailsService;

    private final String testSecretBase64 = "VGVzdFNlY3JldEtleUZvckp3dFV0aWxzVW5pdFRlc3RzVGhhdElzTG9uZ0Vub3VnaA==";
    private final Key testKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(testSecretBase64));
    private final int testExpirationMs = 60000;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", testSecretBase64);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);

    }

    @Test
    @DisplayName("Should generate a valid Access Token")
    void testGenerateAccessToken_Success() {

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");

        String token = jwtUtils.generateAccessToken(authentication);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
        assertTrue(jwtUtils.isAccessToken(token));
        assertFalse(jwtUtils.isPreauthToken(token));

        Claims claims = jwtUtils.getClaims(token);
        assertEquals("auth", claims.getAudience());
        assertEquals("ACCESS", claims.get("purpose"));
    }

    @Test
    @DisplayName("Should generate a valid OTP Token")
    void testGenerateOtpToken_Success() {

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");

        String token = jwtUtils.generateOtpToken(authentication);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("testuser", jwtUtils.getUserNameFromJwtToken(token));
        assertFalse(jwtUtils.isAccessToken(token));
        assertTrue(jwtUtils.isPreauthToken(token));

        Claims claims = jwtUtils.getClaims(token);
        assertEquals("preauth", claims.getAudience());
        assertEquals("OTP", claims.get("purpose"));
    }

    @Test
    @DisplayName("Should build Authentication from a valid Access Token")
    void testBuildAuthenticationFromAccessToken_Success() {

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        String token = jwtUtils.generateAccessToken(authentication);

        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);

        Authentication resultAuth = jwtUtils.buildAuthenticationFromAccessToken(token, userDetailsService);

        assertNotNull(resultAuth);
        assertEquals(userDetails, resultAuth.getPrincipal());
        assertTrue(resultAuth.isAuthenticated());
    }

    @Test
    @DisplayName("Should fail to build Authentication from an OTP Token")
    void testBuildAuthentication_WrongPurpose() {

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        String otpToken = jwtUtils.generateOtpToken(authentication);

        HandleException exception = assertThrows(HandleException.class, () -> jwtUtils.buildAuthenticationFromAccessToken(otpToken, userDetailsService));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getCode());
        assertEquals("Token purpose/audience invalid", exception.getMessage());
    }

    @Test
    @DisplayName("Should fail to build Authentication from a token with wrong audience")
    void testBuildAuthentication_WrongAudience() {

        String badToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + testExpirationMs))
                .setAudience("wrong-audience") // <-- The error
                .claim("purpose", "ACCESS")
                .signWith(testKey, SignatureAlgorithm.HS256)
                .compact();

        HandleException exception = assertThrows(HandleException.class, () -> jwtUtils.buildAuthenticationFromAccessToken(badToken, userDetailsService));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getCode());
    }

    @Test
    @DisplayName("Should fail validation for an invalid signature")
    void testValidateToken_InvalidSignature() {

        Key badKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode("QW5vdGhlclNlY3JldEtleUZvclRlc3RpbmdQdXJwb3Nlcw=="));

        String badToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + testExpirationMs))
                .signWith(badKey, SignatureAlgorithm.HS256)
                .compact();

        boolean isValid = jwtUtils.validateJwtToken(badToken);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should fail validation for an expired Access Token")
    void testValidateToken_ExpiredAccessToken() {

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");

        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000);
        String expiredToken = jwtUtils.generateAccessToken(authentication);

        boolean isValid = jwtUtils.validateJwtToken(expiredToken);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should fail validation for an expired OTP Token")
    void testValidateToken_ExpiredOtpToken() {

        Date now = new Date();
        Date issuedAt = new Date(now.getTime() - 301000);
        Date expiredAt = new Date(now.getTime() - 1000);

        String expiredOtpToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(issuedAt)
                .setExpiration(expiredAt)
                .setAudience("preauth")
                .claim("purpose", "OTP")
                .signWith(testKey, SignatureAlgorithm.HS256)
                .compact();

        boolean isValid = jwtUtils.validateJwtToken(expiredOtpToken);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should fail validation for a malformed token")
    void testValidateToken_MalformedToken() {

        String malformedToken = "not.a.real.token";

        boolean isValid = jwtUtils.validateJwtToken(malformedToken);

        assertFalse(isValid);
    }
}