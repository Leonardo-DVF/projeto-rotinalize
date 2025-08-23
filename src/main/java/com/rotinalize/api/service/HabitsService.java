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

    // cria e persiste um novo hábito
    public Habits create(Habits h) { return repo.save(h); }

    // lista hábitos
    public List<Habits> list() { return repo.findAll(); }

    // busca hábito por ID
    public Habits get(UUID id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));
    }

    // atualiza os campos de hábitos
    public Habits update(UUID id, Habits data) {
        Habits h = get(id);          // busca o hábito existente
        h.setTitle(data.getTitle());  // atualiza título
        h.setDescription(data.getDescription()); // atualiza descrição
        h.setDias(data.getDias());    // atualiza os dias selecionados
        return repo.save(h);          // salva no banco
    }

    // exclui hábito pelo ID
    public void delete(UUID id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Hábito não encontrado");
        repo.deleteById(id);
    }
}
