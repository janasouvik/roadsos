import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

const COUNT = 80

// Crash sparks particle system
export function CrashSparks({ active, position = [0, 0, 0] }) {
  const pointsRef = useRef()
  const lifeArr   = useRef(new Float32Array(COUNT).fill(0))
  const velArr    = useRef(Array.from({ length: COUNT }, () => ({ x: 0, y: 0, z: 0 })))

  const positions = useRef(new Float32Array(COUNT * 3))
  const colors    = useRef(new Float32Array(COUNT * 3))

  useEffect(() => {
    if (!active) return
    for (let i = 0; i < COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2
      const vAngle = Math.random() * Math.PI - Math.PI / 2
      const speed  = 1.5 + Math.random() * 5
      velArr.current[i] = {
        x: Math.cos(angle) * Math.cos(vAngle) * speed,
        y: Math.abs(Math.sin(vAngle)) * speed * 1.8,
        z: Math.sin(angle) * Math.cos(vAngle) * speed,
      }
      lifeArr.current[i] = 0.8 + Math.random() * 0.5
      positions.current[i*3]   = position[0]
      positions.current[i*3+1] = position[1]
      positions.current[i*3+2] = position[2]
      // orange/gold sparks
      colors.current[i*3]   = 1
      colors.current[i*3+1] = 0.3 + Math.random() * 0.5
      colors.current[i*3+2] = 0
    }
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.geometry.attributes.color.needsUpdate    = true
    }
  }, [active])

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      if (lifeArr.current[i] <= 0) continue
      lifeArr.current[i] -= delta * 1.8
      const v = velArr.current[i]
      pos[i*3]   += v.x * delta
      pos[i*3+1] += v.y * delta
      pos[i*3+2] += v.z * delta
      v.y -= 9.8 * delta  // gravity
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors.current}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

// Tire smoke (twin puffs behind player)
export function TireSmoke({ activeRef, x = 0 }) {
  const leftRef  = useRef()
  const rightRef = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    const isActive = activeRef?.current
    const op = isActive ? 0.22 + Math.sin(t.current * 5) * 0.06 : 0
    if (leftRef.current)  leftRef.current.material.opacity  = op
    if (rightRef.current) rightRef.current.material.opacity = op
  })

  return (
    <>
      <mesh ref={leftRef} position={[x - 1, 0.4, -2.5]}>
        <sphereGeometry args={[0.6, 7, 7]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={rightRef} position={[x + 1, 0.4, -2.5]}>
        <sphereGeometry args={[0.6, 7, 7]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

// Exhaust Fire
export function ExhaustFire({ activeRef, x = 0 }) {
  const leftRef  = useRef()
  const rightRef = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta * 20
    if (leftRef.current && rightRef.current) {
      const isActive = activeRef?.current
      if (isActive) {
        const scale = 0.5 + Math.random() * 0.5
        leftRef.current.scale.set(scale, scale, scale * 2)
        rightRef.current.scale.set(scale, scale, scale * 2)
        leftRef.current.visible = true
        rightRef.current.visible = true
      } else {
        leftRef.current.visible = false
        rightRef.current.visible = false
      }
    }
  })

  return (
    <>
      <mesh ref={leftRef} position={[x - 0.7, 0.25, -2.25]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#ff7b00" emissive="#ff3300" emissiveIntensity={3} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      <mesh ref={rightRef} position={[x + 0.7, 0.25, -2.25]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#ff7b00" emissive="#ff3300" emissiveIntensity={3} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </>
  )
}

