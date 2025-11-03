package com.rotinalize.api.habitlist.controller;

import com.rotinalize.api.habit.dto.HabitsResponseDTO;
import com.rotinalize.api.habit.model.Habits;
import com.rotinalize.api.habitlist.dto.HabitListRequestDTO;
import com.rotinalize.api.habitlist.dto.HabitListResponseDTO;
import com.rotinalize.api.habitlist.model.HabitList;
import com.rotinalize.api.habitlist.service.HabitListService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
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
@RequestMapping("/api/lists")
@CrossOrigin(origins = "http://localhost:5173")
public class HabitListController {

    private final HabitListService service;
    private final UserRepository userRepository;

    public HabitListController(HabitListService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    // GET /api/lists: LISTAR todas as listas
    // Método: list()
    @GetMapping
    public List<HabitListResponseDTO> list(@AuthenticationPrincipal Jwt jwt) {
        // Pega o ID do usuário "logado" a partir do token JWT
        UUID ownerId = resolveUserId(jwt);

        // Chama o novo método do serviço, passando o ID do dono
        return service.listAllByOwner(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // GET /api/lists/{id}: BUSCAR uma lista específica por ID
    // Método: get(UUID id)
    @GetMapping("/{id}")
    public HabitListResponseDTO get(@PathVariable UUID id) {
        HabitList list = service.get(id);
        return mapToResponse(list);
    }

    // POST /api/lists: CRIAR uma nova lista
    // Método: create(HabitListRequestDTO body)
    @PostMapping
    public ResponseEntity<HabitListResponseDTO> create(
            @AuthenticationPrincipal Jwt jwt, // << 1. LER O TOKEN
            @RequestBody @Valid HabitListRequestDTO body // << 2. USA O DTO SIMPLIFICADO
    ) {
        // 3. Descobre quem é o dono a partir do token
        UUID ownerId = resolveUserId(jwt);

        // 4. Chama o novo método do serviço
        HabitList created = service.create(body, ownerId);

        return ResponseEntity
                .created(URI.create("/api/lists/" + created.getId()))
                .body(mapToResponse(created));
    }

    // Deletar lista
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Método auxiliar para converter HabitList (Entidade do banco) em HabitListResponseDTO (Saída da API)
    private HabitListResponseDTO mapToResponse(HabitList list) {
        // Mapeia a lista de hábitos da Entidade para a Lista de DTOs
        List<HabitsResponseDTO> mappedHabits = list.getHabits().stream()
                .map(this::mapHabitToResponse)
                .collect(Collectors.toList());

        UUID ownerId = (list.getOwner() != null) ? list.getOwner().getId() : null;
        return new HabitListResponseDTO(
                list.getId(),
                list.getName(),
                ownerId,
                mappedHabits, // INCLUINDO OS HÁBITOS MAPEADOS AQUI
                list.getCreatedAt(),
                list.getUpdatedAt()
        );
    }
    private HabitsResponseDTO mapHabitToResponse(Habits h) {
        return new HabitsResponseDTO(
                h.getId(),
                h.getTitle(),
                h.getDescription(),
                h.getDias(),
                h.getDueDate(),
                h.getActive(),
                h.getList() != null ? h.getList().getId() : null, // Mapeia o listId
                h.getOwner() != null ? h.getOwner().getId() : null,   // Pega o ID do dono
                h.getOwner() != null ? h.getOwner().getName() : null, // Pega o Nome do dono
                h.getCreatedAt(),
                h.getUpdatedAt()
        );
    }
    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject();
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }
}