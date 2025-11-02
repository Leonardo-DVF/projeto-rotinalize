package com.rotinalize.api.flashcard.dto;

import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter
public class FlashcardResponseDTO {

    private UUID id;
    private UUID deckId;

    private String frontText;
    private String backText;
    private String tag;

    private int reviewCount;
    private int successCount;

    private DifficultyLevel difficultyLevel;
    private int intervalDays;
    private Instant nextReviewAt;

    private Instant createdAt;
    private Instant updatedAt;
}
