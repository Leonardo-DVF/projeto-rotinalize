package com.rotinalize.api.habit.service;

import com.rotinalize.api.habit.dto.HabitUpdateDTO;
import com.rotinalize.api.habit.dto.HabitsRequestDTO;
import com.rotinalize.api.habitlist.model.HabitList;
import com.rotinalize.api.habit.model.Habits;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.habitlist.repository.HabitListRepository;
import com.rotinalize.api.habit.repository.HabitsRepository;
import com.rotinalize.api.user.repository.UserRepository;
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
        this.userRepo = userRepo;
    }

    @Transactional
    public Habits create(HabitsRequestDTO body, UUID ownerId) {
        Habits newHabit = new Habits();
        newHabit.setTitle(body.title().trim());
        newHabit.setDescription(body.description().trim());

        if (body.dias() != null && !body.dias().isEmpty()) {
            newHabit.setDias(body.dias());
            newHabit.setDueDate(null);
            newHabit.setIntervalDays(null);
            newHabit.setIntervalStartDate(null);
        } else if (body.dueDate() != null) {
            newHabit.setDias(null);
            newHabit.setDueDate(body.dueDate());
            newHabit.setIntervalDays(null);
            newHabit.setIntervalStartDate(null);
        } else if (body.intervalDays() != null) {
            newHabit.setDias(null);
            newHabit.setDueDate(null);
            newHabit.setIntervalDays(body.intervalDays());
            newHabit.setIntervalStartDate(body.intervalStartDate());
        }

        if (body.listId() != null) {
            HabitList list = listRepo.findById(body.listId())
                    .orElseThrow(() -> new EntityNotFoundException("A lista de hábitos informada não foi encontrada."));

            if (!list.getOwner().getId().equals(ownerId)) {
                throw new SecurityException("Você não tem permissão para adicionar hábitos a esta lista.");
            }
            newHabit.setList(list);
            newHabit.setOwner(list.getOwner());
        } else {
            User owner = userRepo.findById(ownerId)
                    .orElseThrow(() -> new EntityNotFoundException("O usuário informado não foi encontrado."));
            newHabit.setOwner(owner);
            newHabit.setList(null);
        }
        return habitsRepo.save(newHabit);
    }

    public List<Habits> listByOwner(UUID ownerId) {
        return habitsRepo.findAllByOwnerId(ownerId);
    }

    public Habits get(UUID id) {
        return habitsRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));
    }

    @Transactional
    public Habits update(UUID id, HabitUpdateDTO dataToUpdate) {
        Habits existing = habitsRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hábito não encontrado"));

        if (dataToUpdate.title() != null && !dataToUpdate.title().isBlank()) {
            existing.setTitle(dataToUpdate.title());
        }
        if (dataToUpdate.description() != null && !dataToUpdate.description().isBlank()) {
            existing.setDescription(dataToUpdate.description());
        }
        if (dataToUpdate.active() != null) {
            existing.setActive(dataToUpdate.active());
        }

        if (dataToUpdate.dias() != null && !dataToUpdate.dias().isEmpty()) {
            existing.setDias(dataToUpdate.dias());
            existing.setDueDate(null);
            existing.setIntervalDays(null);
            existing.setIntervalStartDate(null);
        } else if (dataToUpdate.dueDate() != null) {
            existing.setDias(null);
            existing.setDueDate(dataToUpdate.dueDate());
            existing.setIntervalDays(null);
            existing.setIntervalStartDate(null);
        } else if (dataToUpdate.intervalDays() != null) {
            existing.setDias(null);
            existing.setDueDate(null);
            existing.setIntervalDays(dataToUpdate.intervalDays());
            existing.setIntervalStartDate(dataToUpdate.intervalStartDate());
        }

        return habitsRepo.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        if (!habitsRepo.existsById(id)) {
            throw new EntityNotFoundException("Hábito não encontrado");
        }
        habitsRepo.deleteById(id);
    }
}