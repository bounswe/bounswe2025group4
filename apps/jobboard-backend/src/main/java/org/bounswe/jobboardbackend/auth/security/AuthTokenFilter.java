package org.bounswe.jobboardbackend.auth.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bounswe.jobboardbackend.auth.service.UserDetailsServiceImpl;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = parseJwt(request);

            if (StringUtils.hasText(token) && jwtUtils.validateJwtToken(token)) {

                if (!jwtUtils.isAccessToken(token)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                Authentication authentication = jwtUtils.buildAuthenticationFromAccessToken(token, userDetailsService);

                if (authentication instanceof org.springframework.security.authentication.AbstractAuthenticationToken aat) {
                    aat.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                }

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (ExpiredJwtException e) {
            SecurityContextHolder.clearContext();
            throw new CredentialsExpiredException("JWT expired", e);
        } catch (UnsupportedJwtException | MalformedJwtException e) {
            SecurityContextHolder.clearContext();
            throw new BadCredentialsException("Malformed JWT", e);
        } catch (SignatureException e) {
            SecurityContextHolder.clearContext();
            throw new BadCredentialsException("Invalid JWT signature", e);
        } finally {
            filterChain.doFilter(request, response);
        }

    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
