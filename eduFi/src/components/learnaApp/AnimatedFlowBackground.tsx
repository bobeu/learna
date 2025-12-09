/**
 * Animated Flow Background Component for Learna
 * 
 * Creates animated particles/flow elements with education and blockchain themed objects
 * Includes: Graduation cap, Book, Certificate, Blockchain node, Brain, and Learna logo
 * Uses subtle Neon lime and purple colors for visibility without distraction
 */

'use client'

import { useEffect, useRef } from 'react'
import { CampaignStateProps } from '../../../types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  isLarge: boolean
  connections: number[]
  shape: 'circle' | 'hexagon' | 'star' | 'diamond'
}

interface EducationObject {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  type: 'graduation' | 'book' | 'certificate' | 'blockchain' | 'brain' | 'logo'
}

interface AnimatedFlowBackgroundProps {
  campaigns: CampaignStateProps[]
}

export default function AnimatedFlowBackground({ campaigns }: AnimatedFlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const educationObjectsRef = useRef<EducationObject[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  // Theme colors - subtle and visible
  const neonLime = '#a7ff1f'
  const purple = '#8b5cf6'
  const limeRgba = (alpha: number) => `rgba(167, 255, 31, ${alpha})`
  const purpleRgba = (alpha: number) => `rgba(139, 92, 246, ${alpha})`

  // Load logo image
  useEffect(() => {
    const img = new Image()
    img.src = '/logo.png'
    img.onload = () => {
      logoImageRef.current = img
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Reinitialize education objects on resize if needed
      if (educationObjectsRef.current.length === 0) {
        initializeEducationObjects()
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize education objects
    const initializeEducationObjects = () => {
      educationObjectsRef.current = [
        {
          x: canvas.width * 0.15,
          y: canvas.height * 0.25,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size: 100,
          rotation: Math.random() * 360,
          rotationSpeed: 0.2,
          type: 'logo', // Learna logo
        },
        {
          x: canvas.width * 0.35,
          y: canvas.height * 0.65,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 90,
          rotation: Math.random() * 360,
          rotationSpeed: 0.25,
          type: 'graduation',
        },
        {
          x: canvas.width * 0.65,
          y: canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          size: 85,
          rotation: Math.random() * 360,
          rotationSpeed: 0.3,
          type: 'book',
        },
        {
          x: canvas.width * 0.85,
          y: canvas.height * 0.7,
          vx: (Math.random() - 0.5) * 0.09,
          vy: (Math.random() - 0.5) * 0.09,
          size: 95,
          rotation: Math.random() * 360,
          rotationSpeed: 0.2,
          type: 'certificate',
        },
        {
          x: canvas.width * 0.5,
          y: canvas.height * 0.75,
          vx: (Math.random() - 0.5) * 0.11,
          vy: (Math.random() - 0.5) * 0.11,
          size: 80,
          rotation: Math.random() * 360,
          rotationSpeed: 0.35,
          type: 'blockchain',
        },
        {
          x: canvas.width * 0.75,
          y: canvas.height * 0.2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 88,
          rotation: Math.random() * 360,
          rotationSpeed: 0.28,
          type: 'brain',
        },
      ]
    }

    initializeEducationObjects()

    // Initialize particles with varied sizes and shapes
    const particleCount = 45 // Reduced for better performance
    const largeParticleCount = 5
    
    const shapes: Array<'circle' | 'hexagon' | 'star' | 'diamond'> = ['circle', 'hexagon', 'star', 'diamond']
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: i < largeParticleCount ? Math.random() * 5 + 6 : Math.random() * 2 + 1.5,
      opacity: i < largeParticleCount ? 0.3 : Math.random() * 0.2 + 0.1,
      isLarge: i < largeParticleCount,
      connections: [],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))

    // Build connections between large particles (blockchain network)
    const buildConnections = () => {
      const largeParticles = particlesRef.current.filter(p => p.isLarge)
      
      largeParticles.forEach((particle, i) => {
        particle.connections = []
        
        // Connect to next particle in sequence
        if (i < largeParticles.length - 1) {
          const nextIndex = particlesRef.current.indexOf(largeParticles[i + 1])
          particle.connections.push(nextIndex)
        }
        
        // Connect to nearby large particles
        largeParticles.forEach((other, j) => {
          if (i !== j && j > i) {
            const dx = particle.x - other.x
            const dy = particle.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 200 && Math.random() > 0.7) {
              const otherIndex = particlesRef.current.indexOf(other)
              particle.connections.push(otherIndex)
            }
          }
        })
      })
    }

    buildConnections()

    // Draw different shapes
    const drawShape = (
      ctx: CanvasRenderingContext2D,
      shape: 'circle' | 'hexagon' | 'star' | 'diamond',
      x: number,
      y: number,
      size: number
    ) => {
      ctx.beginPath()
      
      switch (shape) {
        case 'circle':
          ctx.arc(x, y, size, 0, Math.PI * 2)
          break
          
        case 'hexagon':
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const px = x + size * Math.cos(angle)
            const py = y + size * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          break
          
        case 'star':
          const spikes = 5
          const outerRadius = size
          const innerRadius = size * 0.5
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI / spikes) * i - Math.PI / 2
            const px = x + radius * Math.cos(angle)
            const py = y + radius * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          break
          
        case 'diamond':
          ctx.moveTo(x, y - size)
          ctx.lineTo(x + size, y)
          ctx.lineTo(x, y + size)
          ctx.lineTo(x - size, y)
          ctx.closePath()
          break
      }
    }

    // Draw education objects
    const drawEducationObject = (
      ctx: CanvasRenderingContext2D,
      obj: EducationObject
    ) => {
      ctx.save()
      ctx.translate(obj.x, obj.y)
      ctx.rotate((obj.rotation * Math.PI) / 180)

      const size = obj.size
      const useLime = obj.type === 'logo' || obj.type === 'blockchain' || obj.type === 'brain'
      const color = useLime ? neonLime : purple
      const colorRgba = useLime ? limeRgba : purpleRgba

      // Outer glow - subtle
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
      glowGradient.addColorStop(0, colorRgba(0.15))
      glowGradient.addColorStop(0.5, colorRgba(0.08))
      glowGradient.addColorStop(1, colorRgba(0))
      
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Draw based on type
      switch (obj.type) {
        case 'logo':
          // Draw Learna logo if loaded
          if (logoImageRef.current) {
            const logoSize = size * 0.8
            ctx.globalAlpha = 0.4
            ctx.drawImage(logoImageRef.current, -logoSize / 2, -logoSize / 2, logoSize, logoSize)
            ctx.globalAlpha = 1
          } else {
            // Fallback: Draw "L" for Learna
            ctx.beginPath()
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2)
            ctx.fillStyle = colorRgba(0.3)
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            ctx.stroke()
            ctx.fillStyle = color
            ctx.font = `bold ${size * 0.3}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.globalAlpha = 0.6
            ctx.fillText('L', 0, 0)
            ctx.globalAlpha = 1
          }
          break

        case 'graduation':
          // Graduation cap
          ctx.beginPath()
          // Cap top (square)
          ctx.rect(-size * 0.3, -size * 0.4, size * 0.6, size * 0.3)
          ctx.fillStyle = colorRgba(0.25)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Tassel
          ctx.beginPath()
          ctx.moveTo(size * 0.3, -size * 0.1)
          ctx.lineTo(size * 0.35, size * 0.1)
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.stroke()
          break

        case 'book':
          // Open book
          ctx.beginPath()
          // Left page
          ctx.rect(-size * 0.4, -size * 0.3, size * 0.35, size * 0.6)
          ctx.fillStyle = colorRgba(0.2)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Right page
          ctx.beginPath()
          ctx.rect(size * 0.05, -size * 0.3, size * 0.35, size * 0.6)
          ctx.fillStyle = colorRgba(0.2)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Book spine
          ctx.beginPath()
          ctx.moveTo(0, -size * 0.3)
          ctx.lineTo(0, size * 0.3)
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.stroke()
          break

        case 'certificate':
          // Certificate/Badge
          ctx.beginPath()
          // Main rectangle
          ctx.rect(-size * 0.35, -size * 0.25, size * 0.7, size * 0.5)
          ctx.fillStyle = colorRgba(0.2)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.stroke()
          
          // Decorative border
          ctx.beginPath()
          ctx.rect(-size * 0.3, -size * 0.2, size * 0.6, size * 0.4)
          ctx.strokeStyle = color
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          // Star in center
          const starSize = size * 0.15
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2
            const px = Math.cos(angle) * starSize
            const py = Math.sin(angle) * starSize
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fillStyle = colorRgba(0.4)
          ctx.fill()
          break

        case 'blockchain':
          // Blockchain node (hexagon with connections)
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const px = size * 0.4 * Math.cos(angle)
            const py = size * 0.4 * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fillStyle = colorRgba(0.25)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.stroke()
          
          // Inner circle
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = colorRgba(0.3)
          ctx.fill()
          break

        case 'brain':
          // Brain icon (simplified)
          ctx.beginPath()
          // Left hemisphere
          ctx.arc(-size * 0.15, 0, size * 0.3, 0, Math.PI * 2)
          // Right hemisphere
          ctx.arc(size * 0.15, 0, size * 0.3, 0, Math.PI * 2)
          ctx.fillStyle = colorRgba(0.25)
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 2.5
          ctx.stroke()
          
          // Neural connections (curved lines)
          ctx.beginPath()
          ctx.moveTo(-size * 0.1, -size * 0.1)
          ctx.quadraticCurveTo(0, 0, size * 0.1, -size * 0.1)
          ctx.strokeStyle = color
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          ctx.beginPath()
          ctx.moveTo(-size * 0.1, size * 0.1)
          ctx.quadraticCurveTo(0, 0, size * 0.1, size * 0.1)
          ctx.stroke()
          break
      }

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update education object positions and rotations
      educationObjectsRef.current.forEach((obj) => {
        obj.x += obj.vx
        obj.y += obj.vy
        obj.rotation += obj.rotationSpeed

        // Bounce off edges
        if (obj.x < obj.size) {
          obj.x = obj.size
          obj.vx = -obj.vx
        }
        if (obj.x > canvas.width - obj.size) {
          obj.x = canvas.width - obj.size
          obj.vx = -obj.vx
        }
        if (obj.y < obj.size) {
          obj.y = obj.size
          obj.vy = -obj.vy
        }
        if (obj.y > canvas.height - obj.size) {
          obj.y = canvas.height - obj.size
          obj.vy = -obj.vy
        }
      })

      // Update particle positions
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })

      // Rebuild connections periodically (less frequent for performance)
      if (Math.random() < 0.005) {
        buildConnections()
      }

      // Draw connections first (behind particles) - subtle
      particlesRef.current.forEach((particle) => {
        if (particle.isLarge) {
          particle.connections.forEach((connIndex) => {
            const connected = particlesRef.current[connIndex]
            if (connected) {
              const useLime = Math.random() > 0.5
              const color = useLime ? limeRgba(0.12) : purpleRgba(0.12)
              
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(connected.x, connected.y)
              ctx.strokeStyle = color
              ctx.lineWidth = 1
              ctx.stroke()
            }
          })
        }
      })

      // Draw education objects (behind particles)
      educationObjectsRef.current.forEach((obj) => {
        drawEducationObject(ctx, obj)
      })

      // Draw particles - subtle
      particlesRef.current.forEach((particle) => {
        const useLime = Math.random() > 0.5
        const color = useLime ? limeRgba : purpleRgba
        
        // Draw glow effect for large particles (subtle)
        if (particle.isLarge) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          )
          gradient.addColorStop(0, color(particle.opacity * 0.5))
          gradient.addColorStop(0.5, color(particle.opacity * 0.2))
          gradient.addColorStop(1, color(0))
          
          drawShape(ctx, particle.shape, particle.x, particle.y, particle.size * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
        
        // Main particle
        drawShape(ctx, particle.shape, particle.x, particle.y, particle.size)
        ctx.fillStyle = color(particle.opacity)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      const frameId = animationFrameRef.current
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [campaigns])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -10, opacity: 0.4 }}
    />
  )
}
