package com.rotinalize.api.flashcarddeck.controller;

import com.rotinalize.api.flashcarddeck.dto.FlashcardDeckRequestDTO;
import com.rotinalize.api.flashcarddeck.dto.FlashcardDeckResponseDTO;
import com.rotinalize.api.flashcarddeck.service.FlashcardDeckService;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearer-key")
@Tag(name = "Decks (Baralhos)", description = "Gerenciamento de baralhos de flashcards")
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

    @PostMapping
    @Operation(summary = "Criar deck", description = "Cria um novo baralho de flashcards para o usuário logado")
    @ApiResponse(responseCode = "200", description = "Deck criado com sucesso")
    public FlashcardDeckResponseDTO createDeck(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FlashcardDeckRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.createDeck(ownerId, dto);
    }

    @GetMapping
    @Operation(summary = "Listar meus decks", description = "Retorna todos os baralhos do usuário autenticado")
    public List<FlashcardDeckResponseDTO> listMyDecks(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.listMyDecks(ownerId);
    }

    @DeleteMapping("/{deckId}")
    @Operation(summary = "Excluir deck", description = "Remove um baralho e todos os seus cards")
    @ApiResponse(responseCode = "204", description = "Deck excluído com sucesso")
    public void deleteDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId
    ) {
        UUID ownerId = resolveUserId(jwt);
        deckService.deleteDeck(ownerId, deckId);
    }

    @PutMapping("/{deckId}")
    @Operation(summary = "Atualizar deck", description = "Edita o título ou descrição de um baralho existente")
    public FlashcardDeckResponseDTO updateDeck(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deckId,
            @RequestBody FlashcardDeckRequestDTO dto
    ) {
        UUID ownerId = resolveUserId(jwt);
        return deckService.updateDeck(ownerId, deckId, dto);
    }

    private UUID resolveUserId(Jwt jwt) {
        String username = jwt.getSubject();
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
        return user.getId();
    }
}