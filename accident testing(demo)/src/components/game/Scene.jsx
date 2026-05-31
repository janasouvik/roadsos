import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'

import Environment from './Environment'
import { Road } from './Road'
import PlayerCar from './PlayerCar'
import TrafficSystem from './TrafficSystem'
import CameraRig from './Camera'

function GameScene({ playerRef }) {
  const gameState = useGameStore(s => s.gameState)
  const speed = useGameStore(s => s.speed)

  return (
    <>
      <Environment playerRef={playerRef} />
      <Road playerZRef={playerRef} />
      <PlayerCar ref={playerRef} />
      {gameState === 'playing' && (
        <TrafficSystem playerRef={playerRef} />
      )}
      <CameraRig playerRef={playerRef} />
    </>
  )
}

export default function Scene() {
  const playerRef = useRef()

  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      camera={{ fov: 65, near: 0.1, far: 600, position: [0, 5.5, 13] }}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor>
          <GameScene playerRef={playerRef} />
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  )
}

