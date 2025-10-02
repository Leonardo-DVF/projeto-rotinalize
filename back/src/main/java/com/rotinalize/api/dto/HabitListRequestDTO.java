package com.rotinalize.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HabitListRequestDTO(
        @NotBlank(message = "O nome da lista não pode ser vazio")
        @Size(max = 80, message = "O nome da lista deve ter no máximo 80 caracteres")
        String name
) {}