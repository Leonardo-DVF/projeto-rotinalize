package com.rotinalize.api.habitlist.model;


import com.rotinalize.api.habit.model.Habits;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.rotinalize.api.user.model.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "habit_list",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_owner_name", columnNames = {"user_id", "name"})
        }
)
@Getter @Setter @NoArgsConstructor
public class HabitList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // << ADICIONE ESTAS DUAS LINHAS
    private User owner;

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
