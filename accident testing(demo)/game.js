/* =====================================================
   HIGHWAY TRAFFIC RACER – game.js
   Top-down 2D canvas game matching the reference image
   ===================================================== */
'use strict';

// ─────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────
const CONFIG = {
  LANES: 6,
  LANE_WIDTH: 100,
  ROAD_MARGIN: 80,           // grass / shoulder on each side
  SCROLL_BASE_SPEED: 3,
  MAX_SPEED_KMH: 320,
  PLAYER_ACCEL: 0.15,
  PLAYER_DECEL: 0.12,
  PLAYER_BRAKE: 0.25,
  PLAYER_STEER_SPEED: 5.5,
  TRAFFIC_SPAWN_INTERVAL_MS: 800,
  TRAFFIC_COUNT_MAX: 80,
  NITRO_DRAIN: 0.003,
  NITRO_REGEN: 0.001,
  SCORE_PER_METER: 0.05,
  SCORE_OVERTAKE: 150,
  SCORE_NEAR_MISS: 80,
  COMBO_TIMEOUT_MS: 3000,
  TOTAL_RACERS: 20,
};

// Car colour map
const CAR_COLORS = {
  red:    { body: '#e53935', stripe: '#b71c1c', roof: '#c62828', glass: '#4fc3f7', wheel: '#212121' },
  blue:   { body: '#1565C0', stripe: '#0d47a1', roof: '#1976D2', glass: '#4fc3f7', wheel: '#212121' },
  white:  { body: '#ECEFF1', stripe: '#CFD8DC', roof: '#B0BEC5', glass: '#81d4fa', wheel: '#37474F' },
  yellow: { body: '#F9A825', stripe: '#F57F17', roof: '#FFB300', glass: '#4fc3f7', wheel: '#212121' },
  green:  { body: '#2E7D32', stripe: '#1B5E20', roof: '#388E3C', glass: '#4fc3f7', wheel: '#212121' },
};

// Traffic vehicle colour palette
const TRAFFIC_PALETTE = [
  '#e53935','#1565C0','#ECEFF1','#F9A825','#2E7D32',
  '#6A1B9A','#00838F','#E64A19','#546E7A','#AD1457',
];

// Road times of day
const TIME_THEMES = {
  day:    { sky: '#87ceeb', grass: '#4CAF50', darkGrass: '#388E3C', road: '#555', roadLine: '#fff', ambient: 'rgba(0,0,0,0)' },
  sunset: { sky: '#ff8c42', grass: '#8D6E63', darkGrass: '#6D4C41', road: '#4a4a4a', roadLine: '#fff', ambient: 'rgba(255,80,0,.12)' },
  night:  { sky: '#0d1b2a', grass: '#1b3a1e', darkGrass: '#0f2312', road: '#333', roadLine: 'rgba(255,255,255,.7)', ambient: 'rgba(0,0,0,.3)' },
};

// ─────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────
let gameState = 'menu'; // 'menu' | 'garage' | 'settings' | 'playing' | 'gameover' | 'paused'
let playerColor = 'red';
let timeOfDay = 'day';
let trafficDensity = 'medium';
let bestScore = parseInt(localStorage.getItem('htr_best') || '0');

// ─────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
const screens = {
  menu:     $('mainMenu'),
  garage:   $('garageScreen'),
  settings: $('settingsScreen'),
  game:     $('gameScreen'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  gameState = name === 'game' ? 'playing' : name;
}

// ─────────────────────────────────────────────
// MENU WIRING
// ─────────────────────────────────────────────
$('menuBestScore').textContent = bestScore;

$('btnPlay').addEventListener('click', () => {
  showScreen('game');
  initGame();
});
$('btnGarage').addEventListener('click', () => {
  showScreen('garage');
  drawGaragePreview();
});
$('btnSettings').addEventListener('click', () => showScreen('settings'));
$('btnGarageBack').addEventListener('click', () => showScreen('menu'));
$('btnSettingsBack').addEventListener('click', () => {
  timeOfDay = $('settingTimeOfDay').value;
  trafficDensity = $('settingTrafficDensity').value;
  showScreen('menu');
});

$('btnRestart').addEventListener('click', () => {
  $('gameOverScreen').classList.add('hidden');
  initGame();
});
$('btnMenu').addEventListener('click', () => {
  $('gameOverScreen').classList.add('hidden');
  showScreen('menu');
  $('menuBestScore').textContent = bestScore;
});
$('btnPause').addEventListener('click', () => togglePause());
$('btnResume').addEventListener('click', () => togglePause());
$('btnPauseMenu').addEventListener('click', () => {
  $('pauseOverlay').classList.add('hidden');
  showScreen('menu');
  $('menuBestScore').textContent = bestScore;
});

// Colour picker in garage
document.querySelectorAll('.color-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
    playerColor = sw.dataset.color;
    drawGaragePreview();
  });
});

// Settings sync
$('settingTimeOfDay').addEventListener('change', () => { timeOfDay = $('settingTimeOfDay').value; });
$('settingTrafficDensity').addEventListener('change', () => { trafficDensity = $('settingTrafficDensity').value; });

