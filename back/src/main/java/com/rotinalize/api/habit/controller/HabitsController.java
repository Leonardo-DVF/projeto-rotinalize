package com.rotinalize.api.habit.controller;

import com.rotinalize.api.habit.dto.HabitUpdateDTO;
import com.rotinalize.api.habit.dto.HabitsRequestDTO;
import com.rotinalize.api.habit.dto.HabitsResponseDTO;
import com.rotinalize.api.habit.model.Habits;
import com.rotinalize.api.habit.service.HabitsService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearer-key")
@Tag(name = "Hábitos", description = "Gerenciamento de rotinas e hábitos")
public class HabitsController {

    private final HabitsService service;
    private final UserRepository userRepository;

    public HabitsController(HabitsService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Operation(summary = "Criar novo hábito", description = "Cria um hábito vinculado ao usuário logado")
    @ApiResponse(responseCode = "201", description = "Hábito criado com sucesso")
    public ResponseEntity<HabitsResponseDTO> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid HabitsRequestDTO body
    ) {
        UUID ownerId = resolveUserId(jwt);
        Habits created = service.create(body, ownerId);

        return ResponseEntity
                .created(URI.create("/api/habits/" + created.getId()))
                .body(mapToResponse(created));
    }

    @GetMapping
    @Operation(summary = "Listar hábitos", description = "Retorna todos os hábitos do usuário logado")
    public List<HabitsResponseDTO> list(@AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = resolveUserId(jwt);
        return service.listByOwner(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar hábito", description = "Busca um hábito específico pelo ID")
    public HabitsResponseDTO get(@PathVariable UUID id) {
        Habits habit = service.get(id);
        return mapToResponse(habit);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar hábito", description = "Atualiza os dados de um hábito existente")
    public HabitsResponseDTO update(@PathVariable UUID id, @RequestBody @Valid HabitUpdateDTO body) {
        Habits updated = service.update(id, body);
        return mapToResponse(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir hábito", description = "Remove um hábito permanentemente")
    @ApiResponse(responseCode = "204", description = "Hábito excluído com sucesso")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ... métodos privados (resolveUserId, mapToResponse) continuam iguais
    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject();
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }

    private HabitsResponseDTO mapToResponse(Habits h) {
        return new HabitsResponseDTO(
                h.getId(),
                h.getTitle(),
                h.getDescription(),
                (h.getDias() == null || h.getDias().isEmpty()) ? null : h.getDias(),
                h.getDueDate(),
                h.getIntervalDays(),
                h.getIntervalStartDate(),
                h.getWeeklyEndDate(),
                h.getActive(),
                h.getList() != null ? h.getList().getId() : null,
                h.getOwner() != null ? h.getOwner().getId() : null,
                h.getOwner() != null ? h.getOwner().getName() : null,
                h.getCreatedAt(),
                h.getUpdatedAt()
        );
    }
}