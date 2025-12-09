package com.rotinalize.api.user.controller;

import com.rotinalize.api.security.AuthenticationService;
import com.rotinalize.api.user.dto.UserRequestDTO;
import com.rotinalize.api.user.dto.UserResponseDTO;
import com.rotinalize.api.user.dto.UserUpdateDTO;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Usuários", description = "Gestão de usuários e autenticação")
public class UserController {

    private final UserService service;
    private final AuthenticationService authenticationService;

    public UserController(UserService service, AuthenticationService authenticationService) {
        this.service = service;
        this.authenticationService = authenticationService;
    }

    // Cadastrar usuário (Público)
    @PostMapping
    @Operation(summary = "Cadastrar novo usuário", description = "Cria uma conta de usuário no sistema (Endpoint público)")
    @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso")
    public ResponseEntity<UserResponseDTO> create(@RequestBody @Valid UserRequestDTO body) {
        User createdUser = service.create(body);
        UserResponseDTO response = mapToResponse(createdUser);

        return ResponseEntity
                .created(URI.create("/api/users/" + createdUser.getId()))
                .body(response);
    }

    // Login usuário (Público - Usa Basic Auth)
    @PostMapping("authenticate")
    @Operation(summary = "Autenticar (Login)", description = "Recebe credenciais (Basic Auth) e retorna um token JWT válido")
    @ApiResponse(responseCode = "200", description = "Autenticação realizada com sucesso (Token retornado)")
    public String authenticate(Authentication authentication) {
        return authenticationService.authenticate(authentication);
    }

    // Listar usuários (Protegido)
    @GetMapping
    @SecurityRequirement(name = "bearer-key")
    @Operation(summary = "Listar todos os usuários", description = "Retorna a lista completa de usuários cadastrados")
    public List<UserResponseDTO> list() {
        return service.listAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Buscar usuário pelo ID (Protegido)
    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna os detalhes de um usuário específico")
    public UserResponseDTO get(@PathVariable UUID id) {
        User user = service.get(id);
        return mapToResponse(user);
    }

    // Deleta usuário pelo ID (Protegido)
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    @Operation(summary = "Excluir usuário", description = "Remove um usuário do sistema pelo ID")
    @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    // Atualiza usuario pelo ID (Protegido
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    @Operation(summary = "Atualizar usuário", description = "Atualiza os dados cadastrais de um usuário existente")
    public ResponseEntity<UserResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid UserUpdateDTO body) {
        User updatedUser = service.update(id, body);
        return ResponseEntity.ok(mapToResponse(updatedUser));
    }


    private UserResponseDTO mapToResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}