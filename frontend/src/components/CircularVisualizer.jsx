import { useRef, useEffect, useCallback } from 'react'
import './CircularVisualizer.css'

const CircularVisualizer = ({ frequencyData, volumeLevel, isActive }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const smoothedDataRef = useRef(null)

  // Configuration
  const config = {
    bars: 180,
    minBarHeight: 3,
    maxBarHeight: 120,
    innerRadius: 100,
    smoothingFactor: 0.15,
    rotationSpeed: 0.0005,
    glowIntensity: 0.8,
    colorOffset: 0
  }

  const lerp = (start, end, factor) => start + (end - start) * factor

  const getColor = useCallback((index, intensity, rotation) => {
    const hue = ((index / config.bars) * 360 + rotation * 50) % 360
    const saturation = 70 + intensity * 30
    const lightness = 50 + intensity * 20
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }, [config.bars])

  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Initialize smoothed data if needed
    if (!smoothedDataRef.current || smoothedDataRef.current.length !== config.bars) {
      smoothedDataRef.current = new Array(config.bars).fill(0)
    }

    // Calculate rotation
    const rotation = timestamp * config.rotationSpeed

    // Process frequency data
    const dataArray = frequencyData || new Uint8Array(config.bars).fill(0)
    const step = Math.floor(dataArray.length / config.bars)

    // Draw outer glow when active
    if (isActive && volumeLevel > 0.1) {
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, config.innerRadius,
        centerX, centerY, config.innerRadius + config.maxBarHeight + 50
      )
      glowGradient.addColorStop(0, `hsla(260, 100%, 70%, ${volumeLevel * 0.3})`)
      glowGradient.addColorStop(0.5, `hsla(280, 100%, 60%, ${volumeLevel * 0.15})`)
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw frequency bars
    for (let i = 0; i < config.bars; i++) {
      const dataIndex = Math.min(i * step, dataArray.length - 1)
      const rawValue = dataArray[dataIndex] || 0
      const normalizedValue = rawValue / 255

      // Smooth the data for fluid animation
      smoothedDataRef.current[i] = lerp(
        smoothedDataRef.current[i],
        normalizedValue,
        config.smoothingFactor
      )

      const smoothedValue = smoothedDataRef.current[i]
      const barHeight = config.minBarHeight + smoothedValue * config.maxBarHeight

      // Calculate angle for this bar
      const angle = (i / config.bars) * Math.PI * 2 + rotation

      // Calculate positions
      const innerX = centerX + Math.cos(angle) * config.innerRadius
      const innerY = centerY + Math.sin(angle) * config.innerRadius
      const outerX = centerX + Math.cos(angle) * (config.innerRadius + barHeight)
      const outerY = centerY + Math.sin(angle) * (config.innerRadius + barHeight)

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY)
      const color = getColor(i, smoothedValue, rotation)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color.replace(')', ', 0.3)').replace('hsl', 'hsla'))

      ctx.beginPath()
      ctx.moveTo(innerX, innerY)
      ctx.lineTo(outerX, outerY)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()

      // Add glow effect for high values
      if (smoothedValue > 0.6) {
        ctx.shadowColor = color
        ctx.shadowBlur = smoothedValue * 15
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Draw center circle
    const centerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, config.innerRadius - 10
    )
    
    if (isActive) {
      const pulse = Math.sin(timestamp * 0.003) * 0.1 + 0.9
      centerGradient.addColorStop(0, `hsla(260, 100%, ${20 + volumeLevel * 30}%, ${pulse})`)
      centerGradient.addColorStop(0.7, `hsla(280, 80%, 15%, ${pulse * 0.8})`)
      centerGradient.addColorStop(1, 'transparent')
    } else {
      centerGradient.addColorStop(0, 'hsla(260, 50%, 15%, 0.9)')
      centerGradient.addColorStop(0.7, 'hsla(280, 40%, 10%, 0.7)')
      centerGradient.addColorStop(1, 'transparent')
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, config.innerRadius - 10, 0, Math.PI * 2)
    ctx.fillStyle = centerGradient
    ctx.fill()

    // Draw center icon/indicator
    ctx.fillStyle = isActive 
      ? `rgba(255, 255, 255, ${0.7 + volumeLevel * 0.3})` 
      : 'rgba(255, 255, 255, 0.5)'
    ctx.font = '32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(isActive ? '🎤' : '🎙️', centerX, centerY)

    // Continue animation
    animationRef.current = requestAnimationFrame(draw)
  }, [frequencyData, volumeLevel, isActive, getColor, config])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Start animation loop
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`visualizer-container ${isActive ? 'active' : ''}`}>
      <canvas 
        ref={canvasRef} 
        className="visualizer-canvas"
      />
      <div className="visualizer-ring outer-ring"></div>
      <div className="visualizer-ring inner-ring"></div>
    </div>
  )
}

export default CircularVisualizer
