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

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
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
    @JoinColumn(name = "user_id", nullable = false) // Todo hábito DEVE ter um dono
    private User owner;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "habit_dias", joinColumns = @JoinColumn(name = "habit_id"))
    @Column(name = "dia")
    @Fetch(FetchMode.SUBSELECT)
    private List<DiaSemana> dias;

    // data específica (modo "pontual")
    @Column(name = "due_date")
    @FutureOrPresent(message = "A data deve ser hoje ou futura")
    private LocalDate dueDate;

    // auditoria da criação e da modificação
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

    // validação de consistência
    @AssertTrue(message = "Informe dias da semana ou a data (não ambos e nem nenhum).")
    public boolean isRecurrenceConsistent() {
        boolean temDias = dias != null && !dias.isEmpty();
        boolean temData = dueDate != null;
        return temDias ^ temData;
    }
}