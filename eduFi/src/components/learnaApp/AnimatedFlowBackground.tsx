/**
 * Animated Flow Background Component for Learna
 * 
 * Creates animated particles/flow elements with campaign titles
 * Uses neon lime green and Celo yellow theme colors
 * Campaign titles appear as animated elements that reflect when campaigns are added
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

interface CampaignElement {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  title: string
  color: string // 'lime' or 'yellow'
}

interface AnimatedFlowBackgroundProps {
  campaigns: CampaignStateProps[]
}

export default function AnimatedFlowBackground({ campaigns }: AnimatedFlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const campaignElementsRef = useRef<CampaignElement[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Theme colors
  const neonLime = '#a7ff1f'
  const celoYellow = '#FCFF52'

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize campaign elements from campaigns prop
    const initializeCampaignElements = () => {
      const campaignTitles = campaigns
        .map(c => c.name)
        .filter((name): name is string => Boolean(name && name.trim()))
        .slice(0, 6) // Limit to 6 for performance

      // If no campaigns, use placeholder educational terms
      const titles = campaignTitles.length > 0 
        ? campaignTitles 
        : ['Solidity', 'Celo', 'Farcaster', 'Web3', 'DeFi', 'Learning']

      campaignElementsRef.current = titles.map((title, i) => ({
        x: (canvas.width / (titles.length + 1)) * (i + 1),
        y: canvas.height * (0.2 + (i % 3) * 0.3),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 100 + Math.random() * 40, // 100-140px
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        title: title.length > 12 ? title.substring(0, 12) + '...' : title,
        color: i % 2 === 0 ? 'lime' : 'yellow',
      }))
    }

    initializeCampaignElements()

    // Initialize particles with varied sizes and shapes
    const particleCount = 50
    const largeParticleCount = 6
    
    const shapes: Array<'circle' | 'hexagon' | 'star' | 'diamond'> = ['circle', 'hexagon', 'star', 'diamond']
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: i < largeParticleCount ? Math.random() * 6 + 8 : Math.random() * 3 + 2,
      opacity: i < largeParticleCount ? 0.5 : Math.random() * 0.4 + 0.1,
      isLarge: i < largeParticleCount,
      connections: [],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))

    // Build connections between large particles
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
            
            if (distance < 250 && Math.random() > 0.6) {
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

    // Draw campaign title element
    const drawCampaignElement = (
      ctx: CanvasRenderingContext2D,
      element: CampaignElement
    ) => {
      ctx.save()
      ctx.translate(element.x, element.y)
      ctx.rotate((element.rotation * Math.PI) / 180)

      const color = element.color === 'lime' ? neonLime : celoYellow
      
      // Outer glow
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, element.size)
      glowGradient.addColorStop(0, hexToRgba(color, 0.6))
      glowGradient.addColorStop(0.5, hexToRgba(color, 0.3))
      glowGradient.addColorStop(1, hexToRgba(color, 0))
      
      ctx.beginPath()
      ctx.arc(0, 0, element.size, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Hexagon border
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = element.size * 0.8 * Math.cos(angle)
        const py = element.size * 0.8 * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.8
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.globalAlpha = 1

      // Background
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = element.size * 0.75 * Math.cos(angle)
        const py = element.size * 0.75 * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(10, 10, 10, 0.85)'
      ctx.fill()

      // Draw title text
      ctx.fillStyle = color
      ctx.font = `bold ${element.size * 0.15}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.fillText(element.title, 0, 0)
      ctx.shadowBlur = 0

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update campaign element positions and rotations
      campaignElementsRef.current.forEach((element) => {
        element.x += element.vx
        element.y += element.vy
        element.rotation += element.rotationSpeed

        // Bounce off edges
        if (element.x < element.size) {
          element.x = element.size
          element.vx = -element.vx
        }
        if (element.x > canvas.width - element.size) {
          element.x = canvas.width - element.size
          element.vx = -element.vx
        }
        if (element.y < element.size) {
          element.y = element.size
          element.vy = -element.vy
        }
        if (element.y > canvas.height - element.size) {
          element.y = canvas.height - element.size
          element.vy = -element.vy
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

      // Rebuild connections periodically
      if (Math.random() < 0.01) {
        buildConnections()
      }

      // Draw connections first (behind particles)
      particlesRef.current.forEach((particle) => {
        if (particle.isLarge) {
          particle.connections.forEach((connIndex) => {
            const connected = particlesRef.current[connIndex]
            if (connected) {
              const useLime = Math.random() > 0.5
              const color = useLime ? neonLime : celoYellow
              
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(connected.x, connected.y)
              ctx.strokeStyle = color
              ctx.globalAlpha = 0.25
              ctx.lineWidth = 1.5
              ctx.stroke()
              ctx.globalAlpha = 1
              
              // Draw small dots along the connection
              const steps = 4
              for (let s = 1; s < steps; s++) {
                const t = s / steps
                const bx = particle.x + (connected.x - particle.x) * t
                const by = particle.y + (connected.y - particle.y) * t
                ctx.beginPath()
                ctx.arc(bx, by, 1.5, 0, Math.PI * 2)
                ctx.fillStyle = color
                ctx.globalAlpha = 0.4
                ctx.fill()
                ctx.globalAlpha = 1
              }
            }
          })
        }
      })

      // Draw campaign elements (behind particles)
      campaignElementsRef.current.forEach((element) => {
        drawCampaignElement(ctx, element)
      })

      // Draw particles
      particlesRef.current.forEach((particle) => {
        const useLime = Math.random() > 0.5
        const color = useLime ? neonLime : celoYellow
        
        // Draw glow effect for large particles
        if (particle.isLarge) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2.5
          )
          const opacity1 = particle.opacity
          const opacity2 = particle.opacity * 0.4
          gradient.addColorStop(0, hexToRgba(color, opacity1))
          gradient.addColorStop(0.5, hexToRgba(color, opacity2))
          gradient.addColorStop(1, hexToRgba(color, 0))
          
          drawShape(ctx, particle.shape, particle.x, particle.y, particle.size * 2.5)
          ctx.fillStyle = gradient
          ctx.fill()
        }
        
        // Main particle
        drawShape(ctx, particle.shape, particle.x, particle.y, particle.size)
        ctx.fillStyle = color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1
        
        // Inner highlight for large particles
        if (particle.isLarge) {
          drawShape(ctx, particle.shape, particle.x, particle.y, particle.size * 0.4)
          ctx.fillStyle = color
          ctx.globalAlpha = 0.5
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Draw connections to nearby small particles
        if (!particle.isLarge) {
          particlesRef.current.forEach((other) => {
            if (other !== particle && !other.isLarge) {
              const dx = particle.x - other.x
              const dy = particle.y - other.y
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < 100) {
                const useLime = Math.random() > 0.5
                const color = useLime ? neonLime : celoYellow
                
                ctx.beginPath()
                ctx.moveTo(particle.x, particle.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = color
                ctx.globalAlpha = 0.15 * (1 - distance / 100)
                ctx.lineWidth = 0.5
                ctx.stroke()
                ctx.globalAlpha = 1
              }
            }
          })
        }
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
      style={{ zIndex: -10, opacity: 0.3 }}
    />
  )
}

