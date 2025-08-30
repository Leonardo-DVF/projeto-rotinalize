package com.rotinalize.api.controller;

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
public class HabitsController {

    private final HabitsService service;

    public HabitsController(HabitsService service) { this.service = service; }

    // criar tarefa
    @PostMapping
    public ResponseEntity<HabitsResponseDTO> create(@RequestBody @Valid HabitsRequestDTO body) {
        Habits habit = new Habits();
        habit.setTitle(body.title().trim());
        habit.setDescription(body.description().trim());

        // XOR: se vier dueDate, não usa dias; se vier dias, não usa dueDate
        if (body.dueDate() != null) {
            habit.setDueDate(body.dueDate());
            habit.setDias(null);
        } else {
            // trata dias vazios como null
            var dias = (body.dias() == null || body.dias().isEmpty()) ? null : body.dias();
            habit.setDias(dias);
            habit.setDueDate(null);
        }

        Habits created = service.create(habit);
        return ResponseEntity
                .created(URI.create("/api/habits/" + created.getId()))
                .body(mapToResponse(created));
    }


/*    // listar tarefas
    @GetMapping
    public List<HabitsResponseDTO> list() {
        return service.list()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // buscar tarefa
    @GetMapping("/{id}")
    public Habits get(@PathVariable UUID id) { return service.get(id); }

    // editar tarefa
    @PutMapping("/{id}")
    public HabitsResponseDTO update(@PathVariable UUID id, @RequestBody @Valid HabitsRequestDTO body) {
        Habits data = new Habits();
        data.setTitle(body.title());
        data.setDescription(body.description());
        data.setDias(body.dias());

        Habits updated = service.update(id, data);
        return mapToResponse(updated);
    }

    // deletar tarefa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();

    }*/

    // transforma a sua entidade JPA Habits (modelo de banco) no DTO HabitsResponseDTO (modelo de saída da API) antes de devolver a resposta HTTP
    private HabitsResponseDTO mapToResponse(Habits h) {
        return new HabitsResponseDTO(
                h.getId(),
                h.getTitle(),
                h.getDescription(),
                (h.getDias() == null || h.getDias().isEmpty()) ? null : h.getDias(), // null se vazio
                h.getDueDate(),                                                      // null quando recorrente
                h.getActive(),
                h.getCreatedAt(),
                h.getUpdatedAt()
        );
    }

}
