import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'
import * as THREE from 'three'
 
const CAM_OFFSET = new THREE.Vector3(0, 1.25, 3.8)
const TARGET_OFFSET = new THREE.Vector3(0, 0.75, -1.0)
const LERP_POS = 0.08
const LERP_LOOK = 0.1
 
export default function CameraRig({ playerRef }) {
  const { camera } = useThree()
  const shakeRef = useRef(0)
  const shakeTimerRef = useRef(0)
  const fovRef = useRef(65)

  const cameraMode = useGameStore(s => s.cameraMode)
  const toggleCameraMode = useGameStore(s => s.toggleCameraMode)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyV') {
        toggleCameraMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCameraMode])
 
  useFrame((_, delta) => {
    const pos = playerRef.current?.getPosition?.()
    const vel = playerRef.current?.getVelocity?.() ?? 0
 
    if (!pos) return
 
    // Dynamic FOV (keep third-person FOV static and tight so the car size stays consistent)
    const targetFov = cameraMode === 'fp' ? 75 + vel * 20 : 62
    fovRef.current += (targetFov - fovRef.current) * 0.05
    camera.fov = fovRef.current
    camera.updateProjectionMatrix()
 
    // Camera shake after crash
    shakeTimerRef.current -= delta
    const shake = shakeTimerRef.current > 0
      ? (Math.random() - 0.5) * shakeRef.current * shakeTimerRef.current
      : 0
 
    // Target camera position (world space)
    const targetPos = cameraMode === 'fp'
      ? new THREE.Vector3(
          pos.x + shake * 0.4,
          0.65 + shake,
          pos.z + 0.65 // Front bumper / hood camera position
        )
      : new THREE.Vector3(
          pos.x + shake * 2,
          CAM_OFFSET.y + shake,
          pos.z - CAM_OFFSET.z // camera is behind (positive Z in our scene = player forward)
        )
 
    const lerpFactor = cameraMode === 'fp' ? 0.35 : LERP_POS
    camera.position.lerp(targetPos, lerpFactor)

    // Eliminate X and Z-axis speed lag in third-person view to keep the camera perfectly rigid
    if (cameraMode === 'tp') {
      camera.position.x = targetPos.x
      camera.position.z = targetPos.z
    }
 
    // Look at
    const lookTarget = cameraMode === 'fp'
      ? new THREE.Vector3(pos.x, 0.55, pos.z + 30) // look forward down the highway
      : new THREE.Vector3(pos.x, TARGET_OFFSET.y, pos.z + TARGET_OFFSET.z)

    camera.lookAt(lookTarget)
  })
 
  // Expose shake trigger
  playerRef._triggerShake = (intensity = 1, duration = 0.5) => {
    shakeRef.current = intensity
    shakeTimerRef.current = duration
  }
 
  return null
}

