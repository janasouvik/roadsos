import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore'
import * as THREE from 'three'

// Constants for gameplay logic
const ROAD_LEFT      = -8.2
const ROAD_RIGHT     = 7.6
const ROAD_WIDTH     = ROAD_RIGHT - ROAD_LEFT
const LANE_COUNT     = 5
const LANE_WIDTH     = ROAD_WIDTH / LANE_COUNT

export const LANE_X = (lane) => ROAD_LEFT + LANE_WIDTH * lane + LANE_WIDTH / 2

// Preload the city scene
useFBX.preload('/models/city/City Scene.fbx')

export function Road({ playerZRef }) {
  const fbx = useFBX('/models/city/City Scene.fbx')
  const gameState = useGameStore(s => s.gameState)

  // Calculate bounding box and create clones for instancing
  const { models, length } = useMemo(() => {
    // The visual road mesh (road002) in the FBX has a length of exactly 80.0 units.
    // We use 79.8 instead of 80.0 to overlap consecutive segments slightly by 0.2 units.
    // This removes any sub-pixel rasterization seams (visible as white lines/spaces) 
    // created by GPU floating-point precision, anti-aliasing, or mipmapping.
    const len = 79.8
    
    // Create enough clones for seamless tiling up to 600 units ahead/behind
    const clones = []
    const requiredCoverage = 800 // 800 units total coverage
    const segmentCount = Math.max(3, Math.ceil(requiredCoverage / len))
    
    for (let i = 0; i < segmentCount; i++) {
      const clone = fbx.clone()
      clone.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true
          child.castShadow = true
        }
      })
      clones.push(clone)
    }
    
    return { models: clones, length: len }
  }, [fbx])

  const SEGMENT_COUNT = models.length
  
  // Store the world Z position of each segment
  const segZs = useRef(
    Array.from({ length: SEGMENT_COUNT }, (_, i) => i * length)
  )

  const groupRefs = useRef([])

  // Reset road segments on restart/start playing
  useEffect(() => {
    if (gameState === 'playing') {
      segZs.current = Array.from({ length: SEGMENT_COUNT }, (_, i) => i * length)
      groupRefs.current.forEach((ref, i) => {
        if (ref) {
          ref.position.z = i * length
        }
      })
    }
  }, [gameState, length, SEGMENT_COUNT])

  // Move road segments dynamically relative to player
  useFrame(() => {
    const pz = playerZRef?.current?.getPosition?.().z || 0

    groupRefs.current.forEach((ref, i) => {
      if (!ref) return
      
      // If the road segment is behind the player by more than 'length', wrap it forward
      if (segZs.current[i] - pz < -length) {
        segZs.current[i] += SEGMENT_COUNT * length
      }
      
      ref.position.z = segZs.current[i]
    })
  })

  return (
    <>
      {models.map((model, i) => (
        <group key={i} ref={el => groupRefs.current[i] = el}>
          <group rotation={[0, 0, 0]} scale={0.01} position={[0, -0.5, 0]}>
            <primitive object={model} />
          </group>
        </group>
      ))}
    </>
  )
}

export { ROAD_LEFT, ROAD_RIGHT, ROAD_WIDTH, LANE_WIDTH, LANE_COUNT }
