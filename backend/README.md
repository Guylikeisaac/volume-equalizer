# Audio Transcription Service - Backend

Spring Boot WebFlux application providing real-time audio transcription using the Gemini API.

## Prerequisites

- Java 17+
- Maven 3.8+
- Gemini API Key

## Running the Application

### 1. Set Environment Variables

```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

### 2. Build and Run

```bash
# Using Maven
mvn spring-boot:run

# Or build JAR and run
mvn clean package
java -jar target/transcription-service-1.0.0.jar
```

### 3. Verify

```bash
# Health check
curl http://localhost:8080/api/health

# Service info
curl http://localhost:8080/api/info
```

## API Endpoints

### WebSocket
- `ws://localhost:8080/api/transcribe` - Audio streaming endpoint

### REST
- `GET /api/health` - Health check
- `GET /api/info` - Service information

## Configuration

Edit `src/main/resources/application.yml`:

```yaml
gemini:
  api:
    key: ${GEMINI_API_KEY}
    model: gemini-1.5-flash
    endpoint: https://generativelanguage.googleapis.com/v1beta
```

## Architecture

```
WebSocket Connection
       ↓
AudioTranscriptionHandler (buffers audio chunks)
       ↓
GeminiTranscriptionService (calls Gemini API)
       ↓
Transcription Response (streamed back via WebSocket)
```
