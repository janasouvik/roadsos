import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'

const CAR_COLORS_MAP = {
  red:    '#e53935', blue: '#1565C0', white: '#ECEFF1',
  yellow: '#F9A825', green: '#2E7D32',
}

// Mini canvas car preview
function CarPreview({ color }) {
  const cRef = useRef()

  useEffect(() => {
    const canvas = cRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // BG
    ctx.fillStyle = '#0a0a18'
    ctx.fillRect(0, 0, w, h)
    const grd = ctx.createRadialGradient(w/2, h*0.6, 20, w/2, h/2, h * 0.7)
    grd.addColorStop(0, 'rgba(255,109,0,.15)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h)

    // Shadow
    ctx.save()
    ctx.globalAlpha = .3
    ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.ellipse(w/2, h*0.75, 50, 14, 0, 0, Math.PI*2); ctx.fill()
    ctx.restore()

    // Car body
    const col = CAR_COLORS_MAP[color] || '#e53935'
    ctx.fillStyle = col
    // Main body
    ctx.beginPath()
    ctx.roundRect(w/2 - 36, h/2 - 28, 72, 56, 6)
    ctx.fill()
    // Cabin
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.roundRect(w/2 - 26, h/2 - 48, 52, 26, 5)
    ctx.fill()
    // Windshield
    ctx.fillStyle = 'rgba(150,230,255,.75)'
    ctx.beginPath()
    ctx.roundRect(w/2 - 22, h/2 - 44, 44, 20, 3)
    ctx.fill()
    // Stripe
    ctx.fillStyle = 'rgba(0,0,0,.3)'
    ctx.fillRect(w/2 - 4, h/2 - 28, 8, 56)
    // Wheels
    ctx.fillStyle = '#111'
    ;[[-34, -14],[34, -14],[-34, 14],[34, 14]].forEach(([ox, oy]) => {
      ctx.beginPath()
      ctx.ellipse(w/2 + ox, h/2 + oy, 10, 8, Math.PI/2, 0, Math.PI*2)
      ctx.fill()
    })
    // Headlights
    ctx.fillStyle = '#FFEE58'
    ctx.fillRect(w/2 - 30, h/2 - 30, 12, 5)
    ctx.fillRect(w/2 + 18, h/2 - 30, 12, 5)
    // Tail lights
    ctx.fillStyle = '#e53935'
    ctx.fillRect(w/2 - 30, h/2 + 25, 12, 4)
    ctx.fillRect(w/2 + 18, h/2 + 25, 12, 4)
  }, [color])

  return <canvas ref={cRef} width={220} height={160} className="rounded-xl" />
}

const COLOR_OPTS = ['red','blue','white','yellow','green']
const COLOR_HEX = { red:'#e53935', blue:'#1565C0', white:'#ECEFF1', yellow:'#F9A825', green:'#2E7D32' }

export default function MainMenu() {
  const gameState = useGameStore(s => s.gameState)
  const bestScore = useGameStore(s => s.bestScore)
  const playerColor = useGameStore(s => s.playerColor)
  const timeOfDay = useGameStore(s => s.timeOfDay)
  const trafficDensity = useGameStore(s => s.trafficDensity)
  const startGame = useGameStore(s => s.startGame)
  const setPlayerColor = useGameStore(s => s.setPlayerColor)
  const setTimeOfDay = useGameStore(s => s.setTimeOfDay)
  const setTrafficDensity = useGameStore(s => s.setTrafficDensity)
  const setGameState = useGameStore(s => s.setGameState)
  const { playClick } = useAudio()

  if (gameState !== 'menu') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,80,0,.3) 0%, transparent 60%), linear-gradient(160deg, #080810 0%, #111827 50%, #0a0f1a 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="font-orb text-5xl font-black tracking-widest"
               style={{ color: '#ff6d00', textShadow: '0 0 40px rgba(255,109,0,0.8)' }}>
            HIGHWAY
          </div>
          <div className="font-orb text-xl font-bold text-white tracking-[6px]">
            TRAFFIC RACER
          </div>
          <div className="font-raj text-xs text-white/35 tracking-[5px] mt-1">
            3D ULTIMATE EDITION
          </div>
        </motion.div>

        {/* Car preview */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <CarPreview color={playerColor} />
        </motion.div>

        {/* Color picker */}
        <div className="flex gap-3">
          {COLOR_OPTS.map(c => (
            <button key={c}
              onClick={() => { playClick(); setPlayerColor(c); }}
              className="w-9 h-9 rounded-full border-2 transition-all"
              style={{
                background: COLOR_HEX[c],
                borderColor: playerColor === c ? '#fff' : 'transparent',
                transform: playerColor === c ? 'scale(1.25)' : 'scale(1)',
              }}
              title={c}
            />
          ))}
        </div>

        {/* Settings inline */}
        <div className="glass rounded-2xl p-4 w-full flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-raj text-sm text-white/55 tracking-widest">TIME OF DAY</span>
            <div className="flex gap-2">
              {[['day','☀️'],['sunset','🌅'],['night','🌙']].map(([v, e]) => (
                <button key={v} onClick={() => { playClick(); setTimeOfDay(v); }}
                  className={`px-3 py-1 rounded-lg text-sm font-raj font-bold transition-all ${timeOfDay === v ? 'bg-orange-500 text-white' : 'glass text-white/60'}`}>
                  {e} {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-raj text-sm text-white/55 tracking-widest">TRAFFIC</span>
            <div className="flex gap-2">
              {['low','medium','high'].map(v => (
                <button key={v} onClick={() => { playClick(); setTrafficDensity(v); }}
                  className={`px-3 py-1 rounded-lg text-sm font-raj font-bold capitalize transition-all ${trafficDensity === v ? 'bg-orange-500 text-white' : 'glass text-white/60'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Best score */}
        <div className="font-raj text-sm text-white/40 tracking-widest">
          BEST SCORE: <span className="text-yellow-400 font-bold">{bestScore.toLocaleString()}</span>
        </div>

        {/* Play button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { playClick(); startGame(); }}
          className="w-full py-4 rounded-2xl font-orb font-black text-xl tracking-widest text-white
                     bg-gradient-to-br from-orange-500 to-red-600
                     shadow-[0_6px_32px_rgba(255,109,0,0.6)]
                     hover:shadow-[0_8px_48px_rgba(255,109,0,0.9)] transition-shadow"
        >
          ▶ PLAY
        </motion.button>
      </div>
    </motion.div>
  )
}
