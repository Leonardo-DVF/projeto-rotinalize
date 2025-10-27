package com.rotinalize.api.service;

import com.rotinalize.api.dto.UserRequestDTO;
import com.rotinalize.api.dto.UserUpdateDTO;
import com.rotinalize.api.entities.User;
import com.rotinalize.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service //
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(UserRequestDTO userData) {
        repository.findByEmail(userData.email())
                .ifPresent(u -> { throw new IllegalArgumentException("Email já cadastrado."); });

        User newUser = new User();
        newUser.setName(userData.name());
        newUser.setEmail(userData.email());
        // >>> CODIFICA A SENHA <<<
        newUser.setPassword(passwordEncoder.encode(userData.password()));

        return repository.save(newUser);
    }

    /**
     * Lista todos os usuários
     */
    public List<User> listAll() {
        return repository.findAll();
    }

    /**
     * Busca um usuário pelo seu ID
     */
    public User get(UUID id) {
        // O método .orElseThrow() lança uma exceção se o usuário não for encontrado.
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o id: " + id));
    }

    /**
     * Deleta um usuário pelo seu ID
     */
    public void delete(UUID id) {
        // Primeiro, verificamos se o usuário existe para dar uma mensagem de erro melhor
        if (!repository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado com o id: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public User update(UUID id, UserUpdateDTO dataToUpdate) {
        User existingUser = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + id));

        if (dataToUpdate.name() != null && !dataToUpdate.name().isBlank()) {
            existingUser.setName(dataToUpdate.name());
        }
        if (dataToUpdate.password() != null && !dataToUpdate.password().isBlank()) {
            // >>> CODIFICA A SENHA TAMBÉM NO UPDATE <<<
            existingUser.setPassword(passwordEncoder.encode(dataToUpdate.password()));
        }
        return repository.save(existingUser);
    }

}