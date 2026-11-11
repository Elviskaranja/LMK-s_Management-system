package com.lawfirm.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.lawfirm.backend.entity.User;
import com.lawfirm.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Set<String> ROLE_NAMES = Set.of("Admin", "Advocate", "Staff");

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            authenticate(authorization.substring(7));
        }

        filterChain.doFilter(request, response);
    }

    private void authenticate(String token) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        try {
            DecodedJWT jwt = jwtService.verify(token);
            Integer userId = Integer.valueOf(jwt.getSubject());
            User user = userRepository.findByIdWithRole(userId).orElse(null);
            if (user == null || !Boolean.TRUE.equals(user.getIsActive())) {
                return;
            }

            String roleName = user.getRole().getRoleName();
            if (!ROLE_NAMES.contains(roleName) || !roleName.equals(jwt.getClaim("role").asString())) {
                return;
            }

            AuthenticatedUser principal = new AuthenticatedUser(
                    user.getUserId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getUsername(),
                    roleName);
            String authority = switch (roleName) {
                case "Admin" -> "ROLE_ADMIN";
                case "Advocate" -> "ROLE_ADVOCATE";
                case "Staff" -> "ROLE_STAFF";
                default -> throw new IllegalStateException("Unsupported role.");
            };
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal, null, List.of(new SimpleGrantedAuthority(authority)));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JWTVerificationException | NumberFormatException exception) {
            SecurityContextHolder.clearContext();
        }
    }
}
