package com.rotinalize.api.dto;

import java.time.Instant;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        Instant createdAt
) {}