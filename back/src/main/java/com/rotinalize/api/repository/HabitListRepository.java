package com.rotinalize.api.repository;



import com.rotinalize.api.entities.HabitList;
import com.rotinalize.api.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitListRepository extends JpaRepository<HabitList, UUID> {

    Optional<HabitList> findByOwnerAndName(User owner, String name);

    Optional<HabitList> findByName(String name);

    // O @Fetch(FetchMode.SUBSELECT) na entidade Habits cuidará disso.
    @Query("SELECT DISTINCT hl FROM HabitList hl " +
            "LEFT JOIN FETCH hl.owner " +
            "LEFT JOIN FETCH hl.habits h " +
            "LEFT JOIN FETCH h.owner ")
    List<HabitList> findAllWithHabits();

    @Override
    @EntityGraph(attributePaths = {"owner", "habits", "habits.owner", "habits.dias"})
    Optional<HabitList> findById(UUID id);
}