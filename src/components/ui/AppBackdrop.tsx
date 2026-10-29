'use client'

import { useEffect, useRef } from 'react'

interface InteractiveBackdropProps {
  text?: string
}

export default function InteractiveBackdrop({ text = 'Engineering monk' }: InteractiveBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = 0
    let height = 0
    let mouse = { x: -1000, y: -1000, active: false }
    let time = 0

    // Offscreen mask for the text cutout
    const maskCanvas = document.createElement('canvas')
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Update text mask
      if (maskCtx) {
        maskCanvas.width = canvas.width
        maskCanvas.height = canvas.height
        maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        maskCtx.fillStyle = '#000000'
        maskCtx.fillRect(0, 0, width, height)

        const fontSize = Math.min(width * 0.08, 90)
        maskCtx.font = `800 ${fontSize}px Geist, "Geist Sans", system-ui, sans-serif`
        maskCtx.textAlign = 'center'
        maskCtx.textBaseline = 'middle'
        maskCtx.fillStyle = '#ffffff'
        maskCtx.fillText(text, width / 2, height / 2)
      }
    }

    const handlePointerMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    const handlePointerLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('mouseleave', handlePointerLeave)
    handleResize()

    // Grid parameters
    const step = 28 // 28px cell grid for smooth 60fps performance
    const baseRadius = 2.5

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      // Solid background
      ctx.fillStyle = '#F97316'
      ctx.fillRect(0, 0, width, height)

      // Fetch mask pixels if available
      let maskData: Uint8ClampedArray | null = null
      if (maskCtx) {
        try {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
          maskData = maskCtx.getImageData(0, 0, Math.round(width * dpr), Math.round(height * dpr)).data
        } catch {}
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const maskW = Math.round(width * dpr)

      const cols = Math.ceil(width / step)
      const rows = Math.ceil(height / step)
      const startX = (width - cols * step) / 2 + step / 2
      const startY = (height - rows * step) / 2 + step / 2

      ctx.save()

      for (let r = 0; r < rows; r++) {
        const y = startY + r * step
        for (let c = 0; c < cols; c++) {
          const x = startX + c * step

          // Check if point falls on the text cutout
          if (maskData) {
            const px = Math.floor(x * dpr)
            const py = Math.floor(y * dpr)
            const idx = (py * maskW + px) * 4
            if (maskData[idx] > 128) {
              continue // Carve out the text: leave empty
            }
          }

          // Flow wave morphing equation
          const wave = Math.sin(x * 0.015 + time) * Math.cos(y * 0.015 + time * 0.8)
          
          // Cursor interaction ripple
          let dist = 1000
          if (mouse.active) {
            dist = Math.hypot(x - mouse.x, y - mouse.y)
          }

          const hoverInfluence = Math.max(0, 1 - dist / 140)
          const radius = Math.max(1, baseRadius + wave * 1.5 + hoverInfluence * 4)

          // Shape decision based on wave bands
          const band = Math.floor(((wave + 1) * 0.5 + hoverInfluence * 0.5) * 3) % 3

          if (hoverInfluence > 0.1) {
            ctx.fillStyle = '#161414'
          } else {
            ctx.fillStyle = '#000000'
          }

          if (band === 0) {
            // Triangle
            ctx.beginPath()
            ctx.moveTo(x, y - radius)
            ctx.lineTo(x + radius, y + radius)
            ctx.lineTo(x - radius, y + radius)
            ctx.closePath()
            ctx.fill()
          } else if (band === 1) {
            // Circle
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // Square
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
          }
        }
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [text])

  return (
    <div 
      className="fixed inset-0 -z-50 pointer-events-none overflow-hidden h-screen w-screen"
      style={{ backgroundColor: '#F97316' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
