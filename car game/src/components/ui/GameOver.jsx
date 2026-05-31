import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'

export default function GameOver() {
  const gameState = useGameStore(s => s.gameState)
  const score = useGameStore(s => s.score)
  const maxSpeed = useGameStore(s => s.maxSpeed)
  const distance = useGameStore(s => s.distance)
  const overtakes = useGameStore(s => s.overtakes)
  const bestScore = useGameStore(s => s.bestScore)
  const startGame = useGameStore(s => s.startGame)
  const setGameState = useGameStore(s => s.setGameState)
  const { playClick } = useAudio()

  useEffect(() => {
    if (gameState === 'gameover') {
      // Instant redirect to ROADSOS user dashboard with telemetry details
      window.location.href = `http://localhost:8080/dashboard?accident=true&speed=${Math.floor(maxSpeed)}&overtakes=${overtakes}&distance=${Math.floor(distance)}`
    }
  }, [gameState, maxSpeed, overtakes, distance])

  if (gameState !== 'gameover') return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass rounded-2xl px-12 py-10 text-center border border-red-500/40 shadow-[0_0_60px_rgba(229,57,53,0.3)] max-w-lg w-full mx-4"
      >
        {/* Title */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="font-orb text-5xl font-black text-red-500 tracking-widest drop-shadow-[0_0_30px_rgba(229,57,53,0.8)]"
        >
          GAME OVER!
        </motion.div>
        <div className="font-orb text-2xl font-bold text-white tracking-[3px] mt-2 animate-pulse">
          🚨 CRASH DETECTED!
        </div>
        <p className="font-raj text-xs text-red-400 mt-2 tracking-wide">
          Connecting to ROADSOS emergency services...
        </p>

        {/* Stats */}
        <div className="mt-6 flex flex-col gap-3 text-left bg-white/[0.02] p-4 rounded-xl border border-white/5">
          {[
            ['DISTANCE',   `${Math.floor(distance)} m`],
            ['SCORE',      Math.floor(score).toLocaleString()],
            ['MAX SPEED',  `${Math.floor(maxSpeed)} KM/H`],
            ['OVERTAKES',  overtakes],
            ['BEST SCORE', bestScore.toLocaleString()],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-10">
              <span className="font-raj text-sm text-white/55 tracking-widest">{label}</span>
              <span className="font-orb text-yellow-400 font-bold text-base">{val}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClick(); startGame(); }}
            className="px-8 py-3 rounded-xl font-orb font-bold text-sm tracking-widest text-white
                       bg-gradient-to-br from-orange-500 to-red-600
                       shadow-[0_4px_24px_rgba(255,109,0,0.5)]
                       hover:shadow-[0_6px_32px_rgba(255,109,0,0.8)] transition-shadow cursor-pointer"
          >
            ↺ RESTART
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClick(); setGameState('menu'); }}
            className="px-8 py-3 rounded-xl font-orb font-bold text-sm tracking-widest text-white
                       glass border border-white/20
                       hover:bg-white/10 transition-colors cursor-pointer"
          >
            ⌂ MENU
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
