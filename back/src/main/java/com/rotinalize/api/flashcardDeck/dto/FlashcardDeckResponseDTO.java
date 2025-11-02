package com.rotinalize.api.flashcardDeck.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class FlashcardDeckResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
