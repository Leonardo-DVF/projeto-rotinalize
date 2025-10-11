package com.rotinalize.api.service;

import com.rotinalize.api.dto.UserRequestDTO;
import com.rotinalize.api.entities.User;
import com.rotinalize.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service //
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }


    public User create(UserRequestDTO userData) {
        // Verifica se o email já existe antes de criar
        Optional<User> existingUser = repository.findByEmail(userData.email());
        if (existingUser.isPresent()) {
            // Lança uma exceção se o email já estiver em uso.
            //
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        User newUser = new User();
        newUser.setName(userData.name());
        newUser.setEmail(userData.email());
        // ATENÇÃO: Por enquanto, salvamos a senha como texto puro.
        newUser.setPassword(userData.password());

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
}