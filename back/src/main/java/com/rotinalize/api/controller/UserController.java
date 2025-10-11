package com.rotinalize.api.controller;

import com.rotinalize.api.dto.UserRequestDTO;
import com.rotinalize.api.dto.UserResponseDTO;
import com.rotinalize.api.entities.User;
import com.rotinalize.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody @Valid UserRequestDTO body) {
        User createdUser = service.create(body);
        UserResponseDTO response = mapToResponse(createdUser);

        return ResponseEntity
                .created(URI.create("/api/users/" + createdUser.getId()))
                .body(response);
    }


    @GetMapping
    public List<UserResponseDTO> list() {
        return service.listAll().stream()
                .map(this::mapToResponse) // Converte cada User da lista para UserResponseDTO
                .collect(Collectors.toList());
    }


    @GetMapping("/{id}")
    public UserResponseDTO get(@PathVariable UUID id) {
        User user = service.get(id);
        return mapToResponse(user);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // Retorna status 204 No Content
    }

    /**
     * Método auxiliar para converter a entidade User no DTO de resposta.
     * Garante que a senha NUNCA seja enviada na resposta da API.
     */
    private UserResponseDTO mapToResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}