package com.lawfirm.backend;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.backend.entity.Role;
import com.lawfirm.backend.entity.User;
import com.lawfirm.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthSecurityTests {

    @Test
    void jwtIncludesTheExactRoleClaim() {
        User user = userWithRole("Advocate");
        JwtService jwtService = new JwtService("test-secret-with-at-least-32-characters");

        DecodedJWT decoded = jwtService.verify(jwtService.createToken(user));

        assertEquals("Advocate", decoded.getClaim("role").asString());
        assertEquals("17", decoded.getSubject());
    }

    @Test
    void bcryptRejectsExistingNonBcryptHashValues() {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        assertTrue(passwordEncoder.matches("new-password", passwordEncoder.encode("new-password")));
        assertFalse(passwordEncoder.matches("new-password", "legacy-hash-value-24char"));
    }

    @Test
    void userResponsesDoNotSerializeThePasswordHash() {
        User user = userWithRole("Staff");
        user.setPasswordHash("must-not-be-serialized");

        JsonNode json = new ObjectMapper().valueToTree(user);

        assertFalse(json.has("passwordHash"));
        assertFalse(json.toString().contains("must-not-be-serialized"));
        assertEquals("Staff", json.at("/role/roleName").asText());
    }

    private User userWithRole(String roleName) {
        Role role = new Role();
        role.setRoleName(roleName);

        User user = new User();
        user.setUserId(17);
        user.setFullName("Test User");
        user.setEmail("test@example.invalid");
        user.setUsername("test-user");
        user.setRole(role);
        return user;
    }
}
