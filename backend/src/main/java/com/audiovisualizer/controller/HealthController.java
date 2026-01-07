package com.audiovisualizer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Audio Transcription Service");
        response.put("timestamp", Instant.now().toString());
        response.put("version", "1.0.0");
        
        return Mono.just(ResponseEntity.ok(response));
    }

    @GetMapping("/info")
    public Mono<ResponseEntity<Map<String, Object>>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Audio Visualizer & Transcription Service");
        response.put("description", "Real-time streaming transcription using Gemini API");
        response.put("features", new String[]{
            "WebSocket-based audio streaming",
            "Real-time transcription",
            "Low-latency response",
            "Automatic reconnection handling"
        });
        
        return Mono.just(ResponseEntity.ok(response));
    }
}
