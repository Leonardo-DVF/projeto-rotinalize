package com.rotinalize.api.dto;

import com.rotinalize.api.enums.DiaSemana;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record HabitsResponseDTO(
        UUID id,
        String title,
        String description,
        List<DiaSemana> dias,  // presente quando for recorrente
        LocalDate dueDate,     // presente quando for pontual
        Boolean active,
        UUID listId,           // ID da lista (se houver)
        UUID ownerId,          // ID do dono (novo)
        String ownerName,      // Nome do dono (novo e opcional)
        Instant createdAt,
        Instant updatedAt
) {}