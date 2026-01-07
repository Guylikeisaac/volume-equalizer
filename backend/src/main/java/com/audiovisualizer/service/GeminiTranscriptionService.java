package com.audiovisualizer.service;

import com.audiovisualizer.config.GeminiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Base64;

@Service
public class GeminiTranscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiTranscriptionService.class);

    private final GeminiConfig geminiConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiTranscriptionService(GeminiConfig geminiConfig, ObjectMapper objectMapper) {
        this.geminiConfig = geminiConfig;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(geminiConfig.getEndpoint())
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * Transcribes audio data using the Gemini API.
     * 
     * @param audioData Raw audio data bytes (WebM/Opus format from browser)
     * @return Mono containing the transcribed text
     */
    public Mono<String> transcribeAudio(byte[] audioData) {
        if (audioData == null || audioData.length == 0) {
            return Mono.empty();
        }

        return Mono.fromCallable(() -> buildRequestBody(audioData))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(requestBody -> 
                    webClient.post()
                        .uri("/models/{model}:generateContent?key={apiKey}", 
                             geminiConfig.getModel(), 
                             geminiConfig.getKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .map(this::extractTranscription)
                        .onErrorResume(e -> {
                            logger.error("Gemini API error: {}", e.getMessage());
                            return Mono.empty();
                        })
                );
    }

    /**
     * Builds the request body for Gemini API with audio data.
     */
    private String buildRequestBody(byte[] audioData) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        
        // Create contents array
        ArrayNode contents = root.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        
        // Add text prompt for transcription
        ObjectNode textPart = parts.addObject();
        textPart.put("text", "Please transcribe the following audio. Only output the transcribed text, nothing else. If you cannot understand the audio or it's unclear, respond with an empty string.");
        
        // Add audio data as inline data
        ObjectNode audioPart = parts.addObject();
        ObjectNode inlineData = audioPart.putObject("inlineData");
        inlineData.put("mimeType", "audio/webm");
        inlineData.put("data", Base64.getEncoder().encodeToString(audioData));
        
        // Generation config for faster response
        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("temperature", 0.1);
        generationConfig.put("maxOutputTokens", 1024);
        generationConfig.put("topP", 0.8);
        generationConfig.put("topK", 10);

        return objectMapper.writeValueAsString(root);
    }

    /**
     * Extracts transcription text from Gemini API response.
     */
    private String extractTranscription(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.get("candidates");
            
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode text = parts.get(0).get("text");
                        if (text != null) {
                            return text.asText();
                        }
                    }
                }
            }
            
            // Check for error in response
            JsonNode error = root.get("error");
            if (error != null) {
                String errorMessage = error.get("message").asText();
                logger.error("Gemini API returned error: {}", errorMessage);
            }
            
            return "";
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response: {}", e.getMessage());
            return "";
        }
    }
}
