package com.rotinalize.api.entities;

import com.rotinalize.api.enums.DiaSemana;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ElementCollection(targetClass = DiaSemana.class,fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "habit_dias", joinColumns = @JoinColumn(name = "habit_id"))
    @Column(name = "dia")
    private List<DiaSemana> dias;

}
