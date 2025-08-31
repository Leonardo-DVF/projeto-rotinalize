package com.rotinalize.api.service;

import com.rotinalize.api.dto.HabitsRequestDTO;
import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.repository.HabitsRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HabitsService {
    private final HabitsRepository repo;

    public HabitsService(HabitsRepository repo) { this.repo = repo; }

    // cria e persiste um novo hábito
    @Transactional
    public Habits create(HabitsRequestDTO body) {
        Habits h = new Habits();
        h.setTitle(body.title().trim());
        h.setDescription(body.description().trim());

        boolean temData = body.dueDate() != null;
        boolean temDias = body.dias() != null && !body.dias().isEmpty();

        if (temData == temDias) {
            throw new IllegalArgumentException("Informe dias OU dueDate.");
        }

        if (temData) {
            h.setDueDate(body.dueDate());
            h.setDias(null);
        } else {
            h.setDueDate(null);
            h.setDias(body.dias());
        }

        return repo.save(h);
    }

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
