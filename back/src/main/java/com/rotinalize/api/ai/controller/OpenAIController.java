package com.rotinalize.api.ai.controller;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ⚠️ CLASSE DESATIVADA TEMPORARIAMENTE
 * Motivo: Estamos rodando sem a chave da OpenAI configurada.
 * Para reativar:
 * 1. Configure a chave no application.yml ou variáveis de ambiente.
 * 2. Descomente as anotações @RestController e @RequestMapping abaixo.
 * 3. Remova o bloco de comentários (/* ... * /) que envolve o código.
 */

// @RestController // <--- COMENTADO: O Spring não vai tentar criar isso
// @RequestMapping("/chat") // <--- COMENTADO
public class OpenAIController {

    /* <--- INÍCIO DO BLOCO COMENTADO (Apague esta linha e a de baixo para voltar)

    private final ChatModel chatModel;
    private final String sysFaq;
    private final String sysFlashcards;

    public OpenAIController(
            ChatModel chatModel,
            @Value("${llm.faq.system-message:Você é um assistente de uma aplicação de lista de hábitos e servirá para tirar dúvidas e ajudar com planejamento de estudos, responda com respostas curtas. Responda em PT-BR.}") String sysFaq,
            @Value("${llm.flashcards.system-message:Você é um gerador de flashcards, você vai gerar os flashcards de acordo com temas específicos sobre estudos. Responda APENAS com JSON válido no formato {\"cards\":[{\"front\":\"...\",\"back\":\"...\"}]}. Sem texto fora do JSON.}") String sysFlashcards
    ) {
        this.chatModel = chatModel;
        this.sysFaq = sysFaq;
        this.sysFlashcards = sysFlashcards;
    }

    // --- Chat 1: Tira-dúvidas (FAQ)
    @GetMapping("/faq")
    public String faq(@RequestParam(name = "mensagem") String mensagem) {
        List<ChatMessage> messages = List.of(
                new SystemMessage(sysFaq),
                new UserMessage(mensagem)
        );
        ChatResponse resp = chatModel.chat(messages);
        return (resp != null && resp.aiMessage() != null && resp.aiMessage().text() != null)
                ? resp.aiMessage().text()
                : "";
    }

    // --- Chat 2: Gerador de Flashcards
    @GetMapping(value = "/flashcards", produces = "application/json")
    public String flashcards(@RequestParam(name = "mensagem") String mensagem) {
        List<ChatMessage> messages = List.of(
                new SystemMessage(sysFlashcards),
                new UserMessage("""
                        %s
                        Lembre-se: responda apenas com JSON válido no formato:
                        {"cards":[{"front":"...","back":"...","hint":"(opcional)","tags":["..."]}]}
                        """.formatted(mensagem))
        );
        ChatResponse resp = chatModel.chat(messages);
        return (resp != null && resp.aiMessage() != null && resp.aiMessage().text() != null)
                ? resp.aiMessage().text()
                : "{\"cards\":[]}";
    }

    FIM DO BLOCO COMENTADO --> */
}