// ─────────────────────────────────────────────
// GARAGE PREVIEW
// ─────────────────────────────────────────────
function drawGaragePreview() {
  const gc = $('garageCanvas');
  const ctx = gc.getContext('2d');
  ctx.clearRect(0, 0, gc.width, gc.height);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, gc.width, gc.height);
  // Ground reflection
  const grd = ctx.createLinearGradient(0, 100, 0, 200);
  grd.addColorStop(0, 'rgba(255,109,0,.1)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 100, gc.width, 100);
  // Draw car centered
  drawPlayerCar(ctx, gc.width/2, gc.height/2 - 10, 1.3, playerColor);
  // Shadow
  ctx.save();
  ctx.globalAlpha = .25;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(gc.width/2, gc.height/2 + 42, 44, 12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}
drawGaragePreview();

// ─────────────────────────────────────────────
// CANVAS SETUP
// ─────────────────────────────────────────────
const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = $('minimapCanvas');
const mmCtx = minimapCanvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─────────────────────────────────────────────
// ROAD GEOMETRY HELPERS
// ─────────────────────────────────────────────
function getRoadLeft(cw) {
  const totalRoad = CONFIG.LANES * CONFIG.LANE_WIDTH;
  return (cw - totalRoad) / 2;
}
function getRoadRight(cw) { return getRoadLeft(cw) + CONFIG.LANES * CONFIG.LANE_WIDTH; }
function laneX(lane, cw) { return getRoadLeft(cw) + lane * CONFIG.LANE_WIDTH + CONFIG.LANE_WIDTH / 2; }

// ─────────────────────────────────────────────
// GAME OBJECTS
// ─────────────────────────────────────────────
let player, trafficCars, particles, scorePopups;
let scrollY, score, maxSpeedKmh, overtakes, nearMisses;
let combo, comboTimer, comboDisplayTimer;
let nitro, nitroActive;
let playerPosition, distanceTravelled;
let spawnTimer, gameLoopId;
let roadOffset; // for scrolling road lines
let aiRacers;
let shakeX = 0, shakeY = 0, shakeDuration = 0;
let slowMo = 1, slowMoTimer = 0;
let crashFlash = 0;
let screenFlashOpacity = 0;

// Trees and rocks (static scenery)
let scenery = [];

function initGame() {
  cancelAnimationFrame(gameLoopId);

  const cw = canvas.width, ch = canvas.height;
  const startLane = Math.floor(CONFIG.LANES / 2);

  player = {
    x: laneX(startLane, cw),
    y: ch * 0.72,
    targetX: laneX(startLane, cw),
    lane: startLane,
    speed: 0,          // 0–1 normalised
    speedKmh: 0,
    color: playerColor,
    width: 42, height: 72,
    crashed: false,
    braking: false,
    steerDir: 0,
    nitroFx: 0,
  };

  trafficCars = [];
  particles   = [];
  scorePopups = [];
  scrollY     = 0;
  roadOffset  = 0;
  score       = 0;
  maxSpeedKmh = 0;
  overtakes   = 0;
  nearMisses  = 0;
  combo       = 1;
  comboTimer  = 0;
  distanceTravelled = 0;
  nitro       = 1;
  nitroActive = false;
  spawnTimer  = 0;
  shakeX = 0; shakeY = 0; shakeDuration = 0;
  slowMo = 1; slowMoTimer = 0;
  crashFlash  = 0;
  screenFlashOpacity = 0;

  playerPosition = CONFIG.TOTAL_RACERS;
  aiRacers = [];
  for (let i = 0; i < CONFIG.TOTAL_RACERS - 1; i++) {
    aiRacers.push({ score: Math.random() * 200, speed: 0.3 + Math.random() * 0.4 });
  }

  // Generate scenery
  scenery = [];
  for (let i = 0; i < 80; i++) generateSceneryItem(i * 200);

  // Pre-spawn some traffic
  for (let i = 0; i < 20; i++) spawnTraffic(true);

  $('gameOverScreen').classList.add('hidden');
  $('pauseOverlay').classList.add('hidden');
  $('comboDisplay').classList.add('hidden');

  showScreen('game');
  gameState = 'playing';
  gameLoop();
}

// ─────────────────────────────────────────────
// SCENERY GENERATION
// ─────────────────────────────────────────────
function generateSceneryItem(yPos) {
  const cw = canvas.width;
  const roadL = getRoadLeft(cw);
  const roadR = getRoadRight(cw);
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const type = Math.random() < 0.55 ? 'tree' : (Math.random() < 0.6 ? 'rock' : 'bush');
  let x;
  if (side === 'left') {
    x = Math.random() * (roadL - 30) + 15;
  } else {
    x = roadR + Math.random() * (cw - roadR - 30) + 15;
  }
  scenery.push({
    x, y: yPos, type, side,
    scale: 0.6 + Math.random() * 0.8,
    variant: Math.floor(Math.random() * 3),
    color: type === 'tree' ? (['#2E7D32','#388E3C','#1B5E20','#43A047'][Math.floor(Math.random()*4)]) : '#78909C',
  });
}

// ─────────────────────────────────────────────
// TRAFFIC SPAWNING
// ─────────────────────────────────────────────
const TRAFFIC_TYPES = [
  { name:'sedan',   w:38, h:64, speed: [0.25, 0.45] },
  { name:'suv',     w:42, h:70, speed: [0.2, 0.4] },
  { name:'truck',   w:46, h:110,speed: [0.15, 0.3] },
  { name:'van',     w:42, h:80, speed: [0.18, 0.35] },
  { name:'sports',  w:36, h:62, speed: [0.35, 0.55] },
  { name:'bus',     w:46, h:130,speed: [0.12, 0.25] },
];

function spawnTraffic(initial = false) {
  if (trafficCars.length >= CONFIG.TRAFFIC_COUNT_MAX) return;
  const cw = canvas.width, ch = canvas.height;
  const type = TRAFFIC_TYPES[Math.floor(Math.random() * TRAFFIC_TYPES.length)];
  const lane = Math.floor(Math.random() * CONFIG.LANES);
  const color = TRAFFIC_PALETTE[Math.floor(Math.random() * TRAFFIC_PALETTE.length)];
  const spd = type.speed[0] + Math.random() * (type.speed[1] - type.speed[0]);

  // Check if spawn spot is clear
  const spawnY = initial ? (Math.random() * ch * 2 - ch) : (-type.h - 20 - Math.random() * 200);
  const spawnX = laneX(lane, cw);

  // Don't overlap with existing cars at spawn
  for (const c of trafficCars) {
    if (Math.abs(c.x - spawnX) < 60 && Math.abs(c.y - spawnY) < 120) return;
  }

  trafficCars.push({
    x: spawnX, y: spawnY,
    lane, type: type.name,
    width: type.w, height: type.h,
    speed: spd, color,
    laneChangeTimer: 2 + Math.random() * 4,
    laneChangeCooldown: 0,
    overtakenBy: false, // for scoring
    id: Math.random(),
  });
}

// ─────────────────────────────────────────────
// INPUT HANDLING
// ─────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

// Mobile buttons
function setupMobileBtn(id, key) {
  const btn = $(id);
  if (!btn) return;
  btn.addEventListener('pointerdown', () => { keys[key] = true; });
  btn.addEventListener('pointerup',   () => { keys[key] = false; });
  btn.addEventListener('pointerleave',() => { keys[key] = false; });
}
setupMobileBtn('btnLeft',  'ArrowLeft');
setupMobileBtn('btnRight', 'ArrowRight');
setupMobileBtn('btnGas',   'ArrowUp');
setupMobileBtn('btnBrake', 'ArrowDown');

// Nitro with Shift/Space
window.addEventListener('keydown', e => {
  if ((e.key === 'Shift' || e.key === ' ') && nitro > 0.05) nitroActive = true;
});
window.addEventListener('keyup',   e => {
  if (e.key === 'Shift' || e.key === ' ') nitroActive = false;
});

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    $('pauseOverlay').classList.remove('hidden');
  } else if (gameState === 'paused') {
    gameState = 'playing';
    $('pauseOverlay').classList.add('hidden');
    gameLoop();
  }
}

