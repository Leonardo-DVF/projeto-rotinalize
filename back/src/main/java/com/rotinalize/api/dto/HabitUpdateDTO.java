package com.rotinalize.api.dto;

import com.rotinalize.api.enums.DiaSemana;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

// Este DTO representa os dados que PODEM ser atualizados em um hábito.
// Nenhum campo é @NotBlank, pois todos são opcionais.
public record HabitUpdateDTO(
        @Size(max = 80, message = "O título deve ter no máximo 80 caracteres")
        String title,

        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
        String description,

        List<DiaSemana> dias,

        LocalDate dueDate,

        Boolean active
) {

    @AssertTrue(message = "Informe 'dias' OU 'dueDate' (não ambos).")
    public boolean isRecurrenceConsistent() {
        // Se o usuário não enviou nenhum dos dois, está tudo bem (ele não quer mudar a data).
        if (dias == null && dueDate == null) {
            return true;
        }


        boolean temDias = dias != null && !dias.isEmpty();
        boolean temData = dueDate != null;

        return temDias ^ temData;
    }
}