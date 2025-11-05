package com.rotinalize.api.habit.dto;

import com.rotinalize.api.habit.enums.DiaSemana;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record HabitUpdateDTO(
        @Size(max = 80, message = "O título deve ter no máximo 80 caracteres")
        String title,

        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
        String description,

        List<DiaSemana> dias,

        LocalDate dueDate,

        Boolean active,

        @Min(value = 1, message = "O intervalo deve ser de no mínimo 1 dia")
        Integer intervalDays,

        LocalDate intervalStartDate
) {
    @AssertTrue(message = "Apenas um tipo de recorrência pode ser definido: 'dueDate' (pontual), 'dias' (semanal), ou 'intervalDays' (intervalo).")
    public boolean isRecurrenceConsistent() {
        int typesCount = 0;
        if (dueDate != null) typesCount++;
        if (dias != null && !dias.isEmpty()) typesCount++;
        if (intervalDays != null) typesCount++;

        if (intervalDays != null && intervalStartDate == null) {
            return false;
        }

        return typesCount <= 1;
    }
}