// ─────────────────────────────────────────────
// GAME LOOP
// ─────────────────────────────────────────────
let lastTimestamp = 0;
function gameLoop(ts = 0) {
  if (gameState !== 'playing') return;
  const dt = Math.min((ts - lastTimestamp) / 16.67, 3); // normalized delta (1 = 60fps)
  lastTimestamp = ts;

  update(dt);
  render();

  gameLoopId = requestAnimationFrame(gameLoop);
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
function update(dt) {
  if (player.crashed) return;

  const cw = canvas.width, ch = canvas.height;
  const densityMap = { low: 1200, medium: 800, high: 500 };
  const spawnInterval = densityMap[trafficDensity] || 800;

  // Slow-mo
  slowMoTimer -= dt * 16.67;
  if (slowMoTimer > 0) {
    slowMo = 0.25;
  } else {
    slowMo = Math.min(1, slowMo + 0.04 * dt);
  }
  const eff = dt * slowMo;

  // Screen shake decay
  if (shakeDuration > 0) {
    shakeDuration -= eff * 16.67;
    shakeX = (Math.random() - 0.5) * 14 * (shakeDuration / 300);
    shakeY = (Math.random() - 0.5) * 14 * (shakeDuration / 300);
  } else {
    shakeX = 0; shakeY = 0;
  }

  // Crash flash
  if (crashFlash > 0) crashFlash -= eff * 0.05;

  // ── Player Input ──
  const accel = keys['ArrowUp']   || keys['w'] || keys['W'];
  const brake = keys['ArrowDown'] || keys['s'] || keys['S'];
  const left  = keys['ArrowLeft'] || keys['a'] || keys['A'];
  const right = keys['ArrowRight']|| keys['d'] || keys['D'];

  // Speed
  const nitroBoost = nitroActive && nitro > 0 ? 0.2 : 0;
  if (accel) {
    player.speed = Math.min(1, player.speed + CONFIG.PLAYER_ACCEL * eff * (1 + nitroBoost));
  } else {
    player.speed = Math.max(0, player.speed - CONFIG.PLAYER_DECEL * eff);
  }
  if (brake) {
    player.speed = Math.max(0, player.speed - CONFIG.PLAYER_BRAKE * eff);
  }
  player.braking = brake;

  // Nitro management
  if (nitroActive && nitro > 0 && accel) {
    nitro = Math.max(0, nitro - CONFIG.NITRO_DRAIN * eff);
    if (nitro <= 0) nitroActive = false;
  } else {
    nitro = Math.min(1, nitro + CONFIG.NITRO_REGEN * eff);
  }
  $('nitroFill').style.width = (nitro * 100) + '%';
  player.nitroFx = nitroActive && nitro > 0 ? Math.min(1, player.nitroFx + 0.2) : Math.max(0, player.nitroFx - 0.1);

  // Speed in KM/H
  player.speedKmh = player.speed * CONFIG.MAX_SPEED_KMH;
  if (player.speedKmh > maxSpeedKmh) maxSpeedKmh = player.speedKmh;

  // Steering
  const roadL = getRoadLeft(cw) + player.width / 2 + 4;
  const roadR = getRoadRight(cw) - player.width / 2 - 4;

  player.steerDir = left ? -1 : right ? 1 : 0;

  if (left)  player.x = Math.max(roadL, player.x - CONFIG.PLAYER_STEER_SPEED * eff * (1 + player.speed * 0.5));
  if (right) player.x = Math.min(roadR, player.x + CONFIG.PLAYER_STEER_SPEED * eff * (1 + player.speed * 0.5));

  // Update lane
  player.lane = Math.round((player.x - getRoadLeft(cw) - CONFIG.LANE_WIDTH/2) / CONFIG.LANE_WIDTH);
  player.lane = Math.max(0, Math.min(CONFIG.LANES - 1, player.lane));

  // Road scroll
  const scrollSpeed = CONFIG.SCROLL_BASE_SPEED + player.speed * 18;
  const scrollDelta = scrollSpeed * eff;
  roadOffset = (roadOffset + scrollDelta) % 200;
  scrollY   += scrollDelta;
  distanceTravelled += scrollDelta * 0.5;

  // Score: distance + speed bonus
  const speedBonus = player.speed > 0.6 ? (player.speed - 0.6) * 3 : 0;
  score += (CONFIG.SCORE_PER_METER * scrollDelta * (1 + speedBonus) * combo) | 0;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('htr_best', bestScore);
  }

  // ── Traffic Update ──
  spawnTimer += dt * 16.67;
  if (spawnTimer > spawnInterval) { spawnTraffic(); spawnTimer = 0; }

  for (let i = trafficCars.length - 1; i >= 0; i--) {
    const c = trafficCars[i];
    // Move traffic downward relative to player
    c.y += (scrollSpeed - c.speed * 15) * eff;

    // Simple AI lane changing
    c.laneChangeCooldown -= eff * 16.67;
    if (c.laneChangeCooldown <= 0) {
      const newLane = c.lane + (Math.random() < 0.5 ? -1 : 1);
      if (newLane >= 0 && newLane < CONFIG.LANES) {
        const nx = laneX(newLane, cw);
        const blocked = trafficCars.some((o, j) => j !== i && Math.abs(o.x - nx) < 50 && Math.abs(o.y - c.y) < 100);
        if (!blocked) { c.lane = newLane; c.x = nx; }
      }
      c.laneChangeCooldown = 2500 + Math.random() * 3000;
    }

    // Remove off screen
    if (c.y > ch + 200) { trafficCars.splice(i, 1); continue; }

    // ── Collision Detection ──
    if (!player.crashed) {
      const dx = Math.abs(player.x - c.x);
      const dy = Math.abs(player.y - c.y);
      const hitW = (player.width + c.width) / 2 - 6;
      const hitH = (player.height + c.height) / 2 - 10;

      if (dx < hitW && dy < hitH) {
        // CRASH!
        triggerCrash();
        return;
      }

      // Near miss / overtake detection
      if (!c.overtakenBy && dy < 80 && dx < 55 && c.y > player.y) {
        c.overtakenBy = true;
        overtakes++;
        addScorePopup(player.x, player.y - 40, '+' + (CONFIG.SCORE_OVERTAKE * combo), '#4ade80');
        score += CONFIG.SCORE_OVERTAKE * combo;
        triggerCombo('OVERTAKE!');
      }

      // Near miss (very close but no crash)
      if (dy > hitH && dy < hitH + 30 && dx < hitW + 20) {
        if (!c._nearMissTriggered) {
          c._nearMissTriggered = true;
          nearMisses++;
          addScorePopup(player.x, player.y - 60, 'NEAR MISS! +' + (CONFIG.SCORE_NEAR_MISS * combo), '#facc15');
          score += CONFIG.SCORE_NEAR_MISS * combo;
          triggerCombo('NEAR MISS!');
          setTimeout(() => { c._nearMissTriggered = false; }, 1000);
        }
      }
    }
  }

  // ── Particles ──
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * eff;
    p.y += p.vy * eff;
    p.vy += 0.2 * eff;
    p.life -= eff * 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Spawn tire smoke at high speed
  if (player.speed > 0.7 && Math.random() < 0.3) {
    spawnSmoke(player.x - 14, player.y + player.height / 2);
    spawnSmoke(player.x + 14, player.y + player.height / 2);
  }
  // Nitro flame
  if (player.nitroFx > 0.2 && Math.random() < 0.6) {
    spawnNitroFlame(player.x, player.y + player.height / 2 + 5);
  }

  // ── Score popups ──
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].y -= 1 * eff;
    scorePopups[i].life -= eff * 0.025;
    if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
  }

  // ── Combo timeout ──
  if (comboTimer > 0) {
    comboTimer -= dt * 16.67;
    if (comboTimer <= 0) {
      combo = 1;
    }
  }
  if (comboDisplayTimer > 0) {
    comboDisplayTimer -= dt * 16.67;
    if (comboDisplayTimer <= 0) $('comboDisplay').classList.add('hidden');
  }

  // ── AI Racer Positions ──
  for (const ai of aiRacers) {
    ai.score += ai.speed * scrollSpeed * 0.01 * dt;
  }
  const myScore = score;
  playerPosition = 1 + aiRacers.filter(ai => ai.score > myScore).length;

  // ── Scenery recycling ──
  for (let i = scenery.length - 1; i >= 0; i--) {
    scenery[i].y += scrollDelta;
    if (scenery[i].y > ch + 100) {
      scenery[i].y = -200 - Math.random() * 300;
      generateSceneryItemInPlace(scenery[i]);
    }
  }

  // ── HUD Update ──
  $('hudScore').textContent    = Math.floor(score).toLocaleString();
  $('hudSpeed').textContent    = Math.floor(player.speedKmh);
  $('hudPosition').textContent = playerPosition + ' / ' + CONFIG.TOTAL_RACERS;
}

