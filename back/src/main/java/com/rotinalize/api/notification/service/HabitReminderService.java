package com.rotinalize.api.notification.service;

import com.rotinalize.api.habit.model.Habits;
import com.rotinalize.api.habit.repository.HabitsRepository;
import com.rotinalize.api.user.model.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitReminderService {

    private final HabitsRepository habitsRepository;
    private final EmailService emailService;

    public HabitReminderService(HabitsRepository habitsRepository, EmailService emailService) {
        this.habitsRepository = habitsRepository;
        this.emailService = emailService;
    }

    // O CRON "0 * * * * *" significa "Execute no segundo 0 de CADA MINUTO".
    // Para produção (todo dia às 7h), use: "0 0 8 * * *"
    //@Scheduled(cron = "0 0 8 * * *")
    @Scheduled(cron = "0 * * * * *")
    @Transactional(readOnly = true) //
    public void verificarEEnviarLembretes() {
        System.out.println("⏰ Despertador tocou! Verificando hábitos...");
        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);

        // 1. Busca e envia lembretes para hábitos que vencem AMANHÃ
        List<Habits> habitosDeAmanha = habitsRepository.findByDueDate(amanha);
        for (Habits habito : habitosDeAmanha) {
            enviarNotificacao(habito, "amanhã (" + amanha + ")");
        }

        // 2. Busca e envia lembretes para hábitos que vencem HOJE
        List<Habits> habitosDeHoje = habitsRepository.findByDueDate(hoje);
        for (Habits habito : habitosDeHoje) {
            enviarNotificacao(habito, "HOJE!");
        }
    }

    private void enviarNotificacao(Habits habito, String quandoVence) {
        User dono = habito.getOwner();
        // Verifica se o dono tem email (só por segurança)
        if (dono != null && dono.getEmail() != null && !dono.getEmail().isBlank()) {
            String assunto = "Lembrete Rotinalize: " + habito.getTitle();
            String mensagem = String.format(
                    "Olá, %s!\n\nNão esqueça do seu hábito '%s', que vence %s.\n\nContinue firme!",
                    dono.getName(),
                    habito.getTitle(),
                    quandoVence
            );

            // Chama o carteiro para entregar a mensagem
            emailService.enviarEmail(dono.getEmail(), assunto, mensagem);
            System.out.println("📨 Pedido de envio feito para: " + dono.getEmail());
        }
    }
}