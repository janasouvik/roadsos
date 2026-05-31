import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'

const CAR_COLORS_MAP = {
  red: '#e53935', blue: '#1565C0', white: '#ECEFF1', yellow: '#F9A825', green: '#2E7D32',
}

/* ── Car canvas preview ── */
function CarPreview({ color, size = 180 }) {
  const cRef = useRef()

  useEffect(() => {
    const canvas = cRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#0a0a18'
    ctx.fillRect(0, 0, w, h)
    const grd = ctx.createRadialGradient(w / 2, h * 0.6, 20, w / 2, h / 2, h * 0.7)
    grd.addColorStop(0, 'rgba(255,109,0,.18)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h)

    ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.75, 50, 14, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    const col = CAR_COLORS_MAP[color] || '#e53935'
    ctx.fillStyle = col
    ctx.beginPath(); ctx.roundRect(w / 2 - 36, h / 2 - 28, 72, 56, 6); ctx.fill()
    ctx.beginPath(); ctx.roundRect(w / 2 - 26, h / 2 - 48, 52, 26, 5); ctx.fill()
    ctx.fillStyle = 'rgba(150,230,255,.75)'
    ctx.beginPath(); ctx.roundRect(w / 2 - 22, h / 2 - 44, 44, 20, 3); ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,.3)'
    ctx.fillRect(w / 2 - 4, h / 2 - 28, 8, 56)
    ctx.fillStyle = '#111'
    ;[[-34, -14], [34, -14], [-34, 14], [34, 14]].forEach(([ox, oy]) => {
      ctx.beginPath(); ctx.ellipse(w / 2 + ox, h / 2 + oy, 10, 8, Math.PI / 2, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = '#FFEE58'
    ctx.fillRect(w / 2 - 30, h / 2 - 30, 12, 5)
    ctx.fillRect(w / 2 + 18, h / 2 - 30, 12, 5)
    ctx.fillStyle = '#e53935'
    ctx.fillRect(w / 2 - 30, h / 2 + 25, 12, 4)
    ctx.fillRect(w / 2 + 18, h / 2 + 25, 12, 4)
  }, [color, size])

  return <canvas ref={cRef} width={size} height={Math.round(size * 0.73)} style={{ borderRadius: 12, display: 'block' }} />
}

const COLOR_OPTS = ['red', 'blue', 'white', 'yellow', 'green']
const COLOR_HEX = { red: '#e53935', blue: '#1565C0', white: '#ECEFF1', yellow: '#F9A825', green: '#2E7D32' }

/* ── Pill toggle button ── */
function PillBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: 8,
        fontSize: 11,
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 700,
        letterSpacing: 0.5,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: active ? 'linear-gradient(135deg,#ff6d00,#ff3d00)' : 'rgba(255,255,255,0.08)',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
        boxShadow: active ? '0 2px 12px rgba(255,109,0,0.5)' : 'none',
        transform: active ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  )
}

export default function MainMenu() {
  const gameState      = useGameStore(s => s.gameState)
  const bestScore      = useGameStore(s => s.bestScore)
  const playerColor    = useGameStore(s => s.playerColor)
  const timeOfDay      = useGameStore(s => s.timeOfDay)
  const trafficDensity = useGameStore(s => s.trafficDensity)
  const startGame      = useGameStore(s => s.startGame)
  const setPlayerColor = useGameStore(s => s.setPlayerColor)
  const setTimeOfDay   = useGameStore(s => s.setTimeOfDay)
  const setTrafficDensity = useGameStore(s => s.setTrafficDensity)
  const { playClick }  = useAudio()

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight)

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight)
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check) }
  }, [])

  if (gameState !== 'menu') return null

  const carSize = isLandscape ? 140 : 200

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,80,0,.28) 0%, transparent 60%), linear-gradient(160deg, #080810 0%, #111827 50%, #0a0f1a 100%)',
        overflowY: 'auto',
        padding: isLandscape ? '8px 16px' : '16px',
      }}
    >
      {isLandscape ? (
        /* ════ LANDSCAPE LAYOUT — two columns ════ */
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%', maxWidth: 720 }}>

          {/* Left column — logo + car */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 26, fontWeight: 900, letterSpacing: 6, color: '#ff6d00', textShadow: '0 0 30px rgba(255,109,0,0.8)' }}>HIGHWAY</div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 4 }}>TRAFFIC RACER</div>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginTop: 2 }}>3D ULTIMATE EDITION</div>
            </motion.div>

            <CarPreview color={playerColor} size={carSize} />

            {/* Color swatches */}
            <div style={{ display: 'flex', gap: 8 }}>
              {COLOR_OPTS.map(c => (
                <button key={c}
                  onClick={() => { playClick(); setPlayerColor(c) }}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: COLOR_HEX[c],
                    border: playerColor === c ? '2px solid #fff' : '2px solid transparent',
                    transform: playerColor === c ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
              BEST: <span style={{ color: '#FFD600', fontWeight: 700 }}>{bestScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Right column — settings + play */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Settings card */}
            <div style={{
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,120,0,0.25)',
              borderRadius: 16, padding: '14px 18px', backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}>
              {/* Time of day */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>TIME</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['day', '☀️'], ['sunset', '🌅'], ['night', '🌙']].map(([v, e]) => (
                    <PillBtn key={v} active={timeOfDay === v} onClick={() => { playClick(); setTimeOfDay(v) }}>{e} {v}</PillBtn>
                  ))}
                </div>
              </div>
              {/* Traffic */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>TRAFFIC</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['low', 'medium', 'high'].map(v => (
                    <PillBtn key={v} active={trafficDensity === v} onClick={() => { playClick(); setTrafficDensity(v) }}>{v}</PillBtn>
                  ))}
                </div>
              </div>
            </div>

            {/* Play button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { playClick(); startGame() }}
              style={{
                width: '100%', padding: '16px 0',
                borderRadius: 16, border: 'none', cursor: 'pointer',
                fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 18,
                letterSpacing: 3, color: '#fff',
                background: 'linear-gradient(135deg,#ff6d00,#ff3d00)',
                boxShadow: '0 6px 30px rgba(255,109,0,0.6)',
              }}
            >
              ▶ PLAY
            </motion.button>
          </div>
        </div>
      ) : (
        /* ════ PORTRAIT LAYOUT — single column ════ */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 40, fontWeight: 900, letterSpacing: 8, color: '#ff6d00', textShadow: '0 0 40px rgba(255,109,0,0.8)' }}>HIGHWAY</div>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: 6 }}>TRAFFIC RACER</div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 5, marginTop: 4 }}>3D ULTIMATE EDITION</div>
          </motion.div>

          {/* Car preview */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <CarPreview color={playerColor} size={220} />
          </motion.div>

          {/* Color picker */}
          <div style={{ display: 'flex', gap: 12 }}>
            {COLOR_OPTS.map(c => (
              <button key={c}
                onClick={() => { playClick(); setPlayerColor(c) }}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: COLOR_HEX[c],
                  border: playerColor === c ? '2.5px solid #fff' : '2.5px solid transparent',
                  transform: playerColor === c ? 'scale(1.25)' : 'scale(1)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Settings */}
          <div style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,120,0,0.25)',
            borderRadius: 18, padding: '16px 20px', width: '100%',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase' }}>Time of Day</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['day', '☀️'], ['sunset', '🌅'], ['night', '🌙']].map(([v, e]) => (
                  <PillBtn key={v} active={timeOfDay === v} onClick={() => { playClick(); setTimeOfDay(v) }}>{e} {v}</PillBtn>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase' }}>Traffic</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['low', 'medium', 'high'].map(v => (
                  <PillBtn key={v} active={trafficDensity === v} onClick={() => { playClick(); setTrafficDensity(v) }}>{v}</PillBtn>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
            BEST SCORE: <span style={{ color: '#FFD600', fontWeight: 700 }}>{bestScore.toLocaleString()}</span>
          </div>

          {/* Play button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { playClick(); startGame() }}
            style={{
              width: '100%', padding: '18px 0',
              borderRadius: 18, border: 'none', cursor: 'pointer',
              fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 20,
              letterSpacing: 4, color: '#fff',
              background: 'linear-gradient(135deg,#ff6d00,#ff3d00)',
              boxShadow: '0 6px 32px rgba(255,109,0,0.6)',
            }}
          >
            ▶ PLAY
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
