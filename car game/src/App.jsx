import React, { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import Scene from './components/game/Scene'
import HUD from './components/ui/HUD'
import MainMenu from './components/ui/MainMenu'
import GameOver from './components/ui/GameOver'

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="font-orb text-orange-500 text-3xl font-black tracking-widest mb-4">
          HIGHWAY RACER 3D
        </div>
        <div className="font-raj text-white/50 text-sm tracking-[4px] animate-pulse">
          LOADING...
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const gameState = useGameStore(s => s.gameState)

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* 3D canvas always mounted (renders behind UI) */}
      <Suspense fallback={<LoadingFallback />}>
        <Scene />
      </Suspense>

      {/* UI layers */}
      <AnimatePresence mode="wait">
        {gameState === 'menu' && <MainMenu key="menu" />}
      </AnimatePresence>

      {/* HUD (only during play) */}
      <HUD />

      {/* Game Over (overlaid) */}
      <GameOver />
    </div>
  )
}
