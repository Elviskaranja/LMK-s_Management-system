package com.lawfirm.backend.controller;

import com.lawfirm.backend.dto.AuthResponseDTO;
import com.lawfirm.backend.dto.AuthUserDTO;
import com.lawfirm.backend.dto.ChangePasswordRequestDTO;
import com.lawfirm.backend.dto.LoginRequestDTO;
import com.lawfirm.backend.security.AuthenticatedUser;
import com.lawfirm.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthUserDTO me(@AuthenticationPrincipal AuthenticatedUser user) {
        return new AuthUserDTO(
                user.userId(),
                user.fullName(),
                user.email(),
                user.username(),
                user.roleName());
    }

    @PutMapping("/change-password")
    public void changePassword(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        authService.changePassword(user.userId(), request);
    }
}
