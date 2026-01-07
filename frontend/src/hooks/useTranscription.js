import { useState, useRef, useCallback, useEffect } from 'react'

export const useTranscription = () => {
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  const isActiveRef = useRef(false)

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('Speech recognition started')
      setIsTranscribing(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTranscription(prev => {
          const newText = prev ? prev + finalTranscript : finalTranscript
          return newText.trim() + ' '
        })
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      
      if (event.error === 'no-speech') {
        // This is normal, just restart
        return
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please check your microphone settings.')
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.')
      } else if (event.error === 'network') {
        setError('Network error. Please check your internet connection.')
      }
    }

    recognition.onend = () => {
      console.log('Speech recognition ended, isActive:', isActiveRef.current)
      // Auto-restart if still active
      if (isActiveRef.current && recognitionRef.current) {
        try {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              recognitionRef.current.start()
            }
          }, 100)
        } catch (err) {
          console.error('Failed to restart recognition:', err)
        }
      } else {
        setIsTranscribing(false)
      }
    }

    return recognition
  }, [])

  const startTranscription = useCallback(async (audioStream) => {
    try {
      setError(null)
      
      // Initialize recognition if not already done
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition()
      }

      if (!recognitionRef.current) {
        return // Error already set in initRecognition
      }

      isActiveRef.current = true
      
      try {
        recognitionRef.current.start()
      } catch (err) {
        // If already started, stop and restart
        if (err.name === 'InvalidStateError') {
          recognitionRef.current.stop()
          setTimeout(() => {
            if (isActiveRef.current) {
              recognitionRef.current.start()
            }
          }, 100)
        } else {
          throw err
        }
      }

      console.log('Transcription started')
    } catch (err) {
      console.error('Failed to start transcription:', err)
      setError(`Failed to start transcription: ${err.message}`)
    }
  }, [initRecognition])

  const stopTranscription = useCallback(() => {
    isActiveRef.current = false
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Error stopping recognition:', err)
      }
    }
    
    setIsTranscribing(false)
  }, [])

  const clearTranscription = useCallback(() => {
    setTranscription('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    transcription,
    isTranscribing,
    error,
    startTranscription,
    stopTranscription,
    clearTranscription
  }
}
