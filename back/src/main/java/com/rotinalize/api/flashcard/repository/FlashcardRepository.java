package com.rotinalize.api.flashcard.repository;
import com.rotinalize.api.flashcard.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {

    // listar todos os cards de um deck específico
    List<Flashcard> findByDeckIdAndDeckOwnerId(UUID deckId, UUID ownerId);

    // achar 1 card específico dentro de 1 deck específico do mesmo dono
    Optional<Flashcard> findByIdAndDeckIdAndDeckOwnerId(UUID cardId, UUID deckId, UUID ownerId);

    // buscar deck por id
    Optional <Flashcard> findByDeckId(UUID deckId);

    // próximos cards para estudo
    List<Flashcard> findByDeckOwnerIdAndNextReviewAtBefore(UUID ownerId, Instant now);

}