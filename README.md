# Audio Visualizer & Real-Time Transcription

A full-stack application featuring a circular audio equalizer UI and real-time speech-to-text transcription using the Gemini API.

![Audio Visualizer Demo](docs/demo.gif)

## 🎯 Features

### Frontend - Circular Audio Equalizer
- **Real-time Audio Visualization**: Captures microphone input using MediaStream API
- **Frequency Analysis**: Uses Web Audio API's AnalyserNode for frequency data extraction
- **Circular Visualizer**: Beautiful, responsive canvas-based circular equalizer
- **60 FPS Animation**: Smooth, high-performance rendering
- **Instant Response**: Reacts immediately to volume and frequency changes
- **Modern UI**: Clean, responsive design with glass-morphism effects

### Backend - Streaming Transcription Service
- **WebSocket Streaming**: Bi-directional real-time communication
- **Gemini API Integration**: Powered by Google's Gemini for accurate transcription
- **Low Latency**: Minimal buffering for near-instant transcription
- **Resilient**: Handles network fluctuations with automatic reconnection
- **Efficient**: Optimized resource usage with reactive programming (WebFlux)

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.8+
- **Gemini API Key** (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd "volume equilizor"
```

### 2. Backend Setup

```bash
cd backend

# Set your Gemini API key
export GEMINI_API_KEY="your-gemini-api-key-here"

# Build and run
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Open the Application

Navigate to `http://localhost:3000` in your browser.

## 🎨 Using the Application

1. **Start Listening**: Click the "Start Listening" button to begin
2. **Allow Microphone**: Grant microphone permission when prompted
3. **Speak**: Start speaking - you'll see:
   - The circular visualizer reacting to your voice
   - Real-time transcription appearing in the panel
4. **Stop**: Click "Stop" to end the session

## 🏗️ Project Structure

```
volume-equalizer/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CircularVisualizer.jsx   # Canvas-based visualizer
│   │   │   ├── Controls.jsx              # Start/Stop controls
│   │   │   ├── Header.jsx                # App header
│   │   │   └── TranscriptionPanel.jsx    # Live transcription display
│   │   ├── hooks/
│   │   │   ├── useAudioAnalyzer.js       # Web Audio API integration
│   │   │   └── useTranscription.js       # WebSocket transcription
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Spring Boot + WebFlux backend
│   ├── src/main/java/com/audiovisualizer/
│   │   ├── config/
│   │   │   ├── WebSocketConfig.java      # WebSocket configuration
│   │   │   ├── CorsConfig.java           # CORS settings
│   │   │   └── GeminiConfig.java         # API configuration
│   │   ├── handler/
│   │   │   └── AudioTranscriptionHandler.java  # WebSocket handler
│   │   ├── service/
│   │   │   └── GeminiTranscriptionService.java # Gemini API integration
│   │   ├── dto/
│   │   │   └── TranscriptionResponse.java
│   │   └── TranscriptionServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── PREPXL_WEBSITE_AUDIT.md     # Website enhancement suggestions
└── README.md
```

## 🔧 Configuration

### Backend Configuration (application.yml)

```yaml
gemini:
  api:
    key: ${GEMINI_API_KEY}    # Set via environment variable
    model: gemini-1.5-flash   # Fast model for real-time transcription
```

### Frontend Configuration (vite.config.js)

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

## 📱 Technical Implementation

### Audio Processing Pipeline

```
Microphone → MediaStream → AudioContext → AnalyserNode → Canvas (60 FPS)
     ↓
MediaRecorder → WebSocket → Spring Boot → Gemini API → Transcription
```

### Key Technologies

| Component | Technology |
|-----------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Audio API | Web Audio API |
| Visualization | Canvas 2D |
| Backend Framework | Spring Boot 3.2 |
| Reactive Programming | WebFlux |
| Real-time Communication | WebSocket |
| AI Transcription | Gemini API |

## 📊 Performance Considerations

### Frontend Optimizations
- RequestAnimationFrame for 60 FPS rendering
- Smoothing algorithm for fluid visualizations
- High DPI canvas support for crisp graphics
- Efficient frequency data processing

### Backend Optimizations
- Non-blocking reactive streams
- Buffered audio processing
- Automatic buffer flushing
- Connection pooling for API calls

## 🎬 Demo Video Checklist

For your demo video, showcase:

1. **Visualizer Demo**
   - [ ] Application startup
   - [ ] Microphone permission grant
   - [ ] Visualizer response to quiet sounds
   - [ ] Visualizer response to loud sounds
   - [ ] Different frequency responses
   - [ ] Mobile responsiveness

2. **Transcription Demo**
   - [ ] WebSocket connection
   - [ ] Real-time text appearance
   - [ ] Accuracy of transcription
   - [ ] Handling of pauses
   - [ ] Copy functionality

## 🐛 Troubleshooting

### Common Issues

**Microphone not working:**
- Ensure HTTPS in production (required for MediaStream)
- Check browser microphone permissions
- Try a different browser

**WebSocket connection failed:**
- Verify backend is running on port 8080
- Check CORS configuration
- Ensure firewall allows WebSocket connections

**No transcription appearing:**
- Verify GEMINI_API_KEY is set correctly
- Check backend logs for API errors
- Ensure audio is being captured (check volume indicator)

## 📄 License

This project was created for the Fullstack Development Pre-Interview Assignment.

---

**Built with ❤️ using React, Spring Boot, and Gemini AI**
