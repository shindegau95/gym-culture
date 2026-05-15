package in.vis.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String name,
        String email,
        String phone
) {}
