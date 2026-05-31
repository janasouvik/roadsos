import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'

export default function GameOver() {
  const gameState  = useGameStore(s => s.gameState)
  const score      = useGameStore(s => s.score)
  const maxSpeed   = useGameStore(s => s.maxSpeed)
  const distance   = useGameStore(s => s.distance)
  const overtakes  = useGameStore(s => s.overtakes)
  const bestScore  = useGameStore(s => s.bestScore)
  const startGame  = useGameStore(s => s.startGame)
  const setGameState = useGameStore(s => s.setGameState)
  const { playClick } = useAudio()

  const [countdown, setCountdown]     = useState(0)
  const [sosCancelled, setSosCancelled] = useState(false)
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight)

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight)
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check) }
  }, [])

  useEffect(() => {
    if (gameState === 'gameover') {
      setCountdown(0)
      setSosCancelled(false)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'gameover' || sosCancelled || countdown === null) return
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      window.location.href = `/dashboard?accident=true&speed=${Math.floor(maxSpeed)}&overtakes=${overtakes}&distance=${Math.floor(distance)}`
    }
  }, [gameState, countdown, sosCancelled, maxSpeed, overtakes, distance])

  if (gameState !== 'gameover') return null

  const stats = [
    ['Distance', `${Math.floor(distance)}m`],
    ['Score', Math.floor(score).toLocaleString()],
    ['Max Speed', `${Math.floor(maxSpeed)} km/h`],
    ['Best', bestScore.toLocaleString()],
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,10,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      overflowY: 'auto',
      padding: isLandscape ? '8px 16px' : '16px',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{
          background: 'rgba(15,15,22,0.92)',
          border: '1px solid rgba(255,30,45,0.22)',
          borderRadius: 24,
          padding: isLandscape ? '16px 20px' : '24px 20px',
          width: '100%',
          maxWidth: isLandscape ? 680 : 420,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(255,30,45,0.15), 0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Red glow top */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: 100,
          background: 'rgba(255,30,45,0.22)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {isLandscape ? (
            /* ════ LANDSCAPE LAYOUT ════ */
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

              {/* Left column — title + SOS timer */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 4, textTransform: 'uppercase', lineHeight: 1 }}>
                  Game Over
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', position: 'relative', width: 10, height: 10 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', animation: 'ping 1s infinite', opacity: 0.75 }} />
                    <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-flex' }} />
                  </span>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: 3, textTransform: 'uppercase' }}>Crash Detected</span>
                </div>

                {/* SOS timer */}
                <AnimatePresence mode="wait">
                  {!sosCancelled ? (
                    <motion.div key="sos"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: 'linear-gradient(160deg,rgba(80,0,0,0.7),rgba(20,20,28,0.9))',
                        border: '1px solid rgba(255,30,45,0.3)',
                        borderRadius: 16, padding: '14px 16px',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,30,45,0.05)', animation: 'pulse 2s infinite', borderRadius: 16 }} />
                      <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 10, color: '#fca5a5', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, position: 'relative' }}>
                        Emergency SOS in
                      </p>
                      <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 0 20px rgba(255,30,45,0.8)', marginBottom: 12, position: 'relative' }}>
                        {countdown}
                      </div>
                      <button
                        onClick={() => { playClick(); setSosCancelled(true) }}
                        style={{
                          width: '100%', padding: '10px 0',
                          borderRadius: 10, border: '1px solid rgba(255,30,45,0.4)',
                          fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12,
                          letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
                          background: 'rgba(255,30,45,0.12)', color: '#fca5a5',
                          transition: 'all 0.2s', position: 'relative',
                        }}
                        onMouseEnter={e => { e.target.style.background = '#dc2626'; e.target.style.color = '#fff' }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(255,30,45,0.12)'; e.target.style.color = '#fca5a5' }}
                      >
                        Cancel SOS
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="cancelled"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(20,83,45,0.3)', border: '1px solid rgba(34,197,94,0.2)' }}
                    >
                      <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', fontWeight: 700 }}>
                        ✓ SOS Cancelled
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right column — stats + buttons */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {stats.map(([label, val]) => (
                    <div key={label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '10px 8px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>{label}</span>
                      <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => { playClick(); startGame() }}
                    style={{
                      padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                      fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14,
                      letterSpacing: 3, textTransform: 'uppercase', color: '#fff',
                      background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.boxShadow = '0 4px 28px rgba(37,99,235,0.65)' }}
                    onMouseLeave={e => { e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)' }}
                  >
                    ↺ Play Again
                  </button>
                  <button
                    onClick={() => { playClick(); setGameState('menu') }}
                    style={{
                      padding: '12px 0', borderRadius: 14, cursor: 'pointer',
                      fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13,
                      letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.09)'; e.target.style.color = '#fff' }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    ← Main Menu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ════ PORTRAIT LAYOUT ════ */
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: 4, textTransform: 'uppercase' }}>Game Over</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ display: 'inline-flex', position: 'relative', width: 10, height: 10 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', animation: 'ping 1s infinite', opacity: 0.75 }} />
                    <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-flex' }} />
                  </span>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 700, color: '#ef4444', letterSpacing: 3, textTransform: 'uppercase' }}>Crash Detected</span>
                </div>
              </div>

              {/* SOS timer */}
              <AnimatePresence mode="wait">
                {!sosCancelled ? (
                  <motion.div key="sos"
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{
                      background: 'linear-gradient(160deg,rgba(80,0,0,0.7),rgba(20,20,28,0.9))',
                      border: '1px solid rgba(255,30,45,0.3)',
                      borderRadius: 20, padding: '20px 16px', marginBottom: 20,
                      position: 'relative', overflow: 'hidden', textAlign: 'center',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,30,45,0.04)', animation: 'pulse 2s infinite', borderRadius: 20 }} />
                    <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: '#fca5a5', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, position: 'relative' }}>
                      Triggering Emergency SOS in
                    </p>
                    <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 0 24px rgba(255,30,45,0.9)', marginBottom: 16, position: 'relative' }}>
                      {countdown}
                    </div>
                    <button
                      onClick={() => { playClick(); setSosCancelled(true) }}
                      style={{
                        width: '100%', padding: '14px 0',
                        borderRadius: 12, border: '1px solid rgba(255,30,45,0.4)',
                        fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13,
                        letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
                        background: 'rgba(255,30,45,0.12)', color: '#fca5a5',
                        transition: 'all 0.25s', position: 'relative',
                      }}
                      onMouseEnter={e => { e.target.style.background = '#dc2626'; e.target.style.color = '#fff' }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(255,30,45,0.12)'; e.target.style.color = '#fca5a5' }}
                    >
                      Cancel SOS Alert
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="cancelled"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 16, background: 'rgba(20,83,45,0.3)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}
                  >
                    <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                      ✓ SOS Cancelled
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {stats.map(([label, val]) => (
                  <div key={label} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 8px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{label}</span>
                    <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 17, fontWeight: 700, color: '#fff' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { playClick(); startGame() }}
                  style={{
                    padding: '16px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
                    fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15,
                    letterSpacing: 3, textTransform: 'uppercase', color: '#fff',
                    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                    boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  ↺ Play Again
                </button>
                <button
                  onClick={() => { playClick(); setGameState('menu') }}
                  style={{
                    padding: '14px 0', borderRadius: 16, cursor: 'pointer',
                    fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14,
                    letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                  }}
                >
                  ← Main Menu
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
