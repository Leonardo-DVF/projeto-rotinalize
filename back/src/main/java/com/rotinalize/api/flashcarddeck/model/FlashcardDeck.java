package com.rotinalize.api.flashcardDeck.model;

import com.rotinalize.api.flashcard.model.Flashcard;
import com.rotinalize.api.user.model.User;
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
        name = "flashcard_deck",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_deck_owner_title",
                        columnNames = {"owner_id", "title"}
                )
        }
)
@Getter @Setter @NoArgsConstructor
public class FlashcardDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String title; // Ex: "Spring Security", "Inglês Verbos", "Bancos de Dados"

    @Column(length = 500)
    private String description;

    // Dono do deck
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "owner_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_deck_owner")
    )
    private User owner;

    // Cards que fazem parte deste deck
    @OneToMany(
            mappedBy = "deck",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Flashcard> cards = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

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

    public void addCard(Flashcard card) {
        cards.add(card);
        card.setDeck(this);
    }

    public void removeCard(Flashcard card) {
        cards.remove(card);
        card.setDeck(null);
    }
}
