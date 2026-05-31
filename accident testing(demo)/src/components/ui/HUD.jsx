import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import Minimap from './Minimap'

/* ── Tiny stat chip ── */
function StatChip({ label, value, unit, color = '#FFD600' }) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.72)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: '6px 14px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        textAlign: 'center',
        minWidth: 80,
      }}
    >
      <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 900, color, lineHeight: 1.2, marginTop: 2 }}>
        {value}{unit && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  )
}

/* ── Combo ── */
function ComboDisplay({ combo }) {
  if (combo <= 1) return null
  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 1.6, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{ textAlign: 'center', pointerEvents: 'none' }}
      >
        <div style={{ fontFamily: 'Orbitron,sans-serif', color: '#FFD600', fontSize: 18, fontWeight: 900, textShadow: '0 0 16px rgba(255,214,0,0.8)' }}>COMBO!</div>
        <div style={{ fontFamily: 'Orbitron,sans-serif', color: '#ff6d00', fontSize: 32, fontWeight: 900 }}>x{combo.toFixed(1)}</div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── D-Pad Control Button ── */
function CtrlBtn({ src, alt, keyCode, isActive, style = {} }) {
  const fire = useCallback((down) => {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code: keyCode, bubbles: true }))
  }, [keyCode])

  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); fire(true) }}
      onPointerUp={(e) => { e.preventDefault(); fire(false) }}
      onPointerLeave={(e) => { e.preventDefault(); fire(false) }}
      onPointerCancel={(e) => { e.preventDefault(); fire(false) }}
      style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: isActive ? 'rgba(255,109,0,0.55)' : 'rgba(0,0,0,0.50)',
        border: isActive ? '2px solid rgba(255,109,0,0.8)' : '2px solid rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.08s, border-color 0.08s, transform 0.06s',
        transform: isActive ? 'scale(0.91)' : 'scale(1)',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: isActive ? '0 0 18px rgba(255,109,0,0.5)' : '0 2px 12px rgba(0,0,0,0.5)',
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={src} alt={alt}
        style={{ width: 38, height: 38, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))', pointerEvents: 'none' }}
        draggable={false}
      />
    </button>
  )
}

/* ── Mobile controls — landscape aware ── */
function MobileControls({ activeKeys, isLandscape }) {
  const btnSize = isLandscape ? 58 : 64

  const baseStyle = (isActive) => ({
    width: btnSize, height: btnSize,
    borderRadius: '50%',
    background: isActive ? 'rgba(255,109,0,0.55)' : 'rgba(0,0,0,0.50)',
    border: isActive ? '2px solid rgba(255,109,0,0.8)' : '2px solid rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.08s, border-color 0.08s, transform 0.06s',
    transform: isActive ? 'scale(0.91)' : 'scale(1)',
    cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none',
    touchAction: 'none',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    boxShadow: isActive ? '0 0 18px rgba(255,109,0,0.5)' : '0 2px 12px rgba(0,0,0,0.5)',
    flexShrink: 0,
  })

  const fire = (code, down) => {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }))
  }

  const Btn = ({ src, alt, code, active, extraStyle = {} }) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); fire(code, true) }}
      onPointerUp={(e) => { e.preventDefault(); fire(code, false) }}
      onPointerLeave={(e) => { e.preventDefault(); fire(code, false) }}
      onPointerCancel={(e) => { e.preventDefault(); fire(code, false) }}
      style={{ ...baseStyle(active), ...extraStyle }}
    >
      <img src={src} alt={alt} style={{ width: btnSize * 0.6, height: btnSize * 0.6, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))', pointerEvents: 'none' }} draggable={false} />
    </button>
  )

  const gap = isLandscape ? 8 : 10

  return (
    <div style={{
      position: 'absolute',
      bottom: isLandscape ? 10 : 16,
      left: 0, right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: isLandscape ? '0 16px' : '0 20px',
      pointerEvents: 'none',
      zIndex: 30,
    }}>
      {/* Left cluster — steering */}
      <div style={{ display: 'flex', gap, pointerEvents: 'all' }}>
        <Btn src="./ui/left button.png" alt="Left" code="ArrowLeft" active={activeKeys.left} />
        <Btn src="./ui/right button.png" alt="Right" code="ArrowRight" active={activeKeys.right} />
      </div>

      {/* Right cluster — gas/brake */}
      <div style={{ display: 'flex', gap, pointerEvents: 'all' }}>
        <Btn src="./ui/accelerate.png" alt="Gas" code="ArrowUp" active={activeKeys.up}
          extraStyle={{ background: activeKeys.up ? 'rgba(0,200,80,0.55)' : 'rgba(0,100,30,0.40)', borderColor: activeKeys.up ? 'rgba(0,255,80,0.7)' : 'rgba(0,200,80,0.25)', boxShadow: activeKeys.up ? '0 0 18px rgba(0,255,80,0.5)' : '0 2px 12px rgba(0,0,0,0.5)' }} />
        <Btn src="./ui/brake.png" alt="Brake" code="ArrowDown" active={activeKeys.down}
          extraStyle={{ background: activeKeys.down ? 'rgba(200,30,30,0.55)' : 'rgba(100,10,10,0.40)', borderColor: activeKeys.down ? 'rgba(255,50,50,0.7)' : 'rgba(200,30,30,0.25)', boxShadow: activeKeys.down ? '0 0 18px rgba(255,30,30,0.5)' : '0 2px 12px rgba(0,0,0,0.5)' }} />
      </div>
    </div>
  )
}

