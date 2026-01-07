import './Controls.css'

const Controls = ({ isListening, isConnected, onStart, onStop, volumeLevel }) => {
  const volumePercent = Math.round(volumeLevel * 100)

  return (
    <div className="controls">
      <div className="volume-indicator">
        <div className="volume-bar-container">
          <div 
            className="volume-bar-fill" 
            style={{ width: `${volumePercent}%` }}
          />
        </div>
        <span className="volume-label">Volume: {volumePercent}%</span>
      </div>

      <div className="control-buttons">
        {!isListening ? (
          <button 
            className="control-btn start-btn" 
            onClick={onStart}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
            <span>Start Listening</span>
          </button>
        ) : (
          <button 
            className="control-btn stop-btn" 
            onClick={onStop}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span>Stop</span>
          </button>
        )}
      </div>

      <div className="status-indicators">
        <div className={`status-item ${isListening ? 'active' : ''}`}>
          <span className="status-dot"></span>
          <span>Microphone</span>
        </div>
        <div className={`status-item ${isConnected ? 'active' : ''}`}>
          <span className="status-dot"></span>
          <span>Transcription</span>
        </div>
      </div>
    </div>
  )
}

export default Controls
