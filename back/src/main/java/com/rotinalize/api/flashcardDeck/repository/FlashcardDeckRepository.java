package com.rotinalize.api.flashcardDeck.repository;

import com.rotinalize.api.flashcardDeck.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, UUID> {

    // listar todos os decks que pertencem a um usuário específico
    List<FlashcardDeck> findByOwnerId(UUID ownerId);

    // buscar um deck específico garantindo que ele pertence a esse usuário
    Optional<FlashcardDeck> findByIdAndOwnerId(UUID deckId, UUID ownerId);
}
