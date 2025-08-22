package com.rotinalize.api.dto;

import com.rotinalize.api.enums.DiaSemana;
import com.rotinalize.api.enums.DiaSemana;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record HabitsRequestDTO(
        @NotNull(message = "O título não pode ser nulo")
        @NotEmpty(message = "O título não pode ser vazio")
        String title,

        @NotNull(message = "A descrição não pode ser nula")
        @NotEmpty(message = "A descrição não pode ser vazia")
        String description,

        List<DiaSemana> dias
) {}
