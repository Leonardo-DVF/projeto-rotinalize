package com.rotinalize.api.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "habit_list",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_owner_name", columnNames = {"owner_id", "name"})
        }
)
@Getter @Setter @NoArgsConstructor
public class HabitList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    // opcional: use se for multiusuário
    @Column(name = "owner_id")
    private UUID ownerId;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Habits> habits = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
