import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROAD_WIDTH, LANE_COUNT, LANE_WIDTH, LANE_X } from './Road'
import { useGameStore } from '../../store/gameStore'

import { useFBX } from '@react-three/drei'

const MAX_TRAFFIC = 30
const SPAWN_AHEAD = 400
const DESPAWN_BEHIND = 50

const VEHICLE_TYPES = [
  { name: 'Ambulance', w: 2.0, h: 1.5, d: 5.5, speed: [0.15, 0.28], file: './models/vehicles/Ambulance.fbx' },
  { name: 'Bus',       w: 2.2, h: 1.8, d: 10.0, speed: [0.1, 0.2],  file: './models/vehicles/CHD Bus.fbx' },
  { name: 'Maruti',    w: 1.6, h: 0.7, d: 3.4, speed: [0.18, 0.35], file: './models/vehicles/Maruti800.fbx' },
  { name: 'Nano',      w: 1.5, h: 0.7, d: 3.0, speed: [0.15, 0.3],  file: './models/vehicles/Nano.fbx' },
  { name: 'Pickup',    w: 2.1, h: 1.2, d: 5.2, speed: [0.16, 0.32], file: './models/vehicles/Pick-up Truck.fbx' },
  { name: 'Safari',    w: 2.0, h: 0.9, d: 4.2, speed: [0.17, 0.33], file: './models/vehicles/Safari.fbx' },
  { name: 'Tempo',     w: 1.9, h: 1.1, d: 4.8, speed: [0.12, 0.25], file: './models/vehicles/Tempo.fbx' },
  { name: 'Truck',     w: 2.2, h: 1.4, d: 8.0, speed: [0.12, 0.25], file: './models/vehicles/Truck.fbx' },
  { name: 'VW',        w: 1.7, h: 0.7, d: 3.6, speed: [0.2, 0.38],  file: './models/vehicles/volkswagen.fbx' },
]

// Preload
VEHICLE_TYPES.forEach(t => useFBX.preload(t.file))

function randomType() { return VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)] }
function randomLane()  { return Math.floor(Math.random() * LANE_COUNT) }
function randomSpeed(type) {
  return type.speed[0] + Math.random() * (type.speed[1] - type.speed[0])
}

