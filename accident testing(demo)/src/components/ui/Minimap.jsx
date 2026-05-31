import React, { useRef, useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'

const MINIMAP_PATH = [
  [0.4, 0.83], [0.6, 0.83], [0.78, 0.83], [0.86, 0.78],
  [0.9, 0.7],  [0.9, 0.45], [0.9, 0.22],  [0.86, 0.13],
  [0.78, 0.08],[0.55, 0.11],[0.32, 0.08],  [0.14, 0.13],
  [0.08, 0.25],[0.08, 0.38],[0.15, 0.45],  [0.25, 0.45],
  [0.35, 0.35],[0.45, 0.28],[0.52, 0.48],  [0.62, 0.32],
  [0.7, 0.26], [0.74, 0.35],[0.74, 0.6],   [0.55, 0.52],
  [0.32, 0.47],[0.18, 0.52],[0.08, 0.62],  [0.08, 0.76],
  [0.15, 0.83],[0.4, 0.83],
]

export default function Minimap({ width = 150, height = 180, compact = false }) {
  const canvasRef = useRef()
  const distance = useGameStore(s => s.distance)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // Grass BG
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#1b5e20')
    grad.addColorStop(1, '#2e7d32')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Track helpers
    const drawPath = () => {
      ctx.beginPath()
      MINIMAP_PATH.forEach(([px, py], i) => {
        const mx = px * w, my = py * h
        i === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my)
      })
      ctx.closePath()
    }

    // Outer border
    ctx.strokeStyle = '#ffa726'
    ctx.lineWidth = compact ? 9 : 12
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    drawPath(); ctx.stroke()

    // Road surface
    ctx.strokeStyle = '#212121'
    ctx.lineWidth = compact ? 6 : 8
    drawPath(); ctx.stroke()

    // Center dash
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = compact ? 0.6 : 0.8
    ctx.setLineDash([3, 5])
    drawPath(); ctx.stroke()
    ctx.setLineDash([])

    // Checkered start/finish
    const fx = MINIMAP_PATH[0][0] * w, fy = MINIMAP_PATH[0][1] * h
    const sz = compact ? 2.5 : 3
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#fff' : '#000'
      ctx.fillRect(fx - sz + c * sz, fy - 5 + r * sz, sz, sz)
    }

    // Player dot
    const progress = (distance * 0.0015) % 1
    const idx = progress * (MINIMAP_PATH.length - 1)
    const lo = Math.floor(idx), hi = Math.min(MINIMAP_PATH.length - 1, lo + 1)
    const t = idx - lo
    const px = (MINIMAP_PATH[lo][0] * (1 - t) + MINIMAP_PATH[hi][0] * t) * w
    const py = (MINIMAP_PATH[lo][1] * (1 - t) + MINIMAP_PATH[hi][1] * t) * h

    // Glow ring
    const grd2 = ctx.createRadialGradient(px, py, 0, px, py, compact ? 8 : 10)
    grd2.addColorStop(0, 'rgba(255,60,60,0.5)')
    grd2.addColorStop(1, 'rgba(255,60,60,0)')
    ctx.fillStyle = grd2
    ctx.beginPath(); ctx.arc(px, py, compact ? 8 : 10, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#e53935'
    ctx.beginPath(); ctx.arc(px, py, compact ? 4 : 6, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(px, py, compact ? 1.5 : 2, 0, Math.PI * 2); ctx.fill()

  }, [distance, width, height, compact])

  return (
    <div style={{
      background: 'rgba(0,0,0,0.70)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: compact ? 10 : 14,
      padding: compact ? 6 : 8,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      pointerEvents: 'none',
    }}>
      {!compact && (
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' }}>
          TRACK MAP
        </div>
      )}
      <canvas ref={canvasRef} width={width} height={height} style={{ borderRadius: compact ? 6 : 8, display: 'block' }} />
    </div>
  )
}
