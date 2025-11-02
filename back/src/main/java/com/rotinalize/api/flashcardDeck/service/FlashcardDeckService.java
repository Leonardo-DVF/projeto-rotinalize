package com.rotinalize.api.flashcardDeck.service;

import com.rotinalize.api.flashcardDeck.dto.FlashcardDeckRequestDTO;
import com.rotinalize.api.flashcardDeck.dto.FlashcardDeckResponseDTO;
import com.rotinalize.api.flashcardDeck.model.FlashcardDeck;
import com.rotinalize.api.flashcardDeck.repository.FlashcardDeckRepository;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FlashcardDeckService {

    private final FlashcardDeckRepository deckRepository;
    private final UserRepository userRepository;

    public FlashcardDeckService(
            FlashcardDeckRepository deckRepository,
            UserRepository userRepository
    ) {
        this.deckRepository = deckRepository;
        this.userRepository = userRepository;
    }

    // Criar um deck
    @Transactional
    public FlashcardDeckResponseDTO createDeck(UUID ownerId, FlashcardDeckRequestDTO dto) {
        // busca o usuário dono
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        FlashcardDeck deck = new FlashcardDeck();
        deck.setOwner(owner);
        deck.setTitle(dto.getTitle());
        deck.setDescription(dto.getDescription());

        FlashcardDeck saved = deckRepository.save(deck);

        // retorna como response DTO
        return toResponseDTO(saved);
    }

    // Listar meus decks
    @Transactional(readOnly = true)
    public List<FlashcardDeckResponseDTO> listMyDecks(UUID ownerId) {
        return deckRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Editar um deck
    @Transactional
    public FlashcardDeckResponseDTO updateDeck(UUID ownerId, UUID deckId, FlashcardDeckRequestDTO dto) {
        // 1. garantir que o deck existe e pertence a esse usuário
        FlashcardDeck deck = deckRepository.findByIdAndOwnerId(deckId, ownerId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado ou não pertence ao usuário"));

        // 2. atualizar apenas os campos que você permite editar
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            deck.setTitle(dto.getTitle());
        }

        if (dto.getDescription() != null) {
            deck.setDescription(dto.getDescription());
        }

        // updatedAt vai ser preenchido pelo @PreUpdate da entidade (se você tiver)
        FlashcardDeck saved = deckRepository.save(deck);

        // 3. retornar como DTO de resposta
        return toResponseDTO(saved);
    }

    // Buscar deck específico
    @Transactional(readOnly = true)
    public FlashcardDeck getOwnedDeckOrThrow(UUID ownerId, UUID deckId) {
        return deckRepository.findByIdAndOwnerId(deckId, ownerId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado ou não pertence ao usuário"));
    }

    // Deletar deck
    @Transactional
    public void deleteDeck(UUID ownerId, UUID deckId) {
        FlashcardDeck deck = getOwnedDeckOrThrow(ownerId, deckId);
        deckRepository.delete(deck);
    }

    // Converte entidade -> DTO de resposta pra retornar pro front
    private FlashcardDeckResponseDTO toResponseDTO(FlashcardDeck deck) {
        FlashcardDeckResponseDTO dto = new FlashcardDeckResponseDTO();
        dto.setId(deck.getId());
        dto.setTitle(deck.getTitle());
        dto.setDescription(deck.getDescription());
        dto.setCreatedAt(deck.getCreatedAt());
        dto.setUpdatedAt(deck.getUpdatedAt());

        return dto;
    }
}
