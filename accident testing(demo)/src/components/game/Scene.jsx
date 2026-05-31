import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
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

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.ADD}
        />
        {speed > 180 && (
          <ChromaticAberration
            offset={[0.0008 * (speed / 320), 0.0002]}
            blendFunction={BlendFunction.NORMAL}
          />
        )}
      </EffectComposer>
    </>
  )
}

export default function Scene() {
  const playerRef = useRef()

  return (
    <Canvas
      shadows
      camera={{ fov: 65, near: 0.1, far: 600, position: [0, 5.5, 13] }}
      gl={{
        antialias: true,
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
