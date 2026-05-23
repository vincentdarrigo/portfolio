/* ═══════════════════════════════════════════════════════
   tamagotchi.js — Tamagotchi Pet Sim
   Vince Darrigo / The Mothership
   - Persists between visits via localStorage
   - Pet never dies while you're away (offline drain is capped)
   - Hunger, Happiness, Age, Poop system
   - Growth stages: Egg → Baby → Child → Teen → Adult → Elder
═══════════════════════════════════════════════════════ */

const TAMA_KEY  = 'vincesvault_tama_v2';
const TAMA_TICK = 8000; // ms per game tick (8 seconds)

// Stats drain per tick
const DRAIN = {
  hunger:    3,   // 0=full, 100=starving
  happiness: 2,   // 0=sad, 100=happy
};

// Growth: [name, minAge (in ticks), sprite]
const TAMA_STAGES = [
  { name: 'Egg',   minTicks: 0,   sprite: 'egg'   },
  { name: 'Baby',  minTicks: 6,   sprite: 'baby'  },
  { name: 'Child', minTicks: 40,  sprite: 'child' },
  { name: 'Teen',  minTicks: 120, sprite: 'teen'  },
  { name: 'Adult', minTicks: 300, sprite: 'adult' },
  { name: 'Elder', minTicks: 700, sprite: 'elder' },
];

// Pixel-art sprites (12×12 grid of 0/1/2 where 0=off, 1=dark, 2=light)
const TAMA_SPRITES = {
  egg: [
    '000011100000',
    '000111110000',
    '001111111000',
    '011111111100',
    '011111111100',
    '011111111100',
    '011111111100',
    '011111111100',
    '001111111000',
    '000111110000',
    '000011100000',
    '000000000000',
  ],
  baby: [
    '000011100000',
    '000111110000',
    '001122211000',
    '011211112100',
    '011100011100',
    '011111111100',
    '001111111000',
    '000101010000',
    '000011100000',
    '000000000000',
    '000000000000',
    '000000000000',
  ],
  child: [
    '001111100000',
    '011111110000',
    '011221111000',
    '011111111000',
    '001100110000',
    '001111110000',
    '000111100000',
    '001011010000',
    '001000010000',
    '000000000000',
    '000000000000',
    '000000000000',
  ],
  teen: [
    '001111110000',
    '011111111000',
    '011221211000',
    '011111111000',
    '001100110000',
    '001111110000',
    '011111111000',
    '010011001000',
    '010011001000',
    '011000011000',
    '000000000000',
    '000000000000',
  ],
  adult: [
    '001111110000',
    '011111111000',
    '011221211000',
    '011211211000',
    '001100110000',
    '001111110000',
    '011111111000',
    '011011011000',
    '011011011000',
    '011000011000',
    '011000011000',
    '000000000000',
  ],
  elder: [
    '001111110000',
    '011111111000',
    '011221211000',
    '011211211000',
    '001100110000',
    '001111110000',
    '011111111000',
    '011011011000',
    '011011011000',
    '011000011000',
    '011000011000',
    '001100110000',
  ],
  poop: [
    '000011100000',
    '000111110000',
    '001111111000',
    '000111110000',
    '001111111000',
    '011111111100',
    '001111111000',
    '000000000000',
    '000000000000',
    '000000000000',
    '000000000000',
    '000000000000',
  ],
  sleeping: [
    '001111110000',
    '011111111000',
    '011211211000',
    '011111111000',
    '001111110000',
    '001111110000',
    '001111110000',
    '011111111000',
    '011011011000',
    '011000011000',
    '000000000000',
    '000000000000',
  ],
  happy_sparkle: [
    '100000001001',
    '010001010010',
    '001111100000',
    '011221110100',
    '001111110001',
    '001100110000',
    '001111110010',
    '011111111000',
    '010011001000',
    '010011001001',
    '011000011010',
    '000000000000',
  ],
};

// ── STATE ─────────────────────────────────────────────

let tama = null;
let tamaTimer = null;
let tamaFrame = 0;
let tamaAnimTimer = null;
let tamaShowPoop = false;
let tamaShowSleep = false;
let tamaSparkle = false;
let tamaSparkleTimer = null;

