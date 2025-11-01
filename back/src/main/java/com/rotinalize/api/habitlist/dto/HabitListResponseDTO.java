package com.rotinalize.api.habitlist.dto;

import com.rotinalize.api.habit.dto.HabitsResponseDTO;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record HabitListResponseDTO(
        UUID id,
        String name,
        UUID ownerId,
        List<HabitsResponseDTO> habits,
        Instant createdAt,
        Instant updatedAt

) {}