// FBX Model Wrapper
function TrafficVehicle({ veh }) {
  const fbx = useFBX(veh.type.file)
  
  // Clone the model so each vehicle is independent
  const model = useMemo(() => {
    const clone = fbx.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [fbx])

  // Scale and rotation for FBX
  return (
    <group>
      <group rotation={[0, 0, 0]} scale={0.01} position={[0, -0.5, 0]}>
        <primitive object={model} />
      </group>
      
      {/* Optional: Add tail lights if they don't exist in FBX, but usually they do.
          Leaving a small red light for effect if wanted, but removing the box geometry */}
      <mesh position={[0, veh.type.h * 0.4, -veh.type.d / 2 - 0.01]}>
        <boxGeometry args={[veh.type.w * 0.6, 0.12, 0.05]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={1.5} transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function TrafficSystem({ playerRef, playerZRef }) {
  const vehiclesRef = useRef([])
  const meshRefs = useRef({})
  const spawnTimerRef = useRef(0)
  const trafficDensity = useGameStore(s => s.trafficDensity)
  const triggerCrash = useGameStore(s => s.triggerCrash)
  const triggerOvertake = useGameStore(s => s.triggerOvertake)
  const triggerNearMiss = useGameStore(s => s.triggerNearMiss)
  const gameState = useGameStore(s => s.gameState)

  const spawnIntervalMs = { low: 1800, medium: 900, high: 450 }[trafficDensity] || 900

  function createVehicle(zWorld) {
    const type = randomType()
    const lane = randomLane()
    const id = Math.random().toString(36).slice(2)
    return {
      id, type, lane,
      x: LANE_X(lane),
      z: zWorld,
      speed: randomSpeed(type),
      laneChangeCooldown: 2000 + Math.random() * 4000,
      overtakenBy: false,
      _nearMissTriggered: false,
    }
  }

  // Pre-populate ahead of player
  useEffect(() => {
    vehiclesRef.current = []
    for (let i = 0; i < 25; i++) {
      vehiclesRef.current.push(createVehicle(20 + i * 14)) // positive Z
    }
  }, [])

  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  const updateQueued = useRef(false)

  useFrame((_, delta) => {
    if (gameState !== 'playing') return

    const dt = Math.min(delta * 60, 3)
    const playerPos = playerRef.current?.getPosition?.()
    if (!playerPos) return

    const pz = playerPos.z
    const px = playerPos.x

    // Spawn timer
    spawnTimerRef.current += delta * 1000
    if (spawnTimerRef.current > spawnIntervalMs && vehiclesRef.current.length < MAX_TRAFFIC) {
      spawnTimerRef.current = 0
      const spawnZ = pz + SPAWN_AHEAD + Math.random() * 60
      const nv = createVehicle(spawnZ)
      // check clear
      const clear = vehiclesRef.current.every(v => !(Math.abs(v.x - nv.x) < 3 && Math.abs(v.z - nv.z) < 12))
      if (clear) {
        vehiclesRef.current.push(nv)
        updateQueued.current = true
      }
    }

    // Update each vehicle
    const toRemove = []
    vehiclesRef.current.forEach((v, idx) => {
      // Move forward in world space
      v.z += v.speed * dt

      // Lane change AI disabled: opponent cars stay in their spawned lanes and drive straight

      // Update mesh position (absolute coordinate)
      const relZ = v.z - pz
      const ref3d = meshRefs.current[v.id]
      if (ref3d) {
        // Smoothly interpolate lane changes visually
        const prevX = ref3d.position.x
        ref3d.position.x += (v.x - prevX) * 0.1 * dt
        ref3d.position.z = v.z
        
        // Add realistic turning and leaning rotation to AI cars during lane changes
        ref3d.rotation.y = (ref3d.position.x - prevX) * 1.2
        ref3d.rotation.z = (ref3d.position.x - prevX) * 0.4
      }

      // Despawn if far behind player
      if (relZ < -DESPAWN_BEHIND || relZ > SPAWN_AHEAD + 150) {
        toRemove.push(idx)
        return
      }

      // â”€â”€ Collision & near-miss â”€â”€
      if (playerRef.current?.isCrashed?.()) return

      const visualX = ref3d ? ref3d.position.x : v.x
      const dx = Math.abs(px - visualX)
      const dz = Math.abs(relZ) // distance in Z is just |relZ| because player is at relZ=0
      const hitW = (1.37 + v.type.w) / 2 - 0.1
      const hitD = (2.61 + v.type.d) / 2 - 0.2

      if (dx < hitW && dz < hitD) {
        // CRASH
        triggerCrash()
        return
      }

      // Overtake (if car goes from in front of player to behind player)
      if (!v.overtakenBy && relZ < -2 && dx < hitW + 1.5) {
        v.overtakenBy = true
        triggerOvertake()
      }

      // Near miss
      if (dz > hitD && dz < hitD + 4 && dx < hitW + 2.5 && !v._nearMissTriggered) {
        v._nearMissTriggered = true
        triggerNearMiss()
        setTimeout(() => { v._nearMissTriggered = false }, 1200)
      }
    })

    // Remove despawned
    if (toRemove.length) {
      toRemove.sort((a, b) => b - a).forEach(i => {
        const v = vehiclesRef.current[i]
        delete meshRefs.current[v.id]
        vehiclesRef.current.splice(i, 1)
      })
      updateQueued.current = true
    }

    if (updateQueued.current) {
      updateQueued.current = false
      forceUpdate()
    }
  })

  return (
    <>
      {vehiclesRef.current.map(v => (
        <group key={v.id} ref={el => { if (el) meshRefs.current[v.id] = el }}>
          <TrafficVehicle veh={v} />
        </group>
      ))}
    </>
  )
}