function defaultTama() {
  return {
    hunger:    20,   // 0=full, 100=starving
    happiness: 80,
    age:       0,    // ticks
    poop:      0,    // 0-3 accumulated poops
    sleeping:  false,
    lastSave:  Date.now(),
    name:      'Bitsy',
  };
}

function loadTama() {
  try {
    const raw = localStorage.getItem(TAMA_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Apply offline drain (capped so pet can't die while away)
      const elapsed = Math.floor((Date.now() - saved.lastSave) / TAMA_TICK);
      const ticks   = Math.min(elapsed, 30); // max 30 ticks of offline drain
      if (ticks > 0) {
        saved.hunger    = Math.min(100, saved.hunger    + DRAIN.hunger    * ticks);
        saved.happiness = Math.max(0,   saved.happiness - DRAIN.happiness * ticks);
        saved.age       = saved.age + ticks;
        if (ticks >= 4) saved.poop = Math.min(3, saved.poop + 1);
      }
      return saved;
    }
  } catch (e) {}
  return defaultTama();
}

function saveTama() {
  if (!tama) return;
  tama.lastSave = Date.now();
  localStorage.setItem(TAMA_KEY, JSON.stringify(tama));
}

// ── STAGE ─────────────────────────────────────────────

function getStage() {
  for (let i = TAMA_STAGES.length - 1; i >= 0; i--) {
    if (tama.age >= TAMA_STAGES[i].minTicks) return TAMA_STAGES[i];
  }
  return TAMA_STAGES[0];
}

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-tamagotchi');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !tamaTimer) {
      initTamagotchi();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

function initTamagotchi() {
  tama = loadTama();
  updateTamaUI();
  tamaTimer = setInterval(tamaTick, TAMA_TICK);
  startTamaAnim();
}

function tamaTick() {
  if (!tama) return;
  if (tama.sleeping) {
    // Sleeping: recover stats
    tama.hunger    = Math.max(0, tama.hunger    - 1);
    tama.happiness = Math.min(100, tama.happiness + 1);
  } else {
    tama.hunger    = Math.min(100, tama.hunger    + DRAIN.hunger);
    tama.happiness = Math.max(0,   tama.happiness - DRAIN.happiness);
  }
  tama.age++;

  // Poop accumulates every ~12 ticks
  if (tama.age % 12 === 0 && !tama.sleeping) {
    tama.poop = Math.min(3, tama.poop + 1);
  }

  saveTama();
  updateTamaUI();
}

// ── ACTIONS ───────────────────────────────────────────

function tamaFeed() {
  if (!tama) return;
  tama.hunger = Math.max(0, tama.hunger - 30);
  if (tama.hunger < 10) tama.hunger = 0;
  flashSparkle();
  saveTama();
  updateTamaUI();
}

function tamaPlay() {
  if (!tama) return;
  if (tama.sleeping) { tamaWake(); return; }
  tama.happiness = Math.min(100, tama.happiness + 20);
  tama.hunger    = Math.min(100, tama.hunger    + 5); // playing makes hungry
  flashSparkle();
  saveTama();
  updateTamaUI();
}

function tamaSleep() {
  if (!tama) return;
  tama.sleeping = !tama.sleeping;
  tamaShowSleep = tama.sleeping;
  saveTama();
  updateTamaUI();
}

function tamaWake() {
  tama.sleeping  = false;
  tamaShowSleep  = false;
  saveTama();
  updateTamaUI();
}

function tamaClean() {
  if (!tama) return;
  tama.poop = 0;
  tamaShowPoop = false;
  flashSparkle();
  saveTama();
  updateTamaUI();
}

function tamaReset() {
  clearInterval(tamaTimer);
  clearInterval(tamaAnimTimer);
  clearTimeout(tamaSparkleTimer);
  tamaTimer = null;
  tamaShowPoop = false;
  tamaShowSleep = false;
  tamaSparkle = false;
  localStorage.removeItem(TAMA_KEY);
  tama = defaultTama();
  saveTama();
  updateTamaUI();
  tamaTimer = setInterval(tamaTick, TAMA_TICK);
  startTamaAnim();
}

function flashSparkle() {
  tamaSparkle = true;
  clearTimeout(tamaSparkleTimer);
  tamaSparkleTimer = setTimeout(() => { tamaSparkle = false; drawTama(); }, 1200);
}

// ── RENDER ────────────────────────────────────────────

function startTamaAnim() {
  clearInterval(tamaAnimTimer);
  tamaAnimTimer = setInterval(() => {
    tamaFrame++;
    drawTama();
  }, 400);
}

function drawTama() {
  const canvas = document.getElementById('tama-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // LCD green background
  ctx.fillStyle = '#8bbc0f';
  ctx.fillRect(0, 0, W, H);

  // Grid lines (subtle)
  ctx.strokeStyle = '#7aab0e';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < W; i += 3) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
  for (let i = 0; i < H; i += 3) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

  if (!tama) return;

  const stage = getStage();
  let spriteKey = stage.sprite;
  if (tamaSparkle)       spriteKey = 'happy_sparkle';
  else if (tama.sleeping) spriteKey = 'sleeping';

  // Bob animation offset
  const bobY = (tamaFrame % 2 === 0) ? 0 : 1;

  // Draw main sprite centered
  drawTamaSprite(ctx, TAMA_SPRITES[spriteKey], 10, 8 + bobY, 5);

  // Poop indicator (small, to the right)
  if (tama.poop > 0) {
    drawTamaSprite(ctx, TAMA_SPRITES.poop, W - 22, H - 20, 1.5);
    if (tama.poop > 1) drawTamaSprite(ctx, TAMA_SPRITES.poop, W - 14, H - 20, 1.5);
    if (tama.poop > 2) drawTamaSprite(ctx, TAMA_SPRITES.poop, W - 18, H - 28, 1.5);
  }

  // ZZZ if sleeping
  if (tama.sleeping) {
    ctx.fillStyle = '#1a3a00';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('z', W - 28, 18);
    ctx.fillText('Z', W - 22, 12);
    ctx.fillText('Z', W - 16, 7);
  }
}

function drawTamaSprite(ctx, rows, ox, oy, scale) {
  const DARK  = '#0a2808';
  const LIGHT = '#c8e880';
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      const v = row[cx];
      if (v === '0') continue;
      ctx.fillStyle = v === '1' ? DARK : LIGHT;
      ctx.fillRect(ox + cx * scale, oy + ry * scale, scale, scale);
    }
  });
}

