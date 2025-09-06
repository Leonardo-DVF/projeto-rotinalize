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

    // atalho sem ownerId
    @Transactional
    public Habits create(HabitsRequestDTO body) {
        return create(body, null);
    }

    // cria e persiste um novo hábito (com ownerId opcional)
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

        // defesa extra: não aceitar listId e newListName juntos
        if (body.listId() != null && body.newListName() != null && !body.newListName().isBlank()) {
            throw new IllegalArgumentException("Informe apenas listId ou newListName, nunca ambos.");
        }

        HabitList list = resolveList(body, ownerId);
        h.setList(list);

        return repo.save(h);
    }

    private HabitList resolveList(HabitsRequestDTO dto, UUID ownerId) {
        String name = dto.newListName() != null ? dto.newListName().trim() : null;
        boolean hasName = name != null && !name.isBlank();

        // nenhum campo de lista enviado -> sem lista
        if (dto.listId() == null && !hasName) return null;

        // listId informado -> busca e valida
        if (dto.listId() != null) {
            return listRepo.findById(dto.listId())
                    .orElseThrow(() -> new IllegalArgumentException("Lista não encontrada."));
        }

        // criar/reciclar por nome
        if (ownerId != null) {
            return listRepo.findByOwnerIdAndName(ownerId, name)
                    .orElseGet(() -> {
                        HabitList nova = new HabitList();
                        nova.setName(name);
                        nova.setOwnerId(ownerId);
                        return listRepo.save(nova);
                    });
        } else {
            // sem ownerId: evita duplicar listas com mesmo nome
            return listRepo.findByName(name)
                    .orElseGet(() -> {
                        HabitList nova = new HabitList();
                        nova.setName(name);
                        return listRepo.save(nova);
                    });
        }
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
