package com.rotinalize.api.flashcard.service;

import com.rotinalize.api.flashcard.dto.FlashcardRequestDTO;
import com.rotinalize.api.flashcard.dto.FlashcardResponseDTO;
import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import com.rotinalize.api.flashcard.model.Flashcard;
import com.rotinalize.api.flashcardDeck.model.FlashcardDeck;
import com.rotinalize.api.flashcardDeck.repository.FlashcardDeckRepository;
import com.rotinalize.api.flashcard.repository.FlashcardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardDeckRepository deckRepository;

    public FlashcardService(
            FlashcardRepository flashcardRepository,
            FlashcardDeckRepository deckRepository
    ) {
        this.flashcardRepository = flashcardRepository;
        this.deckRepository = deckRepository;
    }

    // Criar card
    @Transactional
    public FlashcardResponseDTO createCard(UUID ownerId, FlashcardRequestDTO dto) {

        // garantir que esse deck pertence MESMO ao usuário autenticado
        FlashcardDeck deck = deckRepository.findByIdAndOwnerId(dto.getDeckId(), ownerId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado ou não pertence ao usuário"));

        // montar entidade
        Flashcard card = new Flashcard();
        card.setDeck(deck);
        card.setFrontText(dto.getFrontText());
        card.setBackText(dto.getBackText());
        card.setTag(dto.getTag());

        // estado inicial de estudo
        card.setReviewCount(0);
        card.setSuccessCount(0);
        card.setDifficultyLevel(DifficultyLevel.BOM); // default neutro
        card.setIntervalDays(1); // 1 dia até revisar de novo
        card.setNextReviewAt(Instant.now()); // começa já disponível pra estudar

        card.setCreatedAt(Instant.now());
        card.setUpdatedAt(Instant.now());

        Flashcard saved = flashcardRepository.save(card);

        return toResponseDTO(saved);
    }

    // Lista todos os cards de um deck específico, garantindo que
    @Transactional(readOnly = true)
    public List<FlashcardResponseDTO> listCardsFromDeck(UUID ownerId, UUID deckId) {

        // 1. garantir que o deck pertence ao usuário
        FlashcardDeck deck = deckRepository.findByIdAndOwnerId(deckId, ownerId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado ou não pertence ao usuário"));

        // 2. buscar TODOS os cards desse deck, mas só se esse deck é do dono certo
        List<Flashcard> cards = flashcardRepository.findByDeckIdAndDeckOwnerId(
                deck.getId(),
                ownerId
        );

        // 3. montar resposta
        return cards.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Deletar Card de um deck específico
    @Transactional
    public void deleteCardFromDeck(UUID ownerId, UUID deckId, UUID cardId) {
        // 1. valida se o deck existe e é do usuário
        FlashcardDeck deck = deckRepository.findByIdAndOwnerId(deckId, ownerId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado ou não pertence ao usuário"));

        // 2. busca o card garantindo que:
        //    - é o card certo
        //    - está nesse deck
        //    - e esse deck é do mesmo dono logado
        Flashcard card = flashcardRepository
                .findByIdAndDeckIdAndDeckOwnerId(cardId, deck.getId(), ownerId)
                .orElseThrow(() -> new RuntimeException("Card não encontrado nesse deck ou você não é o dono"));

        // 3. deleta
        flashcardRepository.delete(card);
    }


    @Transactional
    public FlashcardResponseDTO reviewCard(UUID ownerId, UUID cardId, DifficultyLevel rating) {

        Flashcard card = getOwnedCardOrThrow(ownerId, cardId);

        // total de revisões
        card.setReviewCount(card.getReviewCount() + 1);

        // só conta como "acertou" se não foi difícil
        if (rating != DifficultyLevel.DIFICIL) {
            card.setSuccessCount(card.getSuccessCount() + 1);
        }

        // aplica a dificuldade escolhida pelo usuário
        card.setDifficultyLevel(rating);

        // calcula o novo intervalo
        int newIntervalDays = calculateNextInterval(card.getIntervalDays(), rating);

        card.setIntervalDays(newIntervalDays);

        // próxima revisão é agora + newIntervalDays dias
        Instant next = Instant.now().plus(newIntervalDays, ChronoUnit.DAYS);
        card.setNextReviewAt(next);

        card.setUpdatedAt(Instant.now());

        Flashcard saved = flashcardRepository.save(card);
        return toResponseDTO(saved);
    }

    @Transactional
    public FlashcardResponseDTO updateCard(UUID ownerId, UUID cardId, FlashcardRequestDTO dto) {

        Flashcard card = getOwnedCardOrThrow(ownerId, cardId);

        // Se quiser impedir mover card para outro deck via update,
        // NÃO atualize o deck aqui. Se quiser permitir "mover de deck",
        // você teria que validar se o novo deck também pertence ao dono.
        if (dto.getFrontText() != null) {
            card.setFrontText(dto.getFrontText());
        }
        if (dto.getBackText() != null) {
            card.setBackText(dto.getBackText());
        }
        if (dto.getTag() != null) {
            card.setTag(dto.getTag());
        }

        card.setUpdatedAt(Instant.now());

        Flashcard saved = flashcardRepository.save(card);
        return toResponseDTO(saved);
    }

    @Transactional
    public void deleteCard(UUID ownerId, UUID cardId) {

        Flashcard card = getOwnedCardOrThrow(ownerId, cardId);
        flashcardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    protected Flashcard getOwnedCardOrThrow(UUID ownerId, UUID cardId) {
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card não encontrado"));

        // valida se o dono do deck é o mesmo user
        UUID deckOwnerId = card.getDeck().getOwner().getId();
        if (!deckOwnerId.equals(ownerId)) {
            throw new RuntimeException("Acesso negado: este card não pertence ao usuário");
        }

        return card;
    }

    private int calculateNextInterval(int currentInterval, DifficultyLevel rating) {
        return switch (rating) {
            case DIFICIL -> 1;
            case BOM -> {
                int next = currentInterval + 1;
                yield Math.max(next, 2);
            }
            case FACIL -> {
                int next = currentInterval * 2;
                yield Math.max(next, 5);
            }
        };
    }

    /**
     * Converte entidade -> DTO de resposta para mandar pro front/Postman.
     */
    private FlashcardResponseDTO toResponseDTO(Flashcard card) {
        FlashcardResponseDTO dto = new FlashcardResponseDTO();
        dto.setId(card.getId());
        dto.setDeckId(card.getDeck().getId());
        dto.setFrontText(card.getFrontText());
        dto.setBackText(card.getBackText());
        dto.setTag(card.getTag());

        dto.setReviewCount(card.getReviewCount());
        dto.setSuccessCount(card.getSuccessCount());
        dto.setDifficultyLevel(card.getDifficultyLevel());
        dto.setIntervalDays(card.getIntervalDays());
        dto.setNextReviewAt(card.getNextReviewAt());

        dto.setCreatedAt(card.getCreatedAt());
        dto.setUpdatedAt(card.getUpdatedAt());

        return dto;
    }
}