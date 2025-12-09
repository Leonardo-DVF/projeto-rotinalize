package com.rotinalize.api.flashcard.controller;

import com.rotinalize.api.flashcard.dto.FlashcardRequestDTO;
import com.rotinalize.api.flashcard.dto.FlashcardResponseDTO;
import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import com.rotinalize.api.flashcard.service.FlashcardService;
import com.rotinalize.api.flashcarddeck.service.FlashcardDeckService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearer-key")
@Tag(name = "Flashcards (Estudos)", description = "Gestão de cartões e algoritmo de Repetição Espaçada (SRS)")
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
    @Operation(summary = "Criar Flashcard", description = "Adiciona um novo cartão de estudo a um baralho existente")
    @ApiResponse(responseCode = "200", description = "Cartão criado com sucesso")
    public FlashcardResponseDTO createCard(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FlashcardRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);

        // segurança: garante que o deck realmente pertence ao usuário autenticado
        deckService.getOwnedDeckOrThrow(ownerId, dto.getDeckId());

        return flashcardService.createCard(ownerId, dto);
    }

    // Cards para estudar agora (ALGORITMO SRS)
    @GetMapping("/review-today")
    @Operation(summary = "Obter revisão diária (SRS)", description = "Retorna apenas os cartões que precisam ser revisados hoje, baseado no algoritmo de repetição espaçada")
    public List<FlashcardResponseDTO> getCardsToReviewToday(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerId = resolveUserId(jwt);
        return flashcardService.getDueCards(ownerId);
    }

    // Listar cards do deck
    @GetMapping("/deck/{deckId}")
    @Operation(summary = "Listar cartões de um baralho", description = "Retorna todos os cartões vinculados a um deck específico")
    public List<FlashcardResponseDTO> listCardsFromDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId
    ) {
        UUID ownerId = resolveUserId(jwt);

        // só deixa listar se o deck é dele
        deckService.getOwnedDeckOrThrow(ownerId, deckId);

        return flashcardService.listCardsFromDeck(ownerId, deckId);
    }

    // Avaliar estudo (ALGORITMO SRS)
    @PostMapping("/{cardId}/review")
    @Operation(summary = "Avaliar estudo (Registrar revisão)", description = "Atualiza o algoritmo SRS. Baseado na dificuldade escolhida (FACIL, BOM, DIFICIL), o sistema calcula a próxima data de revisão.")
    public FlashcardResponseDTO reviewCard(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cardId,
            @Parameter(description = "Nível de dificuldade sentido pelo usuário ao estudar o cartão") // Explica o parametro
            @RequestParam("rating") DifficultyLevel rating
    ) {
        UUID ownerId = resolveUserId(jwt);

        return flashcardService.reviewCard(ownerId, cardId, rating);
    }

    // Editar card
    @PutMapping("/{cardId}")
    @Operation(summary = "Atualizar Flashcard", description = "Edita o conteúdo (frente/verso) de um cartão existente")
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
    @Operation(summary = "Excluir Flashcard", description = "Remove permanentemente um cartão de um baralho")
    @ApiResponse(responseCode = "204", description = "Cartão excluído com sucesso") // Documenta que não retorna conteúdo
    public void deleteCardFromDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId,
            @PathVariable UUID cardId
    ) {
        UUID ownerId = resolveUserId(jwt);
        flashcardService.deleteCardFromDeck(ownerId, deckId, cardId);
    }

    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject();
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }
}