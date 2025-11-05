package com.rotinalize.api.habit.dto;

import com.rotinalize.api.habit.enums.DiaSemana;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record HabitsRequestDTO(
        @NotBlank(message = "O título não pode ser vazio")
        @Size(max = 80, message = "O título deve ter no máximo 80 caracteres")
        String title,

        @NotBlank(message = "A descrição não pode ser vazia")
        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
        String description,

        UUID listId,

        LocalDate dueDate,

        List<DiaSemana> dias,

        @Min(value = 1, message = "O intervalo deve ser de no mínimo 1 dia")
        Integer intervalDays,

        LocalDate intervalStartDate
) {
    @AssertTrue(message = "Apenas um tipo de recorrência pode ser definido: 'dueDate' (pontual), 'dias' (semanal), ou 'intervalDays' (intervalo).")
    public boolean isRecurrenceConsistent() {
        boolean isPontual = dueDate != null;
        boolean isSemanal = dias != null && !dias.isEmpty();
        boolean isIntervalo = intervalDays != null;

        if (isIntervalo && intervalStartDate == null) {
            return false;
        }

        if (isPontual && !isSemanal && !isIntervalo) return true;
        if (!isPontual && isSemanal && !isIntervalo) return true;
        if (!isPontual && !isSemanal && isIntervalo) return true;

        return false;
    }
}