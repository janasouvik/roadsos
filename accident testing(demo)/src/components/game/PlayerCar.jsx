import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore'
import { useInput } from '../../hooks/useInput'
import { useAudio } from '../../hooks/useAudio'
import * as THREE from 'three'
import { ROAD_LEFT, ROAD_RIGHT, ROAD_WIDTH, LANE_WIDTH, LANE_COUNT, LANE_X } from './Road'
import { CrashSparks, TireSmoke } from './Particles'

const MAX_SPEED = 0.5      // world units/frame at full throttle
const ACCEL = 0.007        // slightly snappier acceleration
const DECEL = 0.005        // quicker coast-down
const BRAKE_FORCE = 0.012  // firmer braking
const STEER_SPEED = 0.018  // faster touch steering response
const STEER_RETURN = 0.016 // fast self-center when finger lifts

// Car colours
const CAR_COLORS = {
  red:    { body: '#e53935', glass: '#4fc3f7', stripe: '#b71c1c' },
  blue:   { body: '#1565C0', glass: '#81d4fa', stripe: '#0d47a1' },
  white:  { body: '#ECEFF1', glass: '#b3e5fc', stripe: '#90A4AE' },
  yellow: { body: '#F9A825', glass: '#4fc3f7', stripe: '#F57F17' },
  green:  { body: '#2E7D32', glass: '#4fc3f7', stripe: '#1B5E20' },
}

