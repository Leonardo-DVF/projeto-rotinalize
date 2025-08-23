package com.rotinalize.api.dto;

import com.rotinalize.api.enums.DiaSemana;
import java.util.List;

public record HabitsResponseDTO(
        String title,
        String description,
        List<DiaSemana> dias
) {}
