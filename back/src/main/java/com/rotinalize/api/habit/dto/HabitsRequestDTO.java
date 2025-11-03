package com.rotinalize.api.habit.dto;

import com.rotinalize.api.habit.enums.DiaSemana;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
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

        // modo pontual
        @FutureOrPresent(message = "A data deve ser hoje ou futura")
        LocalDate dueDate,

        // modo recorrente
        List<DiaSemana> dias,

        // para usar lista já existente
        UUID listId

) {
    // validação de consistência: dias OU dueDate (não ambos e nem nenhum)
    @AssertTrue(message = "Informe dias da semana OU dueDate (não ambos e nem nenhum).")
    public boolean isRecurrenceConsistent() {
        boolean temDias = dias != null && !dias.isEmpty();
        boolean temData = dueDate != null;
        return temDias ^ temData; // XOR
    }
}
