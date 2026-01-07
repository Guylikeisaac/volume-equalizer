# Audio Visualizer - Frontend

React application with a circular audio equalizer and real-time transcription display.

## Prerequisites

- Node.js 18+
- npm or yarn

## Running the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
npm run preview
```

## Features

- **Circular Visualizer**: Canvas-based 60 FPS audio visualization
- **Web Audio API**: Real-time frequency analysis
- **MediaStream API**: Microphone access
- **WebSocket**: Real-time transcription streaming
- **Responsive Design**: Works on desktop and mobile

## Project Structure

```
src/
├── components/
│   ├── CircularVisualizer.jsx  # Main visualization component
│   ├── Controls.jsx            # Start/Stop controls
│   ├── Header.jsx              # Navigation header
│   └── TranscriptionPanel.jsx  # Transcription display
├── hooks/
│   ├── useAudioAnalyzer.js     # Web Audio API hook
│   └── useTranscription.js     # WebSocket transcription hook
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Note: Microphone access requires HTTPS in production.
