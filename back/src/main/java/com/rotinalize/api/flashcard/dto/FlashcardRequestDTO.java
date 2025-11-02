package com.rotinalize.api.flashcard.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
public class FlashcardRequestDTO {

    private UUID deckId;      // em qual deck eu quero criar esse card
    private String frontText; // frente card
    private String backText;  // verso card
    private String tag;       // opcional (categoria)
}