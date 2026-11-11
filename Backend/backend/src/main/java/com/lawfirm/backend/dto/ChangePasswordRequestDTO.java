package com.lawfirm.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequestDTO(
        @NotBlank String currentPassword,
        @NotBlank String newPassword) {
}
