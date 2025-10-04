package com.rotinalize.api.service;

import com.rotinalize.api.dto.HabitsRequestDTO;
import com.rotinalize.api.entities.HabitList;
import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.repository.HabitListRepository;
import com.rotinalize.api.repository.HabitsRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HabitsService {
    private final HabitsRepository repo;
    private final HabitListRepository listRepo;

    public HabitsService(HabitsRepository repo, HabitListRepository listRepo) {
        this.repo = repo;
        this.listRepo = listRepo;
    }

    // cria hábito
    @Transactional
    public Habits create(HabitsRequestDTO body) {
        return create(body, null);
    }

    // verifica se é hábito semana ou mês
    @Transactional
    public Habits create(HabitsRequestDTO body, UUID ownerId) {
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

        if (body.listId() != null && body.newListName() != null && !body.newListName().isBlank()) {
            throw new IllegalArgumentException("Informe apenas listId ou newListName, nunca ambos.");
        }

        HabitList list = resolveList(body);
        h.setList(list);

        return repo.save(h);
    }

    private HabitList resolveList(HabitsRequestDTO dto) {
        // Se o usuário não enviou listId, o hábito fica sem lista
        if (dto.listId() == null) return null;

        // Se o usuário enviou listId, busca e valida.
        return listRepo.findById(dto.listId())
                .orElseThrow(() -> new IllegalArgumentException("Lista não encontrada."));
    }

    // lista hábitos
    public List<Habits> list() { return repo.findAll(); }

    // busca hábito por ID
    public Habits get(UUID id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));
    }

    // atualiza os campos de hábitos
    @Transactional
    public Habits update(UUID id, Habits data) {
        Habits existing = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));

        existing.setTitle(data.getTitle());
        existing.setDescription(data.getDescription());
        existing.setDias(data.getDias());
        existing.setDueDate(data.getDueDate());
        existing.setActive(data.getActive());
        // se quiser, aqui você pode permitir mover o hábito de lista:
        // existing.setList(data.getList());

        return repo.save(existing);
    }

    // exclui hábito pelo ID
    @Transactional
    public void delete(UUID id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Hábito não encontrado");
        repo.deleteById(id);
    }
}
