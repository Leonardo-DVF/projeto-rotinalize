package com.rotinalize.api.dto;

import com.rotinalize.api.enums.DiaSemana;
import java.util.List;
import java.util.UUID;

public record HabitsResponseDTO(
        String title,
        String description,
        List<DiaSemana> dias
) {}
