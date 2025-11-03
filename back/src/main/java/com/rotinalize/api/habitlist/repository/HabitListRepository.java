package com.rotinalize.api.habitlist.repository;

import com.rotinalize.api.habitlist.model.HabitList;
import com.rotinalize.api.user.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitListRepository extends JpaRepository<HabitList, UUID> {

    Optional<HabitList> findByOwnerAndName(User owner, String name);

    Optional<HabitList> findByName(String name);


    @Query("SELECT DISTINCT hl FROM HabitList hl " +
            "LEFT JOIN FETCH hl.owner " +
            "LEFT JOIN FETCH hl.habits h " +
            "LEFT JOIN FETCH h.owner ")
    List<HabitList> findAllWithHabits();

    @Override
    @EntityGraph(attributePaths = {"owner", "habits", "habits.owner", "habits.dias"})
    Optional<HabitList> findById(UUID id);

    // << CORREÇÃO AQUI >>: Removemos "LEFT JOIN FETCH h.dias"
    @Query("SELECT DISTINCT hl FROM HabitList hl " +
            "LEFT JOIN FETCH hl.owner o " +
            "LEFT JOIN FETCH hl.habits h " +
            "LEFT JOIN FETCH h.owner " +
            "WHERE o.id = :ownerId")
    List<HabitList> findAllByOwnerIdWithHabits(UUID ownerId);
}