function generateSceneryItemInPlace(item) {
  const cw = canvas.width;
  const roadL = getRoadLeft(cw);
  const roadR = getRoadRight(cw);
  item.type = Math.random() < 0.55 ? 'tree' : (Math.random() < 0.6 ? 'rock' : 'bush');
  item.scale = 0.6 + Math.random() * 0.8;
  item.variant = Math.floor(Math.random() * 3);
  item.color = item.type === 'tree' ? (['#2E7D32','#388E3C','#1B5E20','#43A047'][Math.floor(Math.random()*4)]) : '#78909C';
  if (item.side === 'left') {
    item.x = Math.random() * (roadL - 30) + 15;
  } else {
    item.x = roadR + Math.random() * (cw - roadR - 30) + 15;
  }
}

// ─────────────────────────────────────────────
// CRASH HANDLING
// ─────────────────────────────────────────────
function triggerCrash() {
  player.crashed = true;
  shakeDuration = 600;
  slowMoTimer = 1200;
  crashFlash = 1;
  screenFlashOpacity = 1;

  window.parent.postMessage({ 
    type: 'CRASH',
    speed: Math.floor(player.speedKmh || 120),
    overtakes: overtakes || 0,
    distance: Math.floor(score || 0)
  }, '*');

  // Spawn sparks
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = 2 + Math.random() * 5;
    particles.push({
      x: player.x, y: player.y,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 4,
      life: 1, color: Math.random() < 0.5 ? '#FFD600' : '#ff6d00',
      size: 2 + Math.random() * 4, type: 'spark',
    });
  }

  if ($('settingSound') && $('settingSound').checked) playCrashSound();

  setTimeout(() => showGameOver(), 1400);
}

function showGameOver() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('htr_best', bestScore);
  }
  $('goDistance').textContent  = Math.floor(distanceTravelled) + ' m';
  $('goScore').textContent     = Math.floor(score).toLocaleString();
  $('goMaxSpeed').textContent  = Math.floor(maxSpeedKmh) + ' KM/H';
  $('goOvertakes').textContent = overtakes;
  $('gameOverScreen').classList.remove('hidden');
  gameState = 'gameover';
}

