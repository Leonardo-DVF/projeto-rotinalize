package com.rotinalize.api.user.controller;

import com.rotinalize.api.user.dto.UserRequestDTO;
import com.rotinalize.api.user.dto.UserUpdateDTO;
import com.rotinalize.api.user.dto.UserResponseDTO;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.security.AuthenticationService;
import com.rotinalize.api.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final AuthenticationService authenticationService;

    public UserController(UserService service, AuthenticationService authenticationService) {
        this.service = service;
        this.authenticationService = authenticationService;
    }

    //Cadastrar usuário
    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody @Valid UserRequestDTO body) {
        User createdUser = service.create(body);
        UserResponseDTO response = mapToResponse(createdUser);

        return ResponseEntity
                .created(URI.create("/api/users/" + createdUser.getId()))
                .body(response);
    }

    //Login usuário
    @PostMapping("authenticate")
    public String authenticate(
            Authentication authentication) {
        return authenticationService.authenticate(authentication);
    }

    //Listar usuários
    @GetMapping
    public List<UserResponseDTO> list() {
        return service.listAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //Buscar usuário pelo ID
    @GetMapping("/{id}")
    public UserResponseDTO get(@PathVariable UUID id) {
        User user = service.get(id);
        return mapToResponse(user);
    }

    //Deleta usuário pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // Retorna status 204 No Content
    }

    //Atualiza usuário
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid UserUpdateDTO body) {
        User updatedUser = service.update(id, body);
        return ResponseEntity.ok(mapToResponse(updatedUser));
    }

    //Converter a entidade User no DTO de resposta
    private UserResponseDTO mapToResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}