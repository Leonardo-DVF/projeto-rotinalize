package com.rotinalize.api.controller;

import com.rotinalize.api.dto.HabitListRequestDTO;
import com.rotinalize.api.dto.HabitListResponseDTO;
import com.rotinalize.api.dto.HabitsResponseDTO;
import com.rotinalize.api.entities.HabitList;
import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.service.HabitListService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    public HabitListController(HabitListService service) {
        this.service = service;
    }

    // GET /api/lists: LISTAR todas as listas
    // Método: list()
    @GetMapping
    public List<HabitListResponseDTO> list() {
        return service.listAll()
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
    public ResponseEntity<HabitListResponseDTO> create(@RequestBody @Valid HabitListRequestDTO body) {
        HabitList created = service.create(body);
        return ResponseEntity
                // Retorna o código 201 (Created) e a localização da nova lista
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

        return new HabitListResponseDTO(
                list.getId(),
                list.getName(),
                list.getOwnerId(),
                mappedHabits, // INCLUINDO OS HÁBITOS MAPEADOS AQUI
                list.getCreatedAt(),
                list.getUpdatedAt()
        );
    }
    private HabitsResponseDTO mapHabitToResponse(Habits h) {
        return new HabitsResponseDTO(
                h.getId(), h.getTitle(), h.getDescription(), h.getDias(), h.getDueDate(), h.getActive(),
                h.getList() != null ? h.getList().getId() : null, // Mapeia o listId
                h.getCreatedAt(), h.getUpdatedAt()
        );
    }
}