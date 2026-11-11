package com.lawfirm.backend.dto;

public record AuthResponseDTO(String token, AuthUserDTO user) {
}
