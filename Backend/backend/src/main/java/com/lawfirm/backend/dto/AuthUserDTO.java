package com.lawfirm.backend.dto;

import com.lawfirm.backend.entity.User;

public record AuthUserDTO(
        Integer userId,
        String fullName,
        String email,
        String username,
        String role) {

    public static AuthUserDTO from(User user) {
        return new AuthUserDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().getRoleName());
    }
}
