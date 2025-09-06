package com.rotinalize.api.repository;

import com.rotinalize.api.entities.HabitList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HabitListRepository extends JpaRepository<HabitList, UUID> {
    // use se tiver multiusuário (ownerId)
    Optional<HabitList> findByOwnerIdAndName(UUID ownerId, String name);

    // se não tiver ownerId, pode usar esta alternativa no service:
    Optional<HabitList> findByName(String name);
}
