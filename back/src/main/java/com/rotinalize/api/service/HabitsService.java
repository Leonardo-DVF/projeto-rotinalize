package com.rotinalize.api.service;

import com.rotinalize.api.dto.HabitUpdateDTO;
import com.rotinalize.api.dto.HabitsRequestDTO;
import com.rotinalize.api.entities.HabitList;
import com.rotinalize.api.entities.Habits;
import com.rotinalize.api.entities.User;
import com.rotinalize.api.repository.HabitListRepository;
import com.rotinalize.api.repository.HabitsRepository;
import com.rotinalize.api.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class HabitsService {
    private final HabitsRepository habitsRepo;
    private final HabitListRepository listRepo;
    private final UserRepository userRepo;

    public HabitsService(HabitsRepository habitsRepo, HabitListRepository listRepo, UserRepository userRepo) {
        this.habitsRepo = habitsRepo;
        this.listRepo = listRepo;
        this.userRepo = userRepo; // A atribuição correta
    }


    @Transactional
    public Habits create(HabitsRequestDTO body) {
        Habits newHabit = new Habits();
        newHabit.setTitle(body.title().trim());
        newHabit.setDescription(body.description().trim());

        // Lógica de recorrência
        if (body.dueDate() != null) {
            newHabit.setDueDate(body.dueDate());
        } else {
            newHabit.setDias(body.dias());
        }

        // Lógica de Dono e Lista
        if (body.listId() != null) {
            // Cenário 1: Hábito pertence a uma lista.
            HabitList list = listRepo.findById(body.listId())
                    .orElseThrow(() -> new EntityNotFoundException("A lista de hábitos informada não foi encontrada."));

            newHabit.setList(list);
            newHabit.setOwner(list.getOwner()); // O dono do hábito é o dono da lista.
        } else {
            // Cenário 2: Hábito é isolado.
            User owner = userRepo.findById(body.userId())
                    .orElseThrow(() -> new EntityNotFoundException("O usuário informado não foi encontrado."));

            newHabit.setOwner(owner); // Associa o hábito diretamente ao usuário.
            newHabit.setList(null); // Garante que não há lista associada.
        }

        return habitsRepo.save(newHabit);
    }

    // O resto dos métodos que já estavam corretos
    public List<Habits> list() {
        return habitsRepo.findAll();
    }

    public Habits get(UUID id) {
        return habitsRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));
    }

    @Transactional
    public Habits update(UUID id, HabitUpdateDTO dataToUpdate) {
        // 1. Busca o hábito que já existe
        Habits existing = habitsRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));

        // 2. Lógica de atualização opcional: só muda se o usuário enviou o dado
        if (dataToUpdate.title() != null && !dataToUpdate.title().isBlank()) {
            existing.setTitle(dataToUpdate.title());
        }
        if (dataToUpdate.description() != null && !dataToUpdate.description().isBlank()) {
            existing.setDescription(dataToUpdate.description());
        }
        if (dataToUpdate.active() != null) {
            existing.setActive(dataToUpdate.active());
        }

        // 3. Lógica de recorrência
        if (dataToUpdate.dias() != null) {
            existing.setDias(dataToUpdate.dias());
            existing.setDueDate(null); // Garante a consistência
        } else if (dataToUpdate.dueDate() != null) {
            existing.setDias(null); // Garante a consistência
            existing.setDueDate(dataToUpdate.dueDate());
        }
        // Se ambos forem nulos no DTO, o código não entra aqui e a recorrência antiga é mantida.

        return habitsRepo.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        if (!habitsRepo.existsById(id)) throw new EntityNotFoundException("Hábito não encontrado");
        habitsRepo.deleteById(id);
    }
}