const PlayerCar = forwardRef(function PlayerCar({ onCrash }, ref) {
  const meshRef = useRef()
  const brakeLightRef = useRef()
  const steerRef = useRef(0)      // current steering value
  const velocityRef = useRef(0)   // normalised 0â€“1
  const posRef = useRef({ x: 0, z: 0 })

  const keys = useInput()
  const { updateEngineState, setBraking, playCrash, playNearMiss } = useAudio()
  const setSpeed = useGameStore(s => s.setSpeed)
  const addScore = useGameStore(s => s.addScore)
  const setDistance = useGameStore(s => s.setDistance)
  const triggerCrash = useGameStore(s => s.triggerCrash)
  const triggerOvertake = useGameStore(s => s.triggerOvertake)
  const triggerNearMiss = useGameStore(s => s.triggerNearMiss)
  const resetCombo = useGameStore(s => s.resetCombo)
  const playerColor = useGameStore(s => s.playerColor)
  const gameState = useGameStore(s => s.gameState)
  const cameraMode = useGameStore(s => s.cameraMode)
  const setPosition = useGameStore(s => s.setPosition)

  const crashedRef = useRef(false)
  const distRef = useRef(0)
  const comboTimerRef = useRef(0)
  const tireSmokeActiveRef = useRef(false)

  const col = CAR_COLORS[playerColor] || CAR_COLORS.red

  // Reset position, speed, and refs when the game starts/restarts
  React.useEffect(() => {
    if (gameState === 'playing') {
      posRef.current = { x: 0, z: 0 }
      velocityRef.current = 0
      steerRef.current = 0
      distRef.current = 0
    }
  }, [gameState])

  // Expose position and velocity for other components
  useImperativeHandle(ref, () => ({
    getPosition: () => posRef.current,
    getVelocity: () => velocityRef.current,
    isCrashed: () => crashedRef.current,
  }))

  useFrame((_, delta) => {
    if (gameState !== 'playing' || crashedRef.current) return
    if (!meshRef.current) return

    const accel = keys.current['ArrowUp']   || keys.current['KeyW']
    const brake = keys.current['ArrowDown'] || keys.current['KeyS']
    const left  = keys.current['ArrowLeft'] || keys.current['KeyA']
    const right = keys.current['ArrowRight']|| keys.current['KeyD']

    // Engine sound control
    updateEngineState(velocityRef.current > 0.01 || accel, velocityRef.current * 320)

    // Brake sound control
    setBraking(!!brake && velocityRef.current > 0.01)

    // Speed
    const dt = Math.min(delta * 60, 2.5) // tighter cap = more consistent feel
    if (accel) {
      velocityRef.current = Math.min(1, velocityRef.current + ACCEL * dt)
    } else {
      velocityRef.current = Math.max(0, velocityRef.current - DECEL * dt)
    }
    if (brake) {
      velocityRef.current = Math.max(0, velocityRef.current - BRAKE_FORCE * dt)
    }

    const speedKmh = velocityRef.current * 320
    setSpeed(Math.round(speedKmh))

    // Steer
    const targetSteer = left ? 1 : right ? -1 : 0
    steerRef.current += (targetSteer - steerRef.current) * (targetSteer !== 0 ? STEER_SPEED : STEER_RETURN) * dt

    // Move
    const worldSpeed = velocityRef.current * MAX_SPEED * dt
    const playerHalfWidth = 0.685 + 0.05 // Swift car half-width (0.685) + safety margin (0.05)

    // Left/right movement done by exactly 0.03 * dt per frame
    let lateralSpeed = 0
    if (left)  lateralSpeed = -0.03 * dt
    if (right) lateralSpeed = 0.03 * dt

    posRef.current.x = THREE.MathUtils.clamp(
      posRef.current.x + lateralSpeed,
      ROAD_LEFT + playerHalfWidth,
      ROAD_RIGHT - playerHalfWidth
    )
    posRef.current.z += worldSpeed  // z increases as player moves forward

    distRef.current += worldSpeed * 0.5
    setDistance(Math.round(distRef.current))

    // Score: per distance
    addScore(Math.round(velocityRef.current * 0.5 * (1 + velocityRef.current) * dt))

    // Combo timer
    comboTimerRef.current -= delta * 1000
    if (comboTimerRef.current < 0) resetCombo()

    // Update particle activation refs
    tireSmokeActiveRef.current = velocityRef.current > 0.4 && Math.abs(steerRef.current) > 0.2

    // Visuals: lean on steer
    if (meshRef.current) {
      // Add subtle roll (z) and yaw (y) rotation to make turning look extremely premium and lifelike
      meshRef.current.rotation.y = steerRef.current * 0.12 // Yaw (pointing into the turn)
      meshRef.current.rotation.z = steerRef.current * 0.06 // Roll (leaning slightly into the turn)
      meshRef.current.position.x = posRef.current.x
      meshRef.current.position.z = posRef.current.z // Move player in Z space
      // Brake lights
      if (brakeLightRef.current) {
        brakeLightRef.current.visible = !!brake
      }
    }

    // Rotate front wheels visually around local Y axis for steering (front tier effect)
    if (frontLeftWheel) {
      frontLeftWheel.rotation.y = steerRef.current * 0.45
    }
    if (frontRightWheel) {
      frontRightWheel.rotation.y = steerRef.current * 0.45
    }
  })

  const fbx = useFBX('./models/vehicles/Swift.fbx')
  
  // Clone the model and get references to front wheel meshes for visual steering rotation
  const { carModel, frontLeftWheel, frontRightWheel } = React.useMemo(() => {
    const clone = fbx.clone()
    let flw = null
    let frw = null
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
      if (child.name.includes('Frontleft Wheel') || child.name.toLowerCase().includes('frontleft')) {
        flw = child
      }
      if (child.name.includes('Frontright Wheel') || child.name.toLowerCase().includes('frontright')) {
        frw = child
      }
    })
    return { carModel: clone, frontLeftWheel: flw, frontRightWheel: frw }
  }, [fbx])

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* â”€â”€ Car Model â”€â”€ */}
      <group rotation={[0, 0, 0]} scale={0.01} position={[0, -0.5, 0]} visible={cameraMode === 'tp'}>
        <primitive object={carModel} />
      </group>

      {/* Particles */}
      <TireSmoke activeRef={tireSmokeActiveRef} x={0} />
      <CrashSparks active={gameState === 'gameover' && meshRef.current != null} position={[posRef.current.x, 0.5, posRef.current.z]} />
    </group>
  )
})

// Preload the model
useFBX.preload('./models/vehicles/Swift.fbx')

export default PlayerCar

