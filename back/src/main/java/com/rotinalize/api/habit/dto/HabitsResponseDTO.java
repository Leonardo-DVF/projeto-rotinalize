package com.rotinalize.api.habit.dto;

import com.rotinalize.api.habit.enums.DiaSemana;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record HabitsResponseDTO(
        UUID id,
        String title,
        String description,

        List<DiaSemana> dias,
        LocalDate dueDate,
        Integer intervalDays,
        LocalDate intervalStartDate,
        LocalDate weeklyEndDate,

        Boolean active,
        UUID listId,
        UUID ownerId,
        String ownerName,
        Instant createdAt,
        Instant updatedAt
) {}