// ─────────────────────────────────────────────
// COMBO / SCORE POPUP
// ─────────────────────────────────────────────
function triggerCombo(text) {
  combo = Math.min(8, combo + 0.5);
  comboTimer = CONFIG.COMBO_TIMEOUT_MS;
  $('comboText').textContent = text;
  $('comboMultiplier').textContent = 'x' + combo.toFixed(1);
  $('comboDisplay').classList.remove('hidden');
  comboDisplayTimer = 2000;
}

function addScorePopup(x, y, text, color) {
  scorePopups.push({ x, y, text, color, life: 1 });
}

// ─────────────────────────────────────────────
// PARTICLE SPAWNERS
// ─────────────────────────────────────────────
function spawnSmoke(x, y) {
  particles.push({
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 4,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(0.5 + Math.random()),
    life: 0.8 + Math.random() * 0.2,
    color: `rgba(200,200,200,${0.3 + Math.random() * 0.3})`,
    size: 6 + Math.random() * 10,
    type: 'smoke',
  });
}

function spawnNitroFlame(x, y) {
  const colors = ['#00b4d8','#7209b7','#f72585','#4cc9f0'];
  particles.push({
    x: x + (Math.random() - 0.5) * 10,
    y: y + Math.random() * 6,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 1 + Math.random() * 3,
    life: 0.4 + Math.random() * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    type: 'flame',
  });
}

