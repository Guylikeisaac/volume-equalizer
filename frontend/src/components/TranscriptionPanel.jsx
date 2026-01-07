import { useRef, useEffect } from 'react'
import './TranscriptionPanel.css'

const TranscriptionPanel = ({ transcription, isConnected, isListening, onClear }) => {
  const transcriptionRef = useRef(null)

  // Auto-scroll to bottom when new transcription arrives
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight
    }
  }, [transcription])

  return (
    <div className="transcription-panel">
      <div className="panel-header">
        <h2>
          <span className="panel-icon">📝</span>
          Live Transcription
        </h2>
        <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
          <span className="status-indicator"></span>
          <span>{isConnected ? 'Transcribing' : 'Idle'}</span>
        </div>
      </div>

      <div className="transcription-content" ref={transcriptionRef}>
        {!isListening && !transcription && (
          <div className="empty-state">
            <div className="empty-icon">🎙️</div>
            <p>Click "Start Listening" to begin transcription</p>
            <span className="hint">Your speech will appear here in real-time</span>
          </div>
        )}

        {isListening && !transcription && (
          <div className="listening-state">
            <div className="listening-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Listening for speech...</p>
            <span className="hint">Speak clearly into your microphone</span>
          </div>
        )}

        {transcription && (
          <div className="transcription-text">
            {transcription.split('\n').map((line, index) => (
              <p key={index} className="transcript-line">
                {line}
              </p>
            ))}
            {isListening && (
              <span className="cursor-blink">|</span>
            )}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="footer-info">
          <span className="word-count">
            {transcription ? transcription.split(/\s+/).filter(w => w).length : 0} words
          </span>
          <span className="separator">•</span>
          <span className="tech-info">Powered by Gemini AI</span>
        </div>
        <div className="footer-actions">
          {transcription && onClear && (
            <button 
              className="clear-btn"
              onClick={onClear}
              title="Clear transcription"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              Clear
            </button>
          )}
          {transcription && (
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(transcription)}
              title="Copy transcription"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranscriptionPanel
