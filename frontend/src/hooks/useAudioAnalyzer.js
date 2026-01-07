import { useState, useRef, useCallback, useEffect } from 'react'

export const useAudioAnalyzer = () => {
  const [frequencyData, setFrequencyData] = useState(null)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [error, setError] = useState(null)
  const [audioStream, setAudioStream] = useState(null)

  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationRef = useRef(null)
  const streamRef = useRef(null)

  const analyze = useCallback(() => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    analyserRef.current.getByteFrequencyData(dataArray)
    setFrequencyData(dataArray)

    // Calculate volume level (RMS)
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength
    setVolumeLevel(average / 255)

    animationRef.current = requestAnimationFrame(analyze)
  }, [])

  const startAnalyzer = useCallback(async () => {
    try {
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      streamRef.current = stream
      setAudioStream(stream)

      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 512 // Gives us 256 frequency bins
      analyserRef.current.smoothingTimeConstant = 0.8
      analyserRef.current.minDecibels = -90
      analyserRef.current.maxDecibels = -10

      // Create source from stream
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)

      // Start analysis loop
      animationRef.current = requestAnimationFrame(analyze)

      return stream
    } catch (err) {
      console.error('Error accessing microphone:', err)
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access to use this feature.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError(`Failed to access microphone: ${err.message}`)
      }
      
      return null
    }
  }, [analyze])

  const stopAnalyzer = useCallback(() => {
    // Stop animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Disconnect audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setAudioStream(null)
    setFrequencyData(null)
    setVolumeLevel(0)
    analyserRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalyzer()
    }
  }, [stopAnalyzer])

  return {
    frequencyData,
    volumeLevel,
    audioStream,
    error,
    startAnalyzer,
    stopAnalyzer
  }
}
