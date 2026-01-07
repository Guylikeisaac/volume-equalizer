import { useState, useCallback } from 'react'
import CircularVisualizer from './components/CircularVisualizer'
import TranscriptionPanel from './components/TranscriptionPanel'
import Controls from './components/Controls'
import Header from './components/Header'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import { useTranscription } from './hooks/useTranscription'
import './App.css'

function App() {
  const [isListening, setIsListening] = useState(false)
  
  const {
    frequencyData,
    volumeLevel,
    startAnalyzer,
    stopAnalyzer,
    error: audioError
  } = useAudioAnalyzer()

  const {
    transcription,
    isTranscribing,
    startTranscription,
    stopTranscription,
    clearTranscription,
    error: transcriptionError
  } = useTranscription()

  const handleStart = useCallback(async () => {
    try {
      const stream = await startAnalyzer()
      if (stream) {
        await startTranscription(stream)
        setIsListening(true)
      }
    } catch (err) {
      console.error('Failed to start:', err)
    }
  }, [startAnalyzer, startTranscription])

  const handleStop = useCallback(() => {
    stopAnalyzer()
    stopTranscription()
    setIsListening(false)
  }, [stopAnalyzer, stopTranscription])

  const error = audioError || transcriptionError

  return (
    <div className="app">
      <div className="app-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="app-content">
        <Header />
        
        <main className="main-content">
          <div className="visualizer-section">
            <CircularVisualizer 
              frequencyData={frequencyData} 
              volumeLevel={volumeLevel}
              isActive={isListening}
            />
            
            <Controls 
              isListening={isListening}
              isConnected={isTranscribing}
              onStart={handleStart}
              onStop={handleStop}
              volumeLevel={volumeLevel}
            />
          </div>
          
          <TranscriptionPanel 
            transcription={transcription}
            isConnected={isTranscribing}
            isListening={isListening}
            onClear={clearTranscription}
          />
        </main>

        {error && (
          <div className="error-toast">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
