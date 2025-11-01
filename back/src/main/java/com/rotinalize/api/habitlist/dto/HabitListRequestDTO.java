package com.rotinalize.api.habitlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record HabitListRequestDTO(
        @NotBlank(message = "O nome da lista não pode ser vazio")
        @Size(max = 80, message = "O nome da lista deve ter no máximo 80 caracteres")
        String name,

        @NotNull(message = "O ID do usuário é obrigatório")
        UUID userId
) {}