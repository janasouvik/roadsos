import React, { useMemo, useRef } from 'react'
import { Sky, Cloud } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'

export default function Environment({ playerRef }) {
  const timeOfDay = useGameStore(s => s.timeOfDay)
  const envGroupRef = useRef()

  const skyProps = useMemo(() => {
    if (timeOfDay === 'night')  return { sunPosition: [0, -1, 0], turbidity: 20, rayleigh: 0, mieCoefficient: 0.005, mieDirectionalG: 0.7 }
    if (timeOfDay === 'sunset') return { sunPosition: [1, 0.1, 0], turbidity: 10, rayleigh: 3, mieCoefficient: 0.05, mieDirectionalG: 0.9 }
    return { sunPosition: [0.3, 0.6, -1], turbidity: 8, rayleigh: 1, mieCoefficient: 0.005, mieDirectionalG: 0.8 }
  }, [timeOfDay])

  // Center sky and environment elements dynamically on the player's Z position
  useFrame(() => {
    const pz = playerRef?.current?.getPosition?.().z || 0
    if (envGroupRef.current) {
      envGroupRef.current.position.z = pz
    }
  })

  return (
    <group ref={envGroupRef}>
      <Sky {...skyProps} />

      <ambientLight intensity={timeOfDay === 'night' ? 0.08 : 0.5} color={timeOfDay === 'sunset' ? '#ff8c42' : '#fff'} />

      <directionalLight
        castShadow
        position={timeOfDay === 'night' ? [0, 20, 10] : [15, 30, -20]}
        intensity={timeOfDay === 'night' ? 0.1 : timeOfDay === 'sunset' ? 0.8 : 1.4}
        color={timeOfDay === 'sunset' ? '#ff6d3a' : '#fff'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {timeOfDay === 'night' && (
        <>
          <pointLight position={[-18, 6, -20]} intensity={3} color="#ffe082" distance={40} />
          <pointLight position={[18, 6, -40]}  intensity={3} color="#ffe082" distance={40} />
          <pointLight position={[-18, 6, -80]} intensity={3} color="#ffe082" distance={40} />
          <pointLight position={[18, 6, -100]} intensity={3} color="#ffe082" distance={40} />
        </>
      )}

      {timeOfDay !== 'night' && (
        <>
          <Cloud position={[-40, 40, -100]} speed={0.1} opacity={0.6} />
          <Cloud position={[60,  45, -150]} speed={0.08} opacity={0.5} />
          <Cloud position={[0,   38, -200]} speed={0.12} opacity={0.55} />
        </>
      )}

      <fog attach="fog" args={[
        timeOfDay === 'night' ? '#0d1b2a' : timeOfDay === 'sunset' ? '#b5451b' : '#b0e0f8',
        80, 350
      ]} />
    </group>
  )
}

