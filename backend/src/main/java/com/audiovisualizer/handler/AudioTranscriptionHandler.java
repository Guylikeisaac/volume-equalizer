package com.audiovisualizer.handler;

import com.audiovisualizer.service.GeminiTranscriptionService;
import com.audiovisualizer.dto.TranscriptionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class AudioTranscriptionHandler extends BinaryWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(AudioTranscriptionHandler.class);
    private static final int BUFFER_SIZE = 32 * 1024; // 32KB buffer before sending to Gemini
    private static final long FLUSH_INTERVAL_MS = 1000; // Flush every second

    private final GeminiTranscriptionService transcriptionService;
    private final ObjectMapper objectMapper;
    private final Map<String, SessionState> sessionStates = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public AudioTranscriptionHandler(GeminiTranscriptionService transcriptionService, ObjectMapper objectMapper) {
        this.transcriptionService = transcriptionService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("WebSocket connection established: {}", session.getId());
        
        SessionState state = new SessionState();
        sessionStates.put(session.getId(), state);

        // Schedule periodic buffer flushing for low-latency transcription
        state.flushTask = scheduler.scheduleAtFixedRate(
            () -> flushBuffer(session),
            FLUSH_INTERVAL_MS,
            FLUSH_INTERVAL_MS,
            TimeUnit.MILLISECONDS
        );

        // Send connection acknowledgment
        sendMessage(session, new TranscriptionResponse("connected", "Connection established", false));
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        SessionState state = sessionStates.get(session.getId());
        if (state == null) {
            logger.warn("No session state found for: {}", session.getId());
            return;
        }

        ByteBuffer payload = message.getPayload();
        byte[] audioData = new byte[payload.remaining()];
        payload.get(audioData);

        synchronized (state.audioBuffer) {
            state.audioBuffer.write(audioData);
            state.lastDataTime = System.currentTimeMillis();

            // If buffer is large enough, process immediately
            if (state.audioBuffer.size() >= BUFFER_SIZE) {
                processAudioBuffer(session, state);
            }
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        logger.debug("Received text message: {}", payload);

        // Handle control messages
        if ("ping".equals(payload)) {
            session.sendMessage(new TextMessage("pong"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("WebSocket connection closed: {} with status: {}", session.getId(), status);
        
        SessionState state = sessionStates.remove(session.getId());
        if (state != null) {
            // Cancel scheduled flush task
            if (state.flushTask != null) {
                state.flushTask.cancel(false);
            }
            
            // Process any remaining audio in buffer
            if (state.audioBuffer.size() > 0) {
                processAudioBuffer(session, state);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
        
        sendMessage(session, new TranscriptionResponse("error", "Transport error: " + exception.getMessage(), false));
        
        // Clean up session
        SessionState state = sessionStates.remove(session.getId());
        if (state != null && state.flushTask != null) {
            state.flushTask.cancel(false);
        }
    }

    private void flushBuffer(WebSocketSession session) {
        SessionState state = sessionStates.get(session.getId());
        if (state == null || !session.isOpen()) {
            return;
        }

        synchronized (state.audioBuffer) {
            if (state.audioBuffer.size() > 0) {
                long timeSinceLastData = System.currentTimeMillis() - state.lastDataTime;
                if (timeSinceLastData >= 100) { // Only flush if no data received for 100ms
                    processAudioBuffer(session, state);
                }
            }
        }
    }

    private void processAudioBuffer(WebSocketSession session, SessionState state) {
        byte[] audioData;
        synchronized (state.audioBuffer) {
            audioData = state.audioBuffer.toByteArray();
            state.audioBuffer.reset();
        }

        if (audioData.length == 0) {
            return;
        }

        logger.debug("Processing audio buffer of size: {} bytes", audioData.length);

        // Process with Gemini API asynchronously
        transcriptionService.transcribeAudio(audioData)
            .subscribe(
                transcription -> {
                    if (transcription != null && !transcription.isBlank()) {
                        sendMessage(session, new TranscriptionResponse("transcript", transcription.trim(), true));
                    }
                },
                error -> {
                    logger.error("Transcription error: {}", error.getMessage());
                    sendMessage(session, new TranscriptionResponse("error", "Transcription failed: " + error.getMessage(), false));
                }
            );
    }

    private void sendMessage(WebSocketSession session, TranscriptionResponse response) {
        if (!session.isOpen()) {
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(response);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            logger.error("Failed to send message: {}", e.getMessage());
        }
    }

    // Inner class to hold session-specific state
    private static class SessionState {
        final ByteArrayOutputStream audioBuffer = new ByteArrayOutputStream();
        volatile long lastDataTime = System.currentTimeMillis();
        java.util.concurrent.ScheduledFuture<?> flushTask;
    }
}