/* ── Main HUD ── */
export default function HUD() {
  const score = useGameStore(s => s.score)
  const speed = useGameStore(s => s.speed)
  const position = useGameStore(s => s.position)
  const totalRacers = useGameStore(s => s.totalRacers)
  const combo = useGameStore(s => s.combo)
  const gameState = useGameStore(s => s.gameState)

  const [activeKeys, setActiveKeys] = useState({ left: false, right: false, up: false, down: false })
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight)

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight)
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check) }
  }, [])

  useEffect(() => {
    const dn = (e) => {
      const c = e.code
      if (c === 'ArrowLeft'  || c === 'KeyA') setActiveKeys(p => ({ ...p, left: true }))
      if (c === 'ArrowRight' || c === 'KeyD') setActiveKeys(p => ({ ...p, right: true }))
      if (c === 'ArrowUp'    || c === 'KeyW') setActiveKeys(p => ({ ...p, up: true }))
      if (c === 'ArrowDown'  || c === 'KeyS') setActiveKeys(p => ({ ...p, down: true }))
    }
    const up = (e) => {
      const c = e.code
      if (c === 'ArrowLeft'  || c === 'KeyA') setActiveKeys(p => ({ ...p, left: false }))
      if (c === 'ArrowRight' || c === 'KeyD') setActiveKeys(p => ({ ...p, right: false }))
      if (c === 'ArrowUp'    || c === 'KeyW') setActiveKeys(p => ({ ...p, up: false }))
      if (c === 'ArrowDown'  || c === 'KeyS') setActiveKeys(p => ({ ...p, down: false }))
    }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  if (gameState !== 'playing') return null

  const miniSize = isLandscape ? { width: 100, height: 120 } : { width: 150, height: 180 }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>

      {/* ── Top-left: minimap ── */}
      <div style={{ position: 'absolute', top: isLandscape ? 8 : 12, left: isLandscape ? 8 : 12 }}>
        <Minimap width={miniSize.width} height={miniSize.height} compact={isLandscape} />
      </div>

      {/* ── Top-right: stats ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          position: 'absolute',
          top: isLandscape ? 8 : 12,
          right: isLandscape ? 8 : 12,
          display: 'flex',
          flexDirection: isLandscape ? 'column' : 'column',
          gap: isLandscape ? 5 : 7,
        }}
      >
        <StatChip label="POS" value={`${position}/${totalRacers}`} color="#fff" />
        <StatChip label="SCORE" value={Math.floor(score).toLocaleString()} color="#FFD600" />
        <StatChip label="SPEED" value={Math.floor(speed)} unit="KM/H" color="#ff6d00" />
      </motion.div>

      {/* ── Centre: combo ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', paddingBottom: isLandscape ? '10%' : '20%' }}>
        <ComboDisplay combo={combo} />
      </div>

      {/* ── Mobile controls ── */}
      <div style={{ pointerEvents: 'auto' }}>
        <MobileControls activeKeys={activeKeys} isLandscape={isLandscape} />
      </div>

      {/* ── Speed lines overlay ── */}
      {speed > 200 && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(255,255,255,0.04) 100%)',
            pointerEvents: 'none',
            opacity: Math.min(1, (speed - 200) / 120) * 0.7,
          }}
        />
      )}
    </div>
  )
}
