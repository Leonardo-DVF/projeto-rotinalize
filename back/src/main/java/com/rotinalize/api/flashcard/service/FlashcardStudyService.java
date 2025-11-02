package com.rotinalize.api.flashcard.service;

import com.rotinalize.api.flashcard.enums.DifficultyLevel;
import com.rotinalize.api.flashcard.model.Flashcard;
import com.rotinalize.api.flashcard.repository.FlashcardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.rotinalize.api.flashcard.enums.DifficultyLevel.BOM;
import static com.rotinalize.api.flashcard.enums.DifficultyLevel.DIFICIL;

@Service
public class FlashcardStudyService {

    private final FlashcardRepository flashcardRepository;

    public FlashcardStudyService(FlashcardRepository flashcardRepository) {
        this.flashcardRepository = flashcardRepository;
    }

    @Transactional
    public Flashcard reviewCard(Flashcard card, DifficultyLevel rating) {
        // métrica geral
        card.setReviewCount(card.getReviewCount() + 1);

        if (rating == DifficultyLevel.BOM || rating == DifficultyLevel.FACIL) {
            card.setSuccessCount(card.getSuccessCount() + 1);
        }

        // recalcula agendamento
        updateSchedule(card, rating);

        return flashcardRepository.save(card);
    }

    private void updateSchedule(Flashcard card, DifficultyLevel rating) {

        card.setDifficultyLevel(rating);

        int newIntervalDays;
        Instant next;

        switch (rating) {
            case DIFICIL -> {
                // mostrar de novo MUITO rápido
                newIntervalDays = 1;
                next = Instant.now().plus(10, ChronoUnit.MINUTES);
            }
            case BOM -> {
                // aumenta devagar: +1 dia em cima do atual
                int current = card.getIntervalDays();
                if (current < 1) current = 1;

                newIntervalDays = current + 1;
                next = Instant.now().plus(newIntervalDays, ChronoUnit.DAYS);
            }
            case FACIL -> {
                // aumenta agressivo: dobra
                int current = card.getIntervalDays();
                if (current < 1) current = 1;

                newIntervalDays = current * 2;
                if (newIntervalDays < 3) {
                    newIntervalDays = 3;
                }
                next = Instant.now().plus(newIntervalDays, ChronoUnit.DAYS);
            }
            default -> throw new IllegalStateException("Dificuldade inválida: " + rating);
        }

        card.setIntervalDays(newIntervalDays);
        card.setNextReviewAt(next);
    }
}
