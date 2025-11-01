package com.rotinalize.api.user.dto;

import jakarta.validation.constraints.Size;

// O usuário pode querer mudar só o nome, ou só a senha.
public record UserUpdateDTO(
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String name,

        @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
        String password
) {}