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

        LocalDate intervalStartDate,

        LocalDate weeklyEndDate
) {
    @AssertTrue(message = "Se enviar weeklyEndDate, envie também dias (modo semanal). E informe dias OU dueDate (não ambos).")
    public boolean isRecurrenceConsistent() {
        // se nada for enviado (nenhuma mudança de datas), está ok
        if (dias == null && dueDate == null && weeklyEndDate == null) return true;

        boolean temDias = dias != null && !dias.isEmpty();
        boolean temData = dueDate != null;
        boolean temFim  = weeklyEndDate != null;

        return (temDias ^ temData) && (!temFim || temDias);
    }
}
