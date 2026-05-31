import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import Minimap from './Minimap'

function HudCard({ label, value, unit }) {
  return (
    <div className="glass rounded-xl px-4 py-2 min-w-[160px] text-center">
      <div className="font-orb text-[10px] text-white/55 tracking-[3px] uppercase">{label}</div>
      <div className="font-orb text-2xl font-black text-yellow-400 leading-tight mt-0.5">
        {value}{unit && <span className="text-sm text-white/40 ml-1">{unit}</span>}
      </div>
    </div>
  )
}

function ComboDisplay({ combo }) {
  if (combo <= 1) return null
  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center pointer-events-none"
      >
        <div className="font-orb text-yellow-400 text-2xl font-black drop-shadow-[0_0_12px_rgba(255,214,0,0.8)]">
          COMBO!
        </div>
        <div className="font-orb text-orange-500 text-4xl font-black">
          x{combo.toFixed(1)}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}



// Mobile touch controls
function MobileControls({ activeKeys }) {
  const fire = (code, down) => {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }))
  }
  
  const getBtnClass = (isActive) => {
    return `w-20 h-20 transition-all duration-75 flex items-center justify-center select-none ${
      isActive 
        ? 'scale-90 opacity-100 brightness-125' 
        : 'scale-100 opacity-60 hover:opacity-85'
    }`
  }
  
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-between items-end px-6 pointer-events-none">
      <div className="flex gap-4 pointer-events-auto">
        <button className={getBtnClass(activeKeys.left)}
          onPointerDown={() => fire('ArrowLeft', true)} onPointerUp={() => fire('ArrowLeft', false)}
          onPointerLeave={() => fire('ArrowLeft', false)}>
          <img src="/ui/left button.png" alt="Left" className="w-full h-full object-contain drop-shadow-lg" draggable={false} />
        </button>
        <button className={getBtnClass(activeKeys.right)}
          onPointerDown={() => fire('ArrowRight', true)} onPointerUp={() => fire('ArrowRight', false)}
          onPointerLeave={() => fire('ArrowRight', false)}>
          <img src="/ui/right button.png" alt="Right" className="w-full h-full object-contain drop-shadow-lg" draggable={false} />
        </button>
      </div>
      <div className="flex gap-4 pointer-events-auto">
        <button className={getBtnClass(activeKeys.up)}
          onPointerDown={() => fire('ArrowUp', true)} onPointerUp={() => fire('ArrowUp', false)}
          onPointerLeave={() => fire('ArrowUp', false)}>
          <img src="/ui/accelerate.png" alt="Accelerate" className="w-full h-full object-contain drop-shadow-lg" draggable={false} />
        </button>
        <button className={getBtnClass(activeKeys.down)}
          onPointerDown={() => fire('ArrowDown', true)} onPointerUp={() => fire('ArrowDown', false)}
          onPointerLeave={() => fire('ArrowDown', false)}>
          <img src="/ui/brake.png" alt="Brake" className="w-full h-full object-contain drop-shadow-lg" draggable={false} />
        </button>
      </div>
    </div>
  )
}

export default function HUD() {
  const score = useGameStore(s => s.score)
  const speed = useGameStore(s => s.speed)
  const position = useGameStore(s => s.position)
  const totalRacers = useGameStore(s => s.totalRacers)
  const combo = useGameStore(s => s.combo)
  const gameState = useGameStore(s => s.gameState)

  const [activeKeys, setActiveKeys] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code
      if (code === 'ArrowLeft' || code === 'KeyA') {
        setActiveKeys(prev => ({ ...prev, left: true }))
      }
      if (code === 'ArrowRight' || code === 'KeyD') {
        setActiveKeys(prev => ({ ...prev, right: true }))
      }
      if (code === 'ArrowUp' || code === 'KeyW') {
        setActiveKeys(prev => ({ ...prev, up: true }))
      }
      if (code === 'ArrowDown' || code === 'KeyS') {
        setActiveKeys(prev => ({ ...prev, down: true }))
      }
    }

    const handleKeyUp = (e) => {
      const code = e.code
      if (code === 'ArrowLeft' || code === 'KeyA') {
        setActiveKeys(prev => ({ ...prev, left: false }))
      }
      if (code === 'ArrowRight' || code === 'KeyD') {
        setActiveKeys(prev => ({ ...prev, right: false }))
      }
      if (code === 'ArrowUp' || code === 'KeyW') {
        setActiveKeys(prev => ({ ...prev, up: false }))
      }
      if (code === 'ArrowDown' || code === 'KeyS') {
        setActiveKeys(prev => ({ ...prev, down: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  if (gameState !== 'playing') return null

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top-left: minimap */}
      <div className="absolute top-4 left-4">
        <Minimap />
      </div>

      {/* Top-right: stats */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 right-4 flex flex-col gap-2"
      >
        <HudCard label="POSITION" value={`${position} / ${totalRacers}`} />
        <HudCard label="SCORE" value={Math.floor(score).toLocaleString()} />
        <HudCard label="SPEED" value={Math.floor(speed)} unit="KM/H" />
      </motion.div>

      {/* Centre: combo */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents:'none', paddingBottom:'20%' }}>
        <ComboDisplay combo={combo} />
      </div>



      {/* Mobile controls */}
      <div className="pointer-events-auto">
        <MobileControls activeKeys={activeKeys} />
      </div>

      {/* Speed lines overlay at high speed */}
      {speed > 200 && (
        <div
          className="absolute inset-0 speed-lines"
          style={{ opacity: Math.min(1, (speed - 200) / 120) * 0.6 }}
        />
      )}
    </div>
  )
}
