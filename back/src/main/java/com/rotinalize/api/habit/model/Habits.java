package com.rotinalize.api.habit.model;

import com.rotinalize.api.habit.enums.DiaSemana;
import com.rotinalize.api.habitlist.model.HabitList;
import com.rotinalize.api.user.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Habits")
@NoArgsConstructor
@Setter
@Getter
public class Habits {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id")
    private HabitList list;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "habit_dias", joinColumns = @JoinColumn(name = "habit_id"))
    @Column(name = "dia")
    @Fetch(FetchMode.SUBSELECT)
    private List<DiaSemana> dias;

    @Column(name = "due_date")
    private LocalDate dueDate;


    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "interval_start_date")
    private LocalDate intervalStartDate;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
