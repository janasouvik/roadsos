import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // â”€â”€ Game State â”€â”€
  gameState: 'menu', // 'menu' | 'playing' | 'paused' | 'gameover'

  // â”€â”€ Runtime Stats â”€â”€
  score: 0,
  speed: 0,          // km/h
  maxSpeed: 0,
  distance: 0,
  position: 20,      // 1â€“20 racer ranking
  totalRacers: 20,
  overtakes: 0,
  nearMisses: 0,
  combo: 1,

  // â”€â”€ Settings â”€â”€
  playerColor: 'red',
  timeOfDay: 'day',    // 'day' | 'sunset' | 'night'
  trafficDensity: 'medium', // 'low' | 'medium' | 'high'
  soundEnabled: true,
  cameraMode: 'tp',     // 'tp' | 'fp'

  // â”€â”€ Best Score â”€â”€
  bestScore: parseInt(localStorage.getItem('htr3d_best') || '0'),

  // â”€â”€ Actions â”€â”€
  startGame: () => set({
    gameState: 'playing',
    score: 0,
    speed: 0,
    maxSpeed: 0,
    distance: 0,
    position: 20,
    overtakes: 0,
    nearMisses: 0,
    combo: 1,
  }),

  setGameState: (s) => set({ gameState: s }),

  setSpeed: (v) => set(state => ({
    speed: v,
    maxSpeed: Math.max(state.maxSpeed, v),
  })),

  addScore: (pts) => set(state => {
    const ns = state.score + pts
    const nb = Math.max(state.bestScore, ns)
    if (nb > state.bestScore) localStorage.setItem('htr3d_best', nb)
    return { score: ns, bestScore: nb }
  }),

  setDistance: (d) => set({ distance: d }),
  setPosition: (p) => set({ position: p }),

  triggerOvertake: () => set(state => {
    const combo = Math.min(8, state.combo + 0.5)
    const pts = Math.round(150 * combo)
    const ns = state.score + pts
    const nb = Math.max(state.bestScore, ns)
    if (nb > state.bestScore) localStorage.setItem('htr3d_best', nb)
    return { overtakes: state.overtakes + 1, combo, score: ns, bestScore: nb }
  }),

  triggerNearMiss: () => set(state => {
    const combo = Math.min(8, state.combo + 0.3)
    const pts = Math.round(80 * combo)
    const ns = state.score + pts
    const nb = Math.max(state.bestScore, ns)
    if (nb > state.bestScore) localStorage.setItem('htr3d_best', nb)
    return { nearMisses: state.nearMisses + 1, combo, score: ns, bestScore: nb }
  }),

  resetCombo: () => set({ combo: 1 }),

  triggerCrash: () => {
    const state = get()
    const nb = Math.max(state.bestScore, state.score)
    if (nb > state.bestScore) localStorage.setItem('htr3d_best', nb)
    set({ gameState: 'gameover', bestScore: nb })
  },

  setPlayerColor: (c) => set({ playerColor: c }),
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  setTrafficDensity: (d) => set({ trafficDensity: d }),
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  toggleCameraMode: () => set(state => ({ cameraMode: state.cameraMode === 'tp' ? 'fp' : 'tp' })),
}))