function updateTamaUI() {
  if (!tama) return;

  drawTama();

  const stage = getStage();
  const el = id => document.getElementById(id);

  if (el('tama-name'))      el('tama-name').textContent      = tama.name + ' the ' + stage.name;
  if (el('tama-age'))       el('tama-age').textContent        = tama.age;
  if (el('tama-hunger-bar')) setBar('tama-hunger-bar',    100 - tama.hunger);
  if (el('tama-happy-bar'))  setBar('tama-happy-bar',     tama.happiness);
  if (el('tama-poop-count')) el('tama-poop-count').textContent = '💩'.repeat(tama.poop) || '✨ clean';
  if (el('tama-status'))    el('tama-status').textContent    = getTamaStatus();
}

function setBar(id, pct) {
  const bar = document.getElementById(id);
  if (!bar) return;
  bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  bar.className = 'tama-bar-fill' +
    (pct > 60 ? ' bar-good' : pct > 30 ? ' bar-ok' : ' bar-bad');
}

function getTamaStatus() {
  if (!tama) return '';
  if (tama.sleeping) return '💤 sleeping...';
  if (tama.poop >= 3) return '🤢 please clean me!!';
  if (tama.hunger >= 80) return '😩 SO HUNGRY!!';
  if (tama.hunger >= 60) return '😕 getting hungry...';
  if (tama.happiness <= 20) return '😢 feeling lonely...';
  if (tama.happiness <= 40) return '😐 a bit bored';
  if (tama.hunger <= 20 && tama.happiness >= 70) return '😄 well fed & happy!';
  return '😊 doing okay!';
}
