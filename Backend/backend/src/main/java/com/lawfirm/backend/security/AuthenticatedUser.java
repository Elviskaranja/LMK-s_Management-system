package com.lawfirm.backend.security;

public record AuthenticatedUser(
        Integer userId,
        String fullName,
        String email,
        String username,
        String roleName) {

    public boolean isAdvocate() {
        return "Advocate".equals(roleName);
    }
}
