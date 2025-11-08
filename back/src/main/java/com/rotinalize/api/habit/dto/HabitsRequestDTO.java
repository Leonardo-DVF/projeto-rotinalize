package com.rotinalize.api.habit.dto;

import com.rotinalize.api.habit.enums.DiaSemana;
import jakarta.validation.constraints.AssertTrue;
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

        LocalDate intervalStartDate,

        LocalDate weeklyEndDate
) {
    @AssertTrue(message = "Informe dias OU dueDate (não ambos). Se mandar weeklyEndDate, precisa mandar dias.")
    public boolean isRecurrenceConsistent() {
        boolean temDias = dias != null && !dias.isEmpty();
        boolean temData = dueDate != null;
        boolean temFim  = weeklyEndDate != null;
        // dias XOR dueDate, e se tiver fim, tem que ter dias
        return (temDias ^ temData) && (!temFim || temDias);
    }
}