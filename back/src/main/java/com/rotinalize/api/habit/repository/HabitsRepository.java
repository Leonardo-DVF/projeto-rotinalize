package com.rotinalize.api.habit.repository;

import com.rotinalize.api.habit.model.Habits;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List; // << 1. IMPORTE A LISTA
import java.util.Optional;
import java.util.UUID;

public interface HabitsRepository extends JpaRepository<Habits, UUID> {


    @Override
    @EntityGraph(attributePaths = {"owner", "dias"})
    Optional<Habits> findById(UUID id);


    @Override
    @EntityGraph(attributePaths = {"owner", "dias"})
    List<Habits> findAll();

    @EntityGraph(attributePaths = {"owner", "dias"})
    List<Habits> findAllByOwnerId(UUID ownerId);

    @EntityGraph(attributePaths = {"owner"})
    List<Habits> findByDueDate(java.time.LocalDate date);
}