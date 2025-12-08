package com.rotinalize.api.flashcarddeck.controller;

import com.rotinalize.api.flashcarddeck.dto.FlashcardDeckRequestDTO;
import com.rotinalize.api.flashcarddeck.dto.FlashcardDeckResponseDTO;
import com.rotinalize.api.flashcarddeck.service.FlashcardDeckService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
public class FlashcardDeckController {

    private final FlashcardDeckService deckService;
    private final UserRepository userRepository;

    public FlashcardDeckController(
            FlashcardDeckService deckService,
            UserRepository userRepository
    ) {
        this.deckService = deckService;
        this.userRepository = userRepository;
    }

    // Criar deck
    @PostMapping
    public FlashcardDeckResponseDTO createDeck(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FlashcardDeckRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.createDeck(ownerId, dto);
    }

    // Listar meus decks
    @GetMapping
    public List<FlashcardDeckResponseDTO> listMyDecks(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.listMyDecks(ownerId);
    }

    // Deletar deck específico
    @DeleteMapping("/{deckId}")
    public void deleteDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId
    ) {
        UUID ownerId = resolveUserId(jwt);
        deckService.deleteDeck(ownerId, deckId);
    }

    // Editar deck específico
    @PutMapping("/{deckId}")
    public FlashcardDeckResponseDTO updateDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId,
            @RequestBody FlashcardDeckRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.updateDeck(ownerId, deckId, dto);
    }

    // Buscar usuário autenticado
    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject();
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }
}

