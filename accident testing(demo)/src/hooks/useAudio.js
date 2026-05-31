import { useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

// Shared audio elements to avoid recreating them constantly
const audioElements = {
  enginePickup: new Audio('/sounds/PickUpTruckMusic.wav'),
  crash: new Audio('/sounds/CarCrashSound.wav'),
  skid: new Audio('/sounds/SkidBreakMusic.wav'),
  bgm: new Audio('/sounds/RacingLevelMusic.wav'),
  menuMusic: new Audio('/sounds/MainMenuMusic.mp3'),
  click: new Audio('/sounds/ButtonClickSound.wav'),
}

// Pre-configure loops
audioElements.enginePickup.loop = true
audioElements.bgm.loop = true
audioElements.menuMusic.loop = true
audioElements.skid.loop = true

// Volume settings
audioElements.enginePickup.volume = 0.5
audioElements.bgm.volume = 0.35 // BGM volume while driving
audioElements.menuMusic.volume = 0.4
audioElements.click.volume = 0.6
audioElements.skid.volume = 0.55 // volume for braking skid

export function useAudio() {
  const soundEnabled = useGameStore(s => s.soundEnabled)
  const gameState = useGameStore(s => s.gameState)
  const initialized = useRef(false)

  // Handle music state based on gameState
  useEffect(() => {
    if (!soundEnabled) {
      Object.values(audioElements).forEach(a => a.pause())
      return
    }

    if (gameState === 'menu') {
      audioElements.bgm.pause()
      audioElements.skid.pause()
      audioElements.menuMusic.play().catch(() => {})
    } else if (gameState === 'playing') {
      audioElements.menuMusic.pause()
      audioElements.skid.pause()
      initialized.current = true
    } else if (gameState === 'gameover') {
      audioElements.skid.pause()
      audioElements.bgm.pause()
      audioElements.crash.currentTime = 0
      audioElements.crash.play().catch(() => {})
    }
  }, [gameState, soundEnabled])

  // updateEngineState: plays/pauses RacingLevelMusic.wav based on driving state
  const updateEngineState = (isDriving, speed) => {
    if (!soundEnabled || gameState !== 'playing') {
      audioElements.bgm.pause()
      return
    }

    if (isDriving) {
      // Play racing level music while driving
      if (audioElements.bgm.paused) {
        audioElements.bgm.play().catch(() => {})
      }
    } else {
      // Pause music when stopped/idle
      audioElements.bgm.pause()
    }
  }

  // setBraking: handles SkidBreakMusic.wav loop when braking
  const setBraking = (isBraking) => {
    if (!soundEnabled || gameState !== 'playing') {
      audioElements.skid.pause()
      return
    }

    if (isBraking) {
      if (audioElements.skid.paused) {
        audioElements.skid.play().catch(() => {})
      }
    } else {
      audioElements.skid.pause()
    }
  }

  const playCrash = () => {
    if (!soundEnabled) return
    audioElements.crash.currentTime = 0
    audioElements.crash.play().catch(() => {})
  }

  const playNearMiss = () => {
    if (!soundEnabled) return
    const tempSkid = new Audio('/sounds/SkidBreakMusic.wav')
    tempSkid.volume = 0.4
    tempSkid.play().catch(() => {})
  }

  const playClick = () => {
    if (!soundEnabled) return
    audioElements.click.currentTime = 0
    audioElements.click.play().catch(() => {})
  }

  const stopAllAudio = () => {
    initialized.current = false
    Object.values(audioElements).forEach(a => {
      a.pause()
    })
  }

  // Cleanup on unmount
  useEffect(() => () => stopAllAudio(), [])

  return { updateEngineState, setBraking, playCrash, playNearMiss, playClick }
}