// ─────────────────────────────────────────────
// WEB AUDIO – simple crash sound
// ─────────────────────────────────────────────
function playCrashSound() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.12));
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain(); gain.gain.value = 0.6;
    src.connect(gain); gain.connect(ac.destination);
    src.start();
  } catch (e) {}
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────
function render() {
  const cw = canvas.width, ch = canvas.height;
  const theme = TIME_THEMES[timeOfDay] || TIME_THEMES.day;

  ctx.save();
  // Screen shake
  ctx.translate(shakeX, shakeY);

  // ── Sky / Background ──
  drawBackground(cw, ch, theme);

  // ── Scenery ──
  for (const item of scenery) drawSceneryItem(item, theme);

  // ── Road ──
  drawRoad(cw, ch, theme);

  // ── Traffic Cars ──
  for (const c of trafficCars) drawTrafficCar(c);

  // ── Player ──
  if (!player.crashed || crashFlash < 0.1) {
    drawPlayerCar(ctx, player.x, player.y, 1, player.color, player.steerDir, player.braking, player.nitroFx);
  }

  // ── Particles ──
  for (const p of particles) drawParticle(p);

  // ── Score Popups ──
  for (const sp of scorePopups) {
    ctx.save();
    ctx.globalAlpha = sp.life;
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.fillStyle = sp.color;
    ctx.textAlign = 'center';
    ctx.fillText(sp.text, sp.x, sp.y);
    ctx.restore();
  }

  // ── Flash on crash ──
  if (crashFlash > 0 || screenFlashOpacity > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255,50,0,${Math.max(crashFlash, screenFlashOpacity) * 0.35})`;
    ctx.fillRect(-shakeX, -shakeY, cw, ch);
    screenFlashOpacity = Math.max(0, screenFlashOpacity - 0.03);
    ctx.restore();
  }

  // Night overlay
  if (timeOfDay === 'night') {
    const nightGrd = ctx.createRadialGradient(cw/2, ch*0.6, 100, cw/2, ch*0.5, cw*0.9);
    nightGrd.addColorStop(0, 'rgba(0,0,0,0)');
    nightGrd.addColorStop(1, 'rgba(0,0,30,.55)');
    ctx.fillStyle = nightGrd;
    ctx.fillRect(-shakeX, -shakeY, cw, ch);
  }

  ctx.restore();

  // ── Minimap ──
  drawMinimap();
}

// ─────────────────────────────────────────────
// DRAW BACKGROUND
// ─────────────────────────────────────────────
function drawBackground(cw, ch, theme) {
  // Sky gradient
  let skyGrd;
  if (timeOfDay === 'day') {
    skyGrd = ctx.createLinearGradient(0, 0, 0, ch * 0.35);
    skyGrd.addColorStop(0, '#87ceeb');
    skyGrd.addColorStop(1, '#b0e0f8');
  } else if (timeOfDay === 'sunset') {
    skyGrd = ctx.createLinearGradient(0, 0, 0, ch * 0.35);
    skyGrd.addColorStop(0, '#1a0533');
    skyGrd.addColorStop(0.5, '#b5451b');
    skyGrd.addColorStop(1, '#ff8c42');
  } else {
    skyGrd = ctx.createLinearGradient(0, 0, 0, ch * 0.35);
    skyGrd.addColorStop(0, '#020818');
    skyGrd.addColorStop(1, '#0d1b2a');
  }

  // Full grass first
  ctx.fillStyle = theme.grass;
  ctx.fillRect(0, 0, cw, ch);

  // Draw sky strip at top (perspective effect)
  ctx.fillStyle = skyGrd;
  ctx.fillRect(0, 0, cw, ch * 0.18);

  // Horizon mountains
  drawMountains(cw, ch, theme);

  // Clouds
  if (timeOfDay !== 'night') drawClouds(cw, ch);
}

// ─────────────────────────────────────────────
// MOUNTAINS
// ─────────────────────────────────────────────
const mountainSeeds = Array.from({length:8}, (_,i) => ({
  x: i * 0.15 + 0.02,
  h: 0.06 + Math.sin(i * 1.7) * 0.03,
  w: 0.12 + Math.cos(i * 2.3) * 0.04,
}));
function drawMountains(cw, ch, theme) {
  const horizon = ch * 0.17;
  ctx.fillStyle = timeOfDay === 'night' ? '#0d2410' : (timeOfDay === 'sunset' ? '#3d2b1f' : '#4a7c59');
  ctx.beginPath();
  ctx.moveTo(0, horizon + 10);
  for (const m of mountainSeeds) {
    const mx = m.x * cw;
    const mh = ch * m.h;
    const mw = cw * m.w;
    ctx.lineTo(mx - mw/2, horizon + 10);
    ctx.lineTo(mx, horizon - mh);
    ctx.lineTo(mx + mw/2, horizon + 10);
  }
  ctx.lineTo(cw, horizon + 10);
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────────────────────────
// CLOUDS
// ─────────────────────────────────────────────
const cloudSeeds = [
  {x:.1,y:.03,r:30}, {x:.3,y:.05,r:22},{x:.55,y:.02,r:36},
  {x:.7,y:.06,r:25}, {x:.85,y:.04,r:18},{x:.45,y:.07,r:28},
];
function drawClouds(cw, ch) {
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  for (const c of cloudSeeds) {
    const cx = c.x * cw + (scrollY * 0.02) % cw;
    const cy = c.y * ch;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
    ctx.arc(cx + c.r * 0.8, cy - c.r * 0.3, c.r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx - c.r * 0.6, cy - c.r * 0.2, c.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─────────────────────────────────────────────
// SCENERY ITEMS
// ─────────────────────────────────────────────
function drawSceneryItem(item, theme) {
  const s = item.scale;
  ctx.save();
  ctx.translate(item.x, item.y);

  if (item.type === 'tree') {
    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-5 * s, 0, 10 * s, 22 * s);
    // Canopy – layered circles
    const dark = item.color;
    const light = item.color === '#2E7D32' ? '#43A047' : '#66BB6A';
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(0, -8 * s, 22 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.arc(6 * s, -14 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-4 * s, -20 * s, 12 * s, 0, Math.PI * 2); ctx.fill();
    // Shadow
    ctx.globalAlpha = .2; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 5 * s, 20 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
  } else if (item.type === 'rock') {
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.ellipse(-4 * s, -3 * s, 10 * s, 7 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else { // bush
    ctx.fillStyle = '#558B2F';
    ctx.beginPath(); ctx.arc(0, 0, 12 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#689F38';
    ctx.beginPath(); ctx.arc(8 * s, -4 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-7 * s, -3 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─────────────────────────────────────────────
// ROAD
// ─────────────────────────────────────────────
function drawRoad(cw, ch, theme) {
  const roadL = getRoadLeft(cw);
  const roadR = getRoadRight(cw);
  const totalRoadW = roadR - roadL;

  // Road surface
  const roadGrd = ctx.createLinearGradient(roadL, 0, roadR, 0);
  roadGrd.addColorStop(0,   '#444');
  roadGrd.addColorStop(0.08,'#5a5a5a');
  roadGrd.addColorStop(0.92,'#5a5a5a');
  roadGrd.addColorStop(1,   '#444');
  ctx.fillStyle = roadGrd;
  ctx.fillRect(roadL, 0, totalRoadW, ch);

  // Yellow centre divider (between left half & right half lanes)
  ctx.strokeStyle = '#FFD600';
  ctx.lineWidth = 5;
  const centreX = (roadL + roadR) / 2;
  ctx.setLineDash([50, 30]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(centreX, 0);
  ctx.lineTo(centreX, ch);
  ctx.stroke();
  ctx.setLineDash([]);

  // White lane dividers
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([50, 40]);
  ctx.lineDashOffset = -roadOffset;
  for (let l = 1; l < CONFIG.LANES; l++) {
    if (l === CONFIG.LANES / 2) continue; // skip – yellow centre
    const lx = roadL + l * CONFIG.LANE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, ch);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Road edge lines (solid)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(roadL, 0); ctx.lineTo(roadL, ch); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(roadR, 0); ctx.lineTo(roadR, ch); ctx.stroke();

  // Guard rails
  drawGuardRail(roadL - 14, ch, theme);
  drawGuardRail(roadR + 6,  ch, theme);

  // Street lights
  const lightSpacing = 300;
  for (let y = (roadOffset % lightSpacing) - lightSpacing; y < ch + lightSpacing; y += lightSpacing) {
    drawStreetLight(roadL - 20, y, -1);
    drawStreetLight(roadR + 20, y,  1);
  }
}

function drawGuardRail(x, ch, theme) {
  ctx.fillStyle = '#9E9E9E';
  ctx.fillRect(x, 0, 8, ch);
  // Posts
  ctx.fillStyle = '#757575';
  const spacing = 80;
  for (let y = (roadOffset % spacing) - spacing; y < ch + spacing; y += spacing) {
    ctx.fillRect(x - 2, y, 12, 8);
  }
}

function drawStreetLight(x, y, dir) {
  // Pole
  ctx.fillStyle = '#424242';
  ctx.fillRect(x - 3, y - 30, 6, 56);
  // Arm
  ctx.fillRect(x - 3, y - 30, dir * 28, 5);
  // Lamp
  ctx.fillStyle = timeOfDay === 'night' ? '#FFE082' : '#BDBDBD';
  ctx.beginPath();
  ctx.arc(x + dir * 28, y - 28, 7, 0, Math.PI * 2);
  ctx.fill();
  // Night glow
  if (timeOfDay === 'night') {
    ctx.save();
    const glow = ctx.createRadialGradient(x + dir * 28, y - 28, 0, x + dir * 28, y - 28, 60);
    glow.addColorStop(0, 'rgba(255,224,130,.2)');
    glow.addColorStop(1, 'rgba(255,224,130,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + dir * 28, y - 28, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// DRAW PLAYER CAR
// ─────────────────────────────────────────────
function drawPlayerCar(ctx2, x, y, scale = 1, colorName = 'red', steerDir = 0, braking = false, nitroFx = 0) {
  const c = CAR_COLORS[colorName] || CAR_COLORS.red;
  const W = 42 * scale, H = 72 * scale;
  const hw = W / 2, hh = H / 2;
  const lean = steerDir * 3 * scale;

  ctx2.save();
  ctx2.translate(x + lean, y);

  // Shadow
  ctx2.save();
  ctx2.globalAlpha = .35;
  ctx2.fillStyle = '#000';
  ctx2.beginPath();
  ctx2.ellipse(2, hh + 4, hw + 4, 10, 0, 0, Math.PI * 2);
  ctx2.fill();
  ctx2.restore();

  // ── Wheels ──
  ctx2.fillStyle = c.wheel;
  const wW = 9 * scale, wH = 16 * scale;
  ctx2.fillRect(-hw - 3, -hh + 12, wW, wH);       // FL
  ctx2.fillRect( hw - 6,  -hh + 12, wW, wH);      // FR
  ctx2.fillRect(-hw - 3,  hh - 28, wW, wH);        // RL
  ctx2.fillRect( hw - 6,   hh - 28, wW, wH);       // RR

  // ── Body ──
  ctx2.fillStyle = c.body;
  // Main body
  ctx2.beginPath();
  ctx2.roundRect(-hw, -hh, W, H, [6 * scale, 6 * scale, 8 * scale, 8 * scale]);
  ctx2.fill();

  // Hood gradient
  const hoodGrd = ctx2.createLinearGradient(-hw, -hh, hw, -hh + H * 0.4);
  hoodGrd.addColorStop(0, 'rgba(255,255,255,.18)');
  hoodGrd.addColorStop(1, 'rgba(0,0,0,.1)');
  ctx2.fillStyle = hoodGrd;
  ctx2.beginPath();
  ctx2.roundRect(-hw, -hh, W, H * 0.4, [6 * scale, 6 * scale, 0, 0]);
  ctx2.fill();

  // Stripe(s)
  ctx2.fillStyle = c.stripe;
  ctx2.fillRect(-4 * scale, -hh + 4, 8 * scale, H - 8);

  // ── Windshield / glass ──
  ctx2.fillStyle = c.glass;
  ctx2.globalAlpha = .85;
  ctx2.beginPath();
  ctx2.roundRect(-hw + 5 * scale, -hh + 8 * scale, W - 10 * scale, H * 0.28, 3 * scale);
  ctx2.fill();
  ctx2.globalAlpha = 1;

  // Rear window
  ctx2.fillStyle = c.glass;
  ctx2.globalAlpha = .7;
  ctx2.beginPath();
  ctx2.roundRect(-hw + 6 * scale, hh - 24 * scale, W - 12 * scale, 14 * scale, 3 * scale);
  ctx2.fill();
  ctx2.globalAlpha = 1;

  // ── Headlights ──
  ctx2.fillStyle = '#FFEE58';
  ctx2.beginPath();
  ctx2.roundRect(-hw + 5 * scale, -hh + 2, 12 * scale, 6 * scale, 2 * scale);
  ctx2.fill();
  ctx2.beginPath();
  ctx2.roundRect(hw - 17 * scale, -hh + 2, 12 * scale, 6 * scale, 2 * scale);
  ctx2.fill();

  // ── Brake / Tail lights ──
  const tl = braking ? '#ff1744' : '#e53935';
  ctx2.fillStyle = tl;
  ctx2.shadowColor = tl;
  ctx2.shadowBlur = braking ? 14 : 4;
  ctx2.beginPath();
  ctx2.roundRect(-hw + 5 * scale, hh - 8, 11 * scale, 6 * scale, 2 * scale);
  ctx2.fill();
  ctx2.beginPath();
  ctx2.roundRect(hw - 16 * scale, hh - 8, 11 * scale, 6 * scale, 2 * scale);
  ctx2.fill();
  ctx2.shadowBlur = 0;

  // ── Roof stripes (racing livery) ──
  ctx2.fillStyle = 'rgba(0,0,0,.2)';
  ctx2.fillRect(-hw + 9 * scale, -hh + H * 0.28 + 2, 4 * scale, H * 0.35);
  ctx2.fillRect( hw - 13 * scale, -hh + H * 0.28 + 2, 4 * scale, H * 0.35);

  ctx2.restore();
}

// ─────────────────────────────────────────────
// DRAW TRAFFIC CARS (varied shapes)
// ─────────────────────────────────────────────
function drawTrafficCar(c) {
  ctx.save();
  ctx.translate(c.x, c.y);

  const W = c.width, H = c.height;
  const hw = W / 2, hh = H / 2;
  const col = c.color;

  // Shadow
  ctx.save();
  ctx.globalAlpha = .25;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(1, hh + 4, hw + 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (c.type === 'truck' || c.type === 'bus') {
    // Cab
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, W, H * 0.35, [4, 4, 0, 0]);
    ctx.fill();
    // Body / trailer
    ctx.fillStyle = lightenColor(col, 0.15);
    ctx.beginPath();
    ctx.roundRect(-hw, -hh + H * 0.35, W, H * 0.65, [0, 0, 4, 4]);
    ctx.fill();
    // Cab windows
    ctx.fillStyle = 'rgba(150,230,255,.7)';
    ctx.beginPath();
    ctx.roundRect(-hw + 4, -hh + 4, W - 8, H * 0.2, 3);
    ctx.fill();
    // Wheels
    ctx.fillStyle = '#212121';
    ctx.fillRect(-hw - 3, -hh + H * 0.08, 8, 14);
    ctx.fillRect( hw - 5, -hh + H * 0.08, 8, 14);
    ctx.fillRect(-hw - 3,  hh - H * 0.2, 8, 14);
    ctx.fillRect( hw - 5,  hh - H * 0.2, 8, 14);
    // Tail lights
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-hw + 3, hh - 7, 10, 5);
    ctx.fillRect( hw - 13, hh - 7, 10, 5);
  } else if (c.type === 'van') {
    // Boxy van
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, W, H, 5);
    ctx.fill();
    // Windows along side
    ctx.fillStyle = 'rgba(150,230,255,.65)';
    ctx.beginPath();
    ctx.roundRect(-hw + 4, -hh + 5, W - 8, H * 0.22, 3);
    ctx.fill();
    // Stripe
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.fillRect(-hw, -hh + H * 0.35, W, H * 0.1);
    // Wheels
    ctx.fillStyle = '#212121';
    ctx.fillRect(-hw - 3, -hh + 10, 8, 14);
    ctx.fillRect( hw - 5, -hh + 10, 8, 14);
    ctx.fillRect(-hw - 3,  hh - 24, 8, 14);
    ctx.fillRect( hw - 5,  hh - 24, 8, 14);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-hw + 3, hh - 6, 9, 5);
    ctx.fillRect( hw - 12, hh - 6, 9, 5);
  } else {
    // Sedan / SUV / sports
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, W, H, [5, 5, 7, 7]);
    ctx.fill();
    // Body shine
    const shine = ctx.createLinearGradient(-hw, -hh, hw, -hh + H * 0.5);
    shine.addColorStop(0, 'rgba(255,255,255,.2)');
    shine.addColorStop(1, 'rgba(0,0,0,.05)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, W, H * 0.5, [5, 5, 0, 0]);
    ctx.fill();
    // Windshield
    ctx.fillStyle = 'rgba(150,230,255,.75)';
    ctx.beginPath();
    ctx.roundRect(-hw + 4, -hh + 6, W - 8, H * 0.25, 3);
    ctx.fill();
    // Rear window
    ctx.fillStyle = 'rgba(150,230,255,.6)';
    ctx.beginPath();
    ctx.roundRect(-hw + 4, hh - H * 0.22, W - 8, H * 0.18, 3);
    ctx.fill();
    // Wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-hw - 3, -hh + 10, 8, 14);
    ctx.fillRect( hw - 5, -hh + 10, 8, 14);
    ctx.fillRect(-hw - 3,  hh - 24, 8, 14);
    ctx.fillRect( hw - 5,  hh - 24, 8, 14);
    // Headlights
    ctx.fillStyle = '#FFEE58';
    ctx.fillRect(-hw + 3, -hh + 2, 9, 5);
    ctx.fillRect( hw - 12, -hh + 2, 9, 5);
    // Tail lights
    ctx.fillStyle = '#e53935';
    ctx.shadowColor = '#e53935'; ctx.shadowBlur = 4;
    ctx.fillRect(-hw + 3, hh - 7, 9, 5);
    ctx.fillRect( hw - 12, hh - 7, 9, 5);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function lightenColor(hex, amount) {
  // Simple hex lighten
  try {
    const num = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(amount * 255));
    const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(amount * 255));
    const b = Math.min(255, (num & 0xff) + Math.round(amount * 255));
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

// ─────────────────────────────────────────────
// DRAW PARTICLES
// ─────────────────────────────────────────────
function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.life;
  if (p.type === 'smoke') {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'flame') {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else { // spark
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ─────────────────────────────────────────────
// MINIMAP
// ─────────────────────────────────────────────
const MINIMAP_PATH = [
  [0.5, 0.88], [0.3, 0.8], [0.2, 0.65], [0.25, 0.5],
  [0.35, 0.4], [0.3, 0.28], [0.4, 0.18], [0.55, 0.15],
  [0.7, 0.2], [0.75, 0.35], [0.65, 0.5], [0.7, 0.65],
  [0.6, 0.8], [0.5, 0.88],
];

function drawMinimap() {
  const mw = minimapCanvas.width, mh = minimapCanvas.height;
  mmCtx.clearRect(0, 0, mw, mh);

  // Dark background
  mmCtx.fillStyle = 'rgba(10,10,20,.95)';
  mmCtx.beginPath();
  mmCtx.roundRect(0, 0, mw, mh, 6);
  mmCtx.fill();

  // Track path
  mmCtx.strokeStyle = '#fff';
  mmCtx.lineWidth = 4;
  mmCtx.lineCap = 'round';
  mmCtx.lineJoin = 'round';
  mmCtx.beginPath();
  MINIMAP_PATH.forEach(([px, py], i) => {
    const mx = px * mw, my = py * mh;
    if (i === 0) mmCtx.moveTo(mx, my);
    else mmCtx.lineTo(mx, my);
  });
  mmCtx.closePath();
  mmCtx.stroke();

  // Start / finish
  const startPt = MINIMAP_PATH[MINIMAP_PATH.length - 2];
  mmCtx.fillStyle = '#4caf50';
  mmCtx.beginPath();
  mmCtx.arc(startPt[0] * mw, startPt[1] * mh, 7, 0, Math.PI * 2);
  mmCtx.fill();

  // Checkered finish
  const finishPt = MINIMAP_PATH[5];
  const fx = finishPt[0] * mw, fy = finishPt[1] * mh;
  const sqSz = 5;
  for (let r = 0; r < 2; r++) for (let col2 = 0; col2 < 3; col2++) {
    mmCtx.fillStyle = (r + col2) % 2 === 0 ? '#fff' : '#000';
    mmCtx.fillRect(fx - 7 + col2 * sqSz, fy - sqSz + r * sqSz, sqSz, sqSz);
  }

  // Player position on minimap (looping around track)
  const progress = (distanceTravelled * 0.001) % 1;
  const idx = progress * (MINIMAP_PATH.length - 1);
  const lo = Math.floor(idx), hi = Math.min(MINIMAP_PATH.length - 1, lo + 1);
  const t = idx - lo;
  const px = (MINIMAP_PATH[lo][0] * (1 - t) + MINIMAP_PATH[hi][0] * t) * mw;
  const py = (MINIMAP_PATH[lo][1] * (1 - t) + MINIMAP_PATH[hi][1] * t) * mh;

  // Player dot
  mmCtx.fillStyle = '#e53935';
  mmCtx.shadowColor = '#e53935'; mmCtx.shadowBlur = 6;
  mmCtx.beginPath();
  mmCtx.arc(px, py, 6, 0, Math.PI * 2);
  mmCtx.fill();
  mmCtx.shadowBlur = 0;
}

// ─────────────────────────────────────────────
// INITIAL MENU CAR PREVIEW (canvas drawn)
// ─────────────────────────────────────────────
(function drawMenuCar() {
  const preview = $('menuCarPreview');
  if (!preview) return;
  const c = document.createElement('canvas');
  c.width = 200; c.height = 120;
  c.style.cssText = 'display:block;margin:auto;';
  preview.appendChild(c);
  const cx = c.getContext('2d');
  // Ground glow
  const grd = cx.createRadialGradient(100, 100, 10, 100, 80, 80);
  grd.addColorStop(0, 'rgba(255,109,0,.2)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = grd; cx.fillRect(0, 0, 200, 120);
  drawPlayerCar(cx, 100, 70, 1.1, playerColor, 0, false, 0);
})();

// ─────────────────────────────────────────────
// START – show main menu
// ─────────────────────────────────────────────
showScreen('menu');
