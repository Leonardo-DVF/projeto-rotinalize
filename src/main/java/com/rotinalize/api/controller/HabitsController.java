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
    public List<Habits> list() { return service.list(); }

    @GetMapping("/{id}")
    public Habits get(@PathVariable UUID id) { return service.get(id); }

    @PutMapping("/{id}")
    public Habits update(@PathVariable UUID id, @RequestBody Habits body) {
        return service.update(id, body);
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
