package com.lawfirm.backend.service;

import com.lawfirm.backend.dto.AuthResponseDTO;
import com.lawfirm.backend.dto.AuthUserDTO;
import com.lawfirm.backend.dto.ChangePasswordRequestDTO;
import com.lawfirm.backend.dto.LoginRequestDTO;
import com.lawfirm.backend.entity.User;
import com.lawfirm.backend.repository.UserRepository;
import com.lawfirm.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class AuthService {

    private static final Set<String> ROLE_NAMES = Set.of("Admin", "Advocate", "Staff");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmailWithRoleIgnoreCase(request.email().trim())
                .filter(candidate -> Boolean.TRUE.equals(candidate.getIsActive()))
                .filter(candidate -> passwordEncoder.matches(
                        request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        String roleName = user.getRole().getRoleName();
        if (!ROLE_NAMES.contains(roleName)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        return new AuthResponseDTO(jwtService.createToken(user), AuthUserDTO.from(user));
    }

    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequestDTO request) {
        User user = userRepository.findByIdWithRole(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user no longer exists."));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (request.newPassword() == null || request.newPassword().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New password must differ from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
