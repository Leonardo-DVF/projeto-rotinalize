package com.rotinalize.api.flashcard.model;

import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import com.rotinalize.api.flashcardDeck.model.FlashcardDeck;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "flashcard")
@Getter @Setter @NoArgsConstructor
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    // frente card (pergunta)
    @Column(name = "front_text", nullable = false, length = 500)
    private String frontText;

    // verso card (resposta)
    @Column(name = "back_text", nullable = false, length = 2000)
    private String backText;

    // tag sobre assunto/categoria
    @Column(length = 60)
    private String tag;

    // flashcards pertencem a um deck
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "deck_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_card_deck")
    )
    private FlashcardDeck deck;

    // vezes que o card foi revisado
    @Column(nullable = false)
    private int reviewCount = 0;

    // quantas vezes acertei o card
    @Column(nullable = false)
    private int successCount = 0;

    // dificuldade do card
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false, length = 20)
    private DifficultyLevel difficultyLevel = DifficultyLevel.BOM;

    // intervalo até a próxima revisão (dias)
    @Column(name = "interval_days", nullable = false)
    private int intervalDays = 1;

    // quando esse card deve voltar a aparecer pro usuário
    @Column(name = "next_review_at")
    private Instant nextReviewAt;

    // data de criação
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // data de atualização
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;

        // se ninguém definiu ainda, o card é "para revisar agora"
        if (nextReviewAt == null) {
            nextReviewAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}