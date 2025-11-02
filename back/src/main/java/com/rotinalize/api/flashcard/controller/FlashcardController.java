package com.rotinalize.api.flashcard.controller;

import com.rotinalize.api.flashcard.dto.FlashcardRequestDTO;
import com.rotinalize.api.flashcard.dto.FlashcardResponseDTO;
import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import com.rotinalize.api.flashcard.service.FlashcardService;
import com.rotinalize.api.flashcardDeck.service.FlashcardDeckService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final FlashcardDeckService deckService;
    private final UserRepository userRepository;

    public FlashcardController(
            FlashcardService flashcardService,
            FlashcardDeckService deckService,
            UserRepository userRepository
    ) {
        this.flashcardService = flashcardService;
        this.deckService = deckService;
        this.userRepository = userRepository;
    }

    // Criar card
    @PostMapping
    public FlashcardResponseDTO createCard(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FlashcardRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);

        // segurança: garante que o deck realmente pertence ao usuário autenticado
        deckService.getOwnedDeckOrThrow(ownerId, dto.getDeckId());

        return flashcardService.createCard(ownerId, dto);
    }

    // Listar cards do deck
    @GetMapping("/deck/{deckId}")
    public List<FlashcardResponseDTO> listCardsFromDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId
    ) {
        UUID ownerId = resolveUserId(jwt);

        // só deixa listar se o deck é dele
        deckService.getOwnedDeckOrThrow(ownerId, deckId);

        return flashcardService.listCardsFromDeck(ownerId, deckId);
    }

    // Isso significa: acabei de estudar esse card, atualiza o agendamento de estudo dele
    @PostMapping("/{cardId}/review")
    public FlashcardResponseDTO reviewCard(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cardId,
            @RequestParam("rating") DifficultyLevel rating
    ) {
        UUID ownerId = resolveUserId(jwt);

        // regra de segurança vai estar no service, mas se quiser,
        // aqui também dá pra checar se esse card pertence a um deck do dono

        return flashcardService.reviewCard(ownerId, cardId, rating);
    }

    // Editar card
    @PutMapping("/{cardId}")
    public FlashcardResponseDTO updateCard(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cardId,
            @RequestBody FlashcardRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);

        return flashcardService.updateCard(ownerId, cardId, dto);
    }

    // Deletar card
    @DeleteMapping("/{deckId}/{cardId}")
    public void deleteCardFromDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId,
            @PathVariable UUID cardId
    ) {
        UUID ownerId = resolveUserId(jwt);
        flashcardService.deleteCardFromDeck(ownerId, deckId, cardId);
    }

    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject(); // vem do JwtService.subject(authentication.getName())
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }
}
