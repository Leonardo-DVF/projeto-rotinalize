package com.rotinalize.api.controller;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class OpenAIController {

    private final ChatModel chatModel;
    private final String systemMessage;

    public OpenAIController(
            ChatModel chatModel,
            @Value("${llm.system-message: você é um assistente virtual.}")
            String systemMessage
    ) {
        this.chatModel = chatModel;
        this.systemMessage = systemMessage;
    }

    @GetMapping
    public String chat(@RequestParam(name = "mensagem") String mensagem) {
        List<ChatMessage> messages = List.of(
                new SystemMessage(systemMessage),
                new UserMessage(mensagem)
        );

        ChatResponse resp = chatModel.chat(messages);
        return (resp != null && resp.aiMessage() != null && resp.aiMessage().text() != null)
                ? resp.aiMessage().text()
                : "";
    }
}