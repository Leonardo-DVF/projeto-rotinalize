package com.rotinalize.api.repository;

import com.rotinalize.api.entities.HabitList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitListRepository extends JpaRepository<HabitList, UUID> {
    // use se tiver multiusuário (ownerId)
    Optional<HabitList> findByOwnerIdAndName(UUID ownerId, String name);

    // se não tiver ownerId, pode usar esta alternativa no service:
    Optional<HabitList> findByName(String name);

    // NOVO MÉTODO: Força o JPA a trazer os hábitos junto com a lista (EAGER fetching)
    @Query("SELECT hl FROM HabitList hl JOIN FETCH hl.habits")
    List<HabitList> findAllWithHabits();
}
