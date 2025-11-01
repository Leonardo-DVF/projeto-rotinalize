package com.rotinalize.api.user.dto;

import java.time.Instant;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        Instant createdAt

) {}