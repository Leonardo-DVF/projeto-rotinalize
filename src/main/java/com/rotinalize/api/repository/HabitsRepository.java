package com.rotinalize.api.repository;

import com.rotinalize.api.entities.Habits;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HabitsRepository extends JpaRepository<Habits, UUID> {}
