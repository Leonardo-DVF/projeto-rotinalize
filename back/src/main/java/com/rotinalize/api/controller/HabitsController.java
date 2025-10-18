package com.rotinalize.api.controller;

import com.rotinalize.api.dto.HabitUpdateDTO;
import com.rotinalize.api.dto.HabitsRequestDTO;
import com.rotinalize.api.dto.HabitsResponseDTO;
import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.service.HabitsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173") // <— permita o front do Vite
public class HabitsController {

    private final HabitsService service;

    public HabitsController(HabitsService service) { this.service = service; }

    // criar tarefa
    @PostMapping
    public ResponseEntity<HabitsResponseDTO> create(@RequestBody @Valid HabitsRequestDTO body) {
        Habits created = service.create(body);
        return ResponseEntity
                .created(URI.create("/api/habits/" + created.getId()))
                .body(mapToResponse(created));
    }

    // listar tarefas
    @GetMapping
    public List<HabitsResponseDTO> list() {
        return service.list()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // buscar tarefa
    @GetMapping("/{id}")
    public HabitsResponseDTO get(@PathVariable UUID id) {
        Habits habit = service.get(id);
        return mapToResponse(habit); // Usa o mapeador!
    }

    // editar tarefa
    @PutMapping("/{id}")
    public HabitsResponseDTO update(@PathVariable UUID id, @RequestBody @Valid HabitUpdateDTO body) {
        Habits updated = service.update(id, body);
        return mapToResponse(updated);
    }


    // deletar tarefa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();

    }

    // transforma a sua entidade JPA Habits (modelo de banco) no DTO HabitsResponseDTO (modelo de saída da API) antes de devolver a resposta HTTP
    private HabitsResponseDTO mapToResponse(Habits h) {
        return new HabitsResponseDTO(
                h.getId(),
                h.getTitle(),
                h.getDescription(),
                (h.getDias() == null || h.getDias().isEmpty()) ? null : h.getDias(),
                h.getDueDate(),
                h.getActive(),
                h.getList() != null ? h.getList().getId() : null,
                h.getOwner() != null ? h.getOwner().getId() : null,       // Pega o ID do dono
                h.getOwner() != null ? h.getOwner().getName() : null,   // Pega o Nome do dono
                h.getCreatedAt(),
                h.getUpdatedAt()
        );
    }

}
