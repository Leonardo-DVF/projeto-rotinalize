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

    @PostMapping
    public ResponseEntity<HabitsResponseDTO> create(@RequestBody @Valid HabitsRequestDTO body) {
        Habits habit = new Habits();
        habit.setTitle(body.title());
        habit.setDescription(body.description());
        habit.setDias(body.dias());

        Habits created = service.create(habit);

        HabitsResponseDTO response = mapToResponse(created);
        return ResponseEntity
                .created(URI.create("/api/habits/" + created.getId()))
                .body(response);
    }

    @GetMapping
    public List<HabitsResponseDTO> list() {
        return service.list()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Habits get(@PathVariable UUID id) { return service.get(id); }

    @PutMapping("/{id}")
    public HabitsResponseDTO update(@PathVariable UUID id, @RequestBody @Valid HabitsRequestDTO body) {
        Habits data = new Habits();
        data.setTitle(body.title());
        data.setDescription(body.description());
        data.setDias(body.dias());

        Habits updated = service.update(id, data);
        return mapToResponse(updated);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();

    }

    private HabitsResponseDTO mapToResponse(Habits habit) {
        return new HabitsResponseDTO(
                habit.getTitle(),
                habit.getDescription(),
                habit.getDias()
        );
    }
}
