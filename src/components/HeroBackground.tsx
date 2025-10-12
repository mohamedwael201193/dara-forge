import React, { useCallback, useEffect, useRef, useState } from 'react'

// Types for our background elements
interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  direction: number
  opacity: number
}

interface Connection {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

interface DataStreamDot {
  id: string
  x: number
  y: number
  color: string
  delay: number
}

interface NeuralPulse {
  id: string
  x: number
  y: number
  timestamp: number
}

const HeroBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [dataStreams, setDataStreams] = useState<DataStreamDot[]>([])
  const [neuralPulses, setNeuralPulses] = useState<NeuralPulse[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const lastPulseRef = useRef<number>(0)

  // Optimized particle counts for better performance
  const getParticleCount = useCallback(() => {
    if (dimensions.width < 768) return 15 // Mobile - reduced from 30
    if (dimensions.width < 1024) return 25 // Tablet - reduced from 50
    return 35 // Desktop - reduced from 70
  }, [dimensions.width])

  // Initialize particles with random properties
  const initializeParticles = useCallback(() => {
    const particleCount = getParticleCount()
    const newParticles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() < 0.1 ? 12 : Math.random() < 0.3 ? 8 : 4
      const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981']
      
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.2 + Math.random() * 0.8,
        direction: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.7
      })
    }
    
    setParticles(newParticles)
  }, [dimensions, getParticleCount])

  // Optimized connections calculation with distance limits
  const calculateConnections = useCallback((particles: Particle[]) => {
    const newConnections: Connection[] = []
    const maxDistance = dimensions.width < 768 ? 80 : 120 // Reduced from 100/150
    const maxConnections = dimensions.width < 768 ? 15 : 25 // Limit total connections
    
    for (let i = 0; i < particles.length && newConnections.length < maxConnections; i++) {
      for (let j = i + 1; j < particles.length && newConnections.length < maxConnections; j++) {
        const particle1 = particles[i]
        const particle2 = particles[j]
        const distance = Math.sqrt(
          Math.pow(particle1.x - particle2.x, 2) + 
          Math.pow(particle1.y - particle2.y, 2)
        )
        
        if (distance < maxDistance) {
          const opacity = (maxDistance - distance) / maxDistance * 0.4
          newConnections.push({
            id: `${i}-${j}`,
            x1: particle1.x,
            y1: particle1.y,
            x2: particle2.x,
            y2: particle2.y,
            opacity: opacity * (0.5 + 0.5 * Math.sin(Date.now() * 0.002 + distance * 0.01))
          })
        }
      }
    }
    
    return newConnections
  }, [dimensions.width])

  // Initialize data streams
  const initializeDataStreams = useCallback(() => {
    const streamCount = Math.floor(dimensions.height / 100)
    const newStreams: DataStreamDot[] = []
    const colors = ['#10B981', '#3B82F6', '#8B5CF6']
    
    for (let i = 0; i < streamCount; i++) {
      for (let j = 0; j < 5; j++) {
        newStreams.push({
          id: `stream-${i}-${j}`,
          x: -50,
          y: (i + 1) * (dimensions.height / (streamCount + 1)),
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: j * 0.5 + i * 0.2
        })
      }
    }
    
    setDataStreams(newStreams)
  }, [dimensions])

  // Animation loop
  const animate = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        let newX = particle.x + Math.cos(particle.direction) * particle.speed
        let newY = particle.y + Math.sin(particle.direction) * particle.speed
        let newDirection = particle.direction

        // Bounce off walls
        if (newX < 0 || newX > dimensions.width) {
          newDirection = Math.PI - particle.direction
          newX = Math.max(0, Math.min(dimensions.width, newX))
        }
        if (newY < 0 || newY > dimensions.height) {
          newDirection = -particle.direction
          newY = Math.max(0, Math.min(dimensions.height, newY))
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          direction: newDirection + (Math.random() - 0.5) * 0.1 // Small random direction changes
        }
      })
    })

    // Generate neural pulses less frequently for better performance
    const now = Date.now()
    if (now - lastPulseRef.current > 5000 + Math.random() * 3000) {
      const randomParticle = particles[Math.floor(Math.random() * particles.length)]
      if (randomParticle) {
        setNeuralPulses(prev => [...prev, {
          id: `pulse-${now}`,
          x: randomParticle.x,
          y: randomParticle.y,
          timestamp: now
        }])
        lastPulseRef.current = now
      }
    }

    // Clean up old pulses
    setNeuralPulses(prev => prev.filter(pulse => now - pulse.timestamp < 1500))

    animationRef.current = requestAnimationFrame(animate)
  }, [particles, dimensions])

  // Update connections when particles move (throttled for performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newConnections = calculateConnections(particles)
      setConnections(newConnections)
    }, 100) // Throttle to update every 100ms instead of every frame
    
    return () => clearTimeout(timer)
  }, [particles, calculateConnections])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize particles when dimensions change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeParticles()
      initializeDataStreams()
    }
  }, [dimensions, initializeParticles, initializeDataStreams])

  // Start animation
  useEffect(() => {
    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  return (
    <div ref={containerRef} className="hero-background-container">
      {/* Layer 1: Animated Gradient Background */}
      <div className="gradient-mesh" />
      
      {/* Layer 2: Scientific Particles */}
      <div className="particles-layer">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Layer 3: Network Connections */}
      <svg className="connections-layer" width="100%" height="100%">
        {connections.map(connection => (
          <line
            key={connection.id}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="1"
            opacity={connection.opacity}
            className="connection-line"
          />
        ))}
      </svg>

      {/* Layer 4: DNA Helix */}
      <svg className="dna-helix" width="200" height="100%" viewBox="0 0 200 800">
        <path
          className="helix-strand-1"
          d="M50 0 Q 150 200 50 400 Q -50 600 50 800"
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="2"
        />
        <path
          className="helix-strand-2"
          d="M150 0 Q 50 200 150 400 Q 250 600 150 800"
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="2"
        />
        {/* DNA cross-links */}
        {Array.from({ length: 20 }, (_, i) => {
          const y = i * 40
          const offset1 = 50 * Math.sin(y * 0.01)
          const offset2 = -offset1
          return (
            <line
              key={i}
              x1={100 + offset1}
              y1={y}
              x2={100 + offset2}
              y2={y}
              stroke="rgba(139, 92, 246, 0.08)"
              strokeWidth="1"
            />
          )
        })}
      </svg>

      {/* Layer 5: Data Streams */}
      <div className="data-streams">
        {dataStreams.map(dot => (
          <div
            key={dot.id}
            className="data-dot"
            style={{
              top: `${dot.y}px`,
              backgroundColor: dot.color,
              animationDelay: `${dot.delay}s`
            }}
          />
        ))}
      </div>

      {/* Layer 6: Neural Pulses */}
      <div className="neural-pulses">
        {neuralPulses.map(pulse => (
          <div
            key={pulse.id}
            className="neural-pulse"
            style={{
              left: `${pulse.x}px`,
              top: `${pulse.y}px`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroBackground