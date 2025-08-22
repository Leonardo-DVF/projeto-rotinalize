package com.rotinalize.api.service;

import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.repository.HabitsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HabitsService {
    private final HabitsRepository repo;

    public HabitsService(HabitsRepository repo) { this.repo = repo; }

    public Habits create(Habits h) { return repo.save(h); }

    public List<Habits> list() { return repo.findAll(); }

    public Habits get(UUID id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));
    }

    public Habits update(UUID id, Habits data) {
        Habits h = get(id);
        h.setTitle(data.getTitle());
        h.setDescription(data.getDescription());
        return repo.save(h);
    }

    public void delete(UUID id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Hábito não encontrado");
        repo.deleteById(id);
    }
}
