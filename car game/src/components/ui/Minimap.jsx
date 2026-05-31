import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

const MINIMAP_PATH = [
  [0.4, 0.83],   // Start / Checkered line
  [0.6, 0.83],   // Straight bottom-right
  [0.78, 0.83],  // Pre-curve
  [0.86, 0.78],  // Bottom-right corner curve
  [0.9, 0.7],    // Right edge going up
  [0.9, 0.45],   // Right vertical middle
  [0.9, 0.22],   // Right vertical top
  [0.86, 0.13],  // Top-right corner curve
  [0.78, 0.08],  // Top stretch right
  [0.55, 0.11],  // Top stretch dip
  [0.32, 0.08],  // Top stretch left
  [0.14, 0.13],  // Top-left corner curve
  [0.08, 0.25],  // Left edge going down
  [0.08, 0.38],  // Left edge bottom-left of top loop
  [0.15, 0.45],  // Curve wrapping under top loop
  [0.25, 0.45],  // Going right under top loop
  [0.35, 0.35],  // Curve going up-right towards center M
  [0.45, 0.28],  // Peak of first part of M
  [0.52, 0.48],  // Dip in the middle of M
  [0.62, 0.32],  // Peak of second part of M
  [0.7, 0.26],   // Top of the right loop of M
  [0.74, 0.35],  // Right corner of right loop of M
  [0.74, 0.6],   // Vertical drop inside center
  [0.55, 0.52],  // Diagonal stretch going down-left
  [0.32, 0.47],  // Lower diagonal left
  [0.18, 0.52],  // Mid-left curve going down
  [0.08, 0.62],  // Outer bottom-left curve down
  [0.08, 0.76],  // Outer bottom-left curve bottom
  [0.15, 0.83],  // Bottom-left corner curve
  [0.4, 0.83],   // Back to Checkered line (Start)
]

export default function Minimap() {
  const canvasRef = useRef()
  const distance = useGameStore(s => s.distance)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // 1. Draw Green Grass Background
    ctx.fillStyle = '#2e7d32'
    ctx.fillRect(0, 0, w, h)

    // Draw some simple decorative light-green pyramids/triangles on the grass
    ctx.fillStyle = '#388e3c'
    const pyramids = [
      [20, 20], [50, 40], [80, 25], [130, 30],
      [15, 80], [45, 95], [125, 75], [140, 110],
      [35, 140], [85, 160], [120, 150], [60, 120]
    ]
    pyramids.forEach(([px, py]) => {
      ctx.beginPath()
      ctx.moveTo(px, py - 4)
      ctx.lineTo(px + 4, py + 4)
      ctx.lineTo(px - 4, py + 4)
      ctx.closePath()
      ctx.fill()
    })

    // Helper to draw track path
    const drawTrackPath = () => {
      ctx.beginPath()
      MINIMAP_PATH.forEach(([px, py], i) => {
        const mx = px * w, my = py * h
        i === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my)
      })
      ctx.closePath()
    }

    // 2. Draw Orange/Yellow Outer Borders
    ctx.strokeStyle = '#ffa726'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    drawTrackPath()
    ctx.stroke()

    // 3. Draw Dark Grey Road Surface
    ctx.strokeStyle = '#212121'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    drawTrackPath()
    ctx.stroke()

    // 4. Draw White Dashed Center Lane Line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 0.8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.setLineDash([3, 4])
    drawTrackPath()
    ctx.stroke()
    ctx.setLineDash([]) // Reset dash

    // 5. Draw Checkered Finish Line
    const fx = MINIMAP_PATH[0][0] * w
    const fy = MINIMAP_PATH[0][1] * h
    const size = 3
    // Draw a 2x4 checkerboard strip vertically across the road
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#000000'
        ctx.fillRect(fx - size + c * size, fy - 6 + r * 3, size, 3)
      }
    }

    // 6. Draw Player Position (red dot with glow and inner center point)
    const progress = (distance * 0.0015) % 1 // Slightly adjust mapping speed factor
    const idx = progress * (MINIMAP_PATH.length - 1)
    const lo = Math.floor(idx), hi = Math.min(MINIMAP_PATH.length - 1, lo + 1)
    const t = idx - lo
    const px = (MINIMAP_PATH[lo][0] * (1 - t) + MINIMAP_PATH[hi][0] * t) * w
    const py = (MINIMAP_PATH[lo][1] * (1 - t) + MINIMAP_PATH[hi][1] * t) * h

    ctx.shadowColor = '#e53935'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#e53935'
    ctx.beginPath()
    ctx.arc(px, py, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Inner white point for player dot
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fill()
  }, [distance])

  return (
    <div className="glass rounded-xl p-2 pointer-events-none">
      <div className="font-orb text-[10px] text-white/60 tracking-[3px] text-center mb-1">
        TRACK MAP
      </div>
      <canvas ref={canvasRef} width={150} height={180} className="rounded-md" />
    </div>
  )
}
