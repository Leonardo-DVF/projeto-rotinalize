package com.rotinalize.api.notification.service;

import com.rotinalize.api.habit.model.Habits;
import com.rotinalize.api.habit.repository.HabitsRepository;
import com.rotinalize.api.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitReminderService {

    // Criação do objeto de log para esta classe
    private static final Logger log = LoggerFactory.getLogger(HabitReminderService.class);

    private final HabitsRepository habitsRepository;
    private final EmailService emailService;

    public HabitReminderService(HabitsRepository habitsRepository, EmailService emailService) {
        this.habitsRepository = habitsRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "${app.reminder.cron}")
    @Transactional(readOnly = true)
    public void verificarEEnviarLembretes() {
        log.info("⏰ Despertador tocou! Verificando hábitos...");

        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);

        log.info("📅 Data considerada HOJE pelo sistema: {}", hoje);

        List<Habits> habitosDeAmanha = habitsRepository.findByDueDate(amanha);

        log.info("🔎 Encontrados {} hábitos para amanhã ({})", habitosDeAmanha.size(), amanha);

        for (Habits habito : habitosDeAmanha) {
            enviarNotificacao(habito, "amanhã (" + amanha + ")");
        }

        List<Habits> habitosDeHoje = habitsRepository.findByDueDate(hoje);

        log.info("🔎 Encontrados {} hábitos para HOJE ({})", habitosDeHoje.size(), hoje);

        for (Habits habito : habitosDeHoje) {
            enviarNotificacao(habito, "HOJE!");
        }
    }

    private void enviarNotificacao(Habits habito, String quandoVence) {
        User dono = habito.getOwner();

        if (dono != null && dono.getEmail() != null && !dono.getEmail().isBlank()) {
            String assunto = "Lembrete Rotinalize: " + habito.getTitle();
            String mensagem = String.format(
                    "Olá, %s!\n\nNão esqueça do seu hábito '%s', que vence %s.\n\nContinue firme!",
                    dono.getName(),
                    habito.getTitle(),
                    quandoVence
            );

            emailService.enviarEmail(dono.getEmail(), assunto, mensagem);
            log.info("📨 Email de lembrete enviado para: {}", dono.getEmail());
        } else {
            log.warn("⚠️ Tentativa de envio falhou: Usuário ou email inválido para o hábito ID: {}", habito.getId());
        }
    }
}