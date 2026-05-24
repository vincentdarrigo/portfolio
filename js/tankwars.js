/* ═══════════════════════════════════════════════════════
   tankwars.js — Browser Wars: IE vs Netscape Tank Battle
   Powered by Mosaic's tears
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── CONSTANTS ─────────────────────────────────────────
const TW_W = 700;
const TW_H = 340;
const GRAVITY = 0.18;
const TANK_W  = 28;
const TANK_H  = 12;
const BARREL_L = 14;

// ── COMMENTARY POOLS ──────────────────────────────────
const TW_COMMENTARY = {
  fire: [
    'A bold shot from {team}!',
    '{team} fires! Windows shudder.',
    '{team} launches a packet — hope it isn\'t dropped.',
    '{team} attempts a connection. Timeout: 30 seconds.',
    '{team}: "This should be a quick fix."',
  ],
  miss: [
    'Missed! The projectile returns 404.',
    'Blast lands harmlessly. Error 500 on the next attempt.',
    'A near miss. Netscape sends a security warning.',
    'Missed by miles. IE blames the user\'s hardware.',
    'Just dirt. Nobody is surprised.',
    'The terrain takes a hit. Filed as WONTFIX.',
  ],
  hit: [
    'Direct hit! One less browser to worry about.',
    'TANK DOWN! That\'s a runtime exception.',
    'Eliminated! The market share shifts.',
    'Critical hit! Fatal error. No, seriously.',
    'Down! The install wizard did not help.',
  ],
  mosaic_quip: [
    'Mosaic: "I invented hyperlinks. You\'re welcome."',
    'Mosaic: "Both of you are essentially my bugs."',
    'Mosaic: "I\'m just here to watch my children suffer."',
    'Mosaic: "2.53 million downloads in 1993. Anyway."',
    'Mosaic: "Neither of you can render my HTML either."',
  ],
  ie_win: [
    'INTERNET EXPLORER WINS!\nBundled with Windows ME. Unstoppable by law.',
    'IE VICTORY!\nThe antitrust settlement was worth it, apparently.',
    'INTERNET EXPLORER WINS!\nCelebrate with an ActiveX dance.',
  ],
  ns_win: [
    'NETSCAPE WINS!\nFirefox will carry on the legacy. Eventually.',
    'NAVIGATOR VICTORY!\n"We had 90% market share once. We remember."',
    'NETSCAPE WINS!\nAOL will acquire this victory shortly.',
  ],
};

function twQuip(pool, team) {
  const s = pool[Math.floor(Math.random() * pool.length)];
  return s.replace('{team}', team);
}

// ── TERRAIN ───────────────────────────────────────────

function twGenTerrain() {
  const heights = new Float32Array(TW_W);
  // Multi-octave sine waves for natural hills
  const seed = Math.random() * 1000;
  for (let x = 0; x < TW_W; x++) {
    let h  = TW_H * 0.5;
    h += Math.sin((x / TW_W) * Math.PI * 2.1 + seed) * 55;
    h += Math.sin((x / TW_W) * Math.PI * 4.7 + seed * 0.7) * 28;
    h += Math.sin((x / TW_W) * Math.PI * 9.3 + seed * 1.3) * 14;
    h += Math.sin((x / TW_W) * Math.PI * 18 + seed * 2.1) * 7;
    h = Math.max(TW_H * 0.25, Math.min(TW_H * 0.82, h));
    heights[x] = h;
  }
  // Flatten slightly near edges for tank placement
  for (let x = 0; x < 60; x++) {
    const t = x / 60;
    heights[x]           = heights[60] * t + heights[0] * (1 - t);
    heights[TW_W - 1 - x] = heights[TW_W - 61] * t + heights[TW_W - 1] * (1 - t);
  }
  return heights;
}

function twTerrainAt(terrain, x) {
  const xi = Math.max(0, Math.min(TW_W - 1, Math.round(x)));
  return terrain[xi];
}

function twCrater(terrain, cx, radius) {
  for (let x = Math.max(0, cx - radius); x <= Math.min(TW_W - 1, cx + radius); x++) {
    const dist = Math.abs(x - cx);
    const depth = Math.sqrt(Math.max(0, radius * radius - dist * dist)) * 0.6;
    terrain[x] = Math.min(TW_H - 10, terrain[x] + depth);
  }
}

// ── TANK PLACEMENT ────────────────────────────────────

function twPlaceTanks(terrain) {
  const tanks = [];
  // IE: 5 tanks on the right half (x ~500-660)
  for (let i = 0; i < 5; i++) {
    const x = 490 + i * 38;
    const y = twTerrainAt(terrain, x) - TANK_H / 2;
    tanks.push({ x, y, team: 'ie', alive: true, angle: 150 + Math.random() * 30, hp: 1 });
  }
  // NN: 5 tanks on the left half (x ~40-200)
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 38;
    const y = twTerrainAt(terrain, x) - TANK_H / 2;
    tanks.push({ x, y, team: 'netscape', alive: true, angle: 10 + Math.random() * 30, hp: 1 });
  }
  return tanks;
}

// ── DRAW ──────────────────────────────────────────────

function twDraw(ctx, state) {
  const { terrain, tanks, projectile, explosions, wind, currentTankIdx, phase, playerTeam } = state;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, TW_H);
  sky.addColorStop(0, '#0a0a1a');
  sky.addColorStop(1, '#1a0a0a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, TW_W, TW_H);

  // Stars (static, determined by seeded positions)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137.5) % TW_W);
    const sy = ((i * 93.7) % (TW_H * 0.5));
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Terrain fill (green surface, brown body)
  ctx.beginPath();
  ctx.moveTo(0, TW_H);
  for (let x = 0; x < TW_W; x++) {
    ctx.lineTo(x, terrain[x]);
  }
  ctx.lineTo(TW_W, TW_H);
  ctx.closePath();
  const terrGrad = ctx.createLinearGradient(0, TW_H * 0.4, 0, TW_H);
  terrGrad.addColorStop(0, '#1a4a0a');
  terrGrad.addColorStop(0.12, '#2a6010');
  terrGrad.addColorStop(0.13, '#5a3a1a');
  terrGrad.addColorStop(1, '#3a2005');
  ctx.fillStyle = terrGrad;
  ctx.fill();

  // Terrain surface line
  ctx.beginPath();
  ctx.moveTo(0, terrain[0]);
  for (let x = 1; x < TW_W; x++) ctx.lineTo(x, terrain[x]);
  ctx.strokeStyle = '#44aa22';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Draw tanks
  tanks.forEach((tank, idx) => {
    if (!tank.alive) return;
    const isIE = tank.team === 'ie';
    const isCurrent = (idx === currentTankIdx && phase === 'aim');
    const isPlayer  = (tank.team === playerTeam && playerTeam !== null);

    // Chassis
    ctx.fillStyle = isIE ? '#2244aa' : '#aa4422';
    ctx.fillRect(tank.x - TANK_W / 2, tank.y - TANK_H / 2, TANK_W, TANK_H);

    // Highlights
    ctx.fillStyle = isIE ? '#4466cc' : '#cc6644';
    ctx.fillRect(tank.x - TANK_W / 2, tank.y - TANK_H / 2, TANK_W, 3);

    // Barrel
    const barRad = (tank.angle * Math.PI) / 180;
    ctx.strokeStyle = isIE ? '#6688ee' : '#ee8866';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(tank.x, tank.y);
    ctx.lineTo(
      tank.x + Math.cos(barRad) * BARREL_L,
      tank.y + Math.sin(barRad) * BARREL_L
    );
    ctx.stroke();

    // Label
    ctx.fillStyle   = '#fff';
    ctx.font        = 'bold 8px Arial';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isIE ? 'e' : 'N', tank.x, tank.y);

    // Current tank indicator (blinking marker)
    if (isCurrent) {
      ctx.strokeStyle = '#ffff44';
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(tank.x - TANK_W / 2 - 2, tank.y - TANK_H / 2 - 2, TANK_W + 4, TANK_H + 4);
      ctx.setLineDash([]);
    }
  });

  // Projectile
  if (projectile) {
    // Trail
    ctx.strokeStyle = 'rgba(255,200,50,0.4)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    if (projectile.trail.length > 1) {
      ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
      projectile.trail.forEach(p => ctx.lineTo(p.x, p.y));
    }
    ctx.stroke();

    // Projectile dot
    ctx.fillStyle = '#ffee44';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Explosions
  explosions.forEach(ex => {
    const progress = ex.age / ex.maxAge;
    const r = ex.radius * Math.sin(progress * Math.PI);
    if (r <= 0) return;
    const eg = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
    eg.addColorStop(0, `rgba(255,255,200,${1 - progress})`);
    eg.addColorStop(0.3, `rgba(255,120,0,${0.9 - progress})`);
    eg.addColorStop(1, `rgba(180,40,0,0)`);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ── GAME ENGINE ───────────────────────────────────────

let twState = null;
let twAnimId = null;

function twNewGame(playerTeam) {
  cancelAnimationFrame(twAnimId);

  const terrain  = twGenTerrain();
  const tanks    = twPlaceTanks(terrain);
  const wind     = (Math.random() - 0.5) * 6;  // -3 to 3

  // Set initial barrel angles toward center
  tanks.forEach(t => {
    t.angle = t.team === 'ie'
      ? 180 + (Math.random() * 30 - 15)   // roughly left
      : 0   + (Math.random() * 30 - 15);  // roughly right
  });

  twState = {
    terrain,
    tanks,
    projectile:    null,
    explosions:    [],
    wind,
    currentTankIdx: 0,  // start with NN tank 0 (index 5)
    phase:         'aim',
    playerTeam,
    commentary:    '',
    commentaryTimer: 0,
    winner:        null,
    turnQueue:     twBuildTurnQueue(tanks),
    turnQueuePos:  0,
  };
  // First turn goes to NN (index 5)
  twState.currentTankIdx = 5;

  twUpdateScoreboard();
  twUpdateControls();
  twLoop();
}

function twBuildTurnQueue(tanks) {
  // Interleave: NN tank, IE tank, NN tank, IE tank…
  const ie = tanks.filter(t => t.team === 'ie').map((_, i) => i);
  const ns = tanks.filter(t => t.team === 'netscape').map((_, i) => i + 5);
  const q = [];
  const max = Math.max(ie.length, ns.length);
  for (let i = 0; i < max; i++) {
    if (i < ns.length) q.push(ns[i]);
    if (i < ie.length) q.push(ie[i]);
  }
  return q;
}

function twNextAliveTank(state) {
  const { turnQueue, tanks } = state;
  for (let i = 0; i < turnQueue.length * 2; i++) {
    state.turnQueuePos = (state.turnQueuePos + 1) % turnQueue.length;
    const idx = turnQueue[state.turnQueuePos];
    if (tanks[idx] && tanks[idx].alive) {
      state.currentTankIdx = idx;
      return idx;
    }
  }
  return -1; // no living tanks
}

// ── MAIN LOOP ─────────────────────────────────────────

function twLoop() {
  const canvas = document.getElementById('tw-canvas');
  if (!canvas || !twState) return;

  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || TW_W;
  canvas.height = canvas.offsetHeight || TW_H;

  function frame() {
    if (!twState) return;
    twUpdate(twState);
    twDraw(ctx, twState);
    twAnimId = requestAnimationFrame(frame);
  }
  twAnimId = requestAnimationFrame(frame);
}

function twUpdate(state) {
  const { tanks, terrain } = state;

  // Advance explosions
  state.explosions = state.explosions.filter(ex => {
    ex.age++;
    return ex.age < ex.maxAge;
  });

  // Decrement commentary timer
  if (state.commentaryTimer > 0) state.commentaryTimer--;

  if (state.phase === 'projectile' && state.projectile) {
    const p = state.projectile;
    p.vy += GRAVITY;
    p.vx += state.wind * 0.006;
    p.x  += p.vx;
    p.y  += p.vy;

    // Record trail (every 3rd frame)
    if (p.trail.length === 0 || Math.hypot(p.x - p.trail[p.trail.length - 1].x,
                                             p.y - p.trail[p.trail.length - 1].y) > 4) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 30) p.trail.shift();
    }

    // Hit terrain?
    const groundY = twTerrainAt(terrain, p.x);
    if (p.y >= groundY || p.x < 0 || p.x > TW_W || p.y > TW_H) {
      const hitX = Math.round(p.x);
      const hitY = groundY;
      state.explosions.push({ x: hitX, y: hitY, radius: 28, age: 0, maxAge: 30 });
      twCrater(terrain, hitX, 22);
      state.projectile = null;

      // Check tank hits (generous hit radius)
      let anyHit = false;
      tanks.forEach(t => {
        if (!t.alive) return;
        if (Math.hypot(t.x - hitX, t.y - hitY) < 28) {
          t.alive = false;
          anyHit  = true;
          state.explosions.push({ x: t.x, y: t.y, radius: 36, age: 0, maxAge: 40 });
          twSetCommentary(twQuip(TW_COMMENTARY.hit, t.team === 'ie' ? 'IE' : 'NN'));
        }
      });
      if (!anyHit) {
        twSetCommentary(twQuip(TW_COMMENTARY.miss, ''));
      }

      // Sink tanks that are now above a new crater
      tanks.forEach(t => {
        if (!t.alive) return;
        t.y = twTerrainAt(terrain, t.x) - TANK_H / 2;
      });

      // Check win condition
      const ieAlive = tanks.filter(t => t.team === 'ie'      && t.alive).length;
      const nsAlive = tanks.filter(t => t.team === 'netscape' && t.alive).length;

      if (ieAlive === 0 || nsAlive === 0) {
        state.winner = ieAlive === 0 ? 'netscape' : 'ie';
        state.phase  = 'end';
        twUpdateScoreboard();
        setTimeout(() => twShowWinner(state), 1200);
        return;
      }

      twUpdateScoreboard();
      state.phase = 'transition';
      setTimeout(() => {
        state.phase = 'aim';
        const nextIdx = twNextAliveTank(state);
        if (nextIdx < 0) { state.winner = 'draw'; state.phase = 'end'; return; }

        // Mosaic quip occasionally
        if (state.playerTeam === 'mosaic' && Math.random() < 0.25) {
          twSetCommentary(twQuip(TW_COMMENTARY.mosaic_quip, ''));
        }

        twUpdateControls();
        if (!twIsPlayerTurn(state)) {
          setTimeout(() => twAITurn(state), 900);
        }
      }, 400);
    }
  }
}

// ── FIRE ──────────────────────────────────────────────

function twFire() {
  if (!twState || twState.phase !== 'aim') return;
  const tank = twState.tanks[twState.currentTankIdx];
  if (!tank || !tank.alive) return;
  if (!twIsPlayerTurn(twState)) return;

  const angleEl = document.getElementById('tw-angle');
  const powerEl = document.getElementById('tw-power');
  const angle   = Number(angleEl ? angleEl.value : 45);
  const power   = Number(powerEl ? powerEl.value : 50);

  twDoFire(twState, tank, angle, power);
}

function twDoFire(state, tank, angleDeg, power) {
  const rad = (angleDeg * Math.PI) / 180;
  const spd = power * 0.16;
  state.projectile = {
    x: tank.x + Math.cos(rad) * BARREL_L,
    y: tank.y + Math.sin(rad) * BARREL_L,
    vx: Math.cos(rad) * spd,
    vy: Math.sin(rad) * spd,
    trail: [],
  };
  tank.angle = angleDeg;
  state.phase = 'projectile';

  const teamName = tank.team === 'ie' ? 'IE' : 'NN';
  twSetCommentary(twQuip(TW_COMMENTARY.fire, teamName));
  twUpdateControls();
}

// ── AI TURN ───────────────────────────────────────────

function twAITurn(state) {
  if (!state || state.phase !== 'aim') return;
  const tank = state.tanks[state.currentTankIdx];
  if (!tank || !tank.alive) return;

  // Find nearest alive enemy
  const enemies = state.tanks.filter(t => t.alive && t.team !== tank.team);
  if (!enemies.length) return;
  const target = enemies.reduce((best, t) =>
    Math.abs(t.x - tank.x) < Math.abs(best.x - tank.x) ? t : best
  );

  // Ideal angle (no wind, flat terrain approximation)
  const dx = target.x - tank.x;
  const dy = target.y - tank.y;
  const dist = Math.hypot(dx, dy);
  let idealAngle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Randomize: easy mode has large spread
  const spread = 18 + Math.random() * 14;
  idealAngle  += (Math.random() - 0.5) * spread;

  const power = 30 + Math.random() * 55;

  // Animate barrel swing
  const startAngle = tank.angle;
  const endAngle   = idealAngle;
  const steps      = 15;
  let step = 0;
  const swing = setInterval(() => {
    if (!state || state.phase !== 'aim') { clearInterval(swing); return; }
    step++;
    tank.angle = startAngle + (endAngle - startAngle) * (step / steps);
    if (step >= steps) {
      clearInterval(swing);
      twDoFire(state, tank, endAngle, power);
    }
  }, 40);
}

// ── HELPERS ───────────────────────────────────────────

function twIsPlayerTurn(state) {
  if (!state) return false;
  if (state.playerTeam === 'mosaic' || state.playerTeam === null) return false;
  const tank = state.tanks[state.currentTankIdx];
  return tank && tank.team === state.playerTeam;
}

function twSetCommentary(text) {
  if (!twState) return;
  twState.commentary = text;
  twState.commentaryTimer = 120;
  const el = document.getElementById('tw-commentary');
  if (el) el.textContent = text;
}

function twUpdateScoreboard() {
  if (!twState) return;
  const ieCount = twState.tanks.filter(t => t.team === 'ie'      && t.alive).length;
  const nsCount = twState.tanks.filter(t => t.team === 'netscape' && t.alive).length;
  const ieEl = document.getElementById('tw-score-ie');
  const nsEl = document.getElementById('tw-score-ns');
  const wdEl = document.getElementById('tw-wind-disp');
  if (ieEl) ieEl.textContent = '🔵 IE ×' + ieCount;
  if (nsEl) nsEl.textContent = '🔴 NN ×' + nsCount;
  if (wdEl) {
    const w = twState.wind;
    const dir = w > 0 ? '→' : w < 0 ? '←' : '·';
    wdEl.textContent = 'WIND: ' + dir + ' ' + Math.abs(w).toFixed(1);
  }
}

function twUpdateControls() {
  if (!twState) return;
  const isPlayer = twIsPlayerTurn(twState);
  const turnEl = document.getElementById('tw-turn-label');
  const fireBtn = document.getElementById('tw-fire-btn');
  const ctrlArea = document.getElementById('tw-ctrl-area');
  const watchArea = document.getElementById('tw-watch-area');

  if (turnEl) {
    if (twState.phase === 'end') {
      turnEl.textContent = '';
    } else {
      const tank = twState.tanks[twState.currentTankIdx];
      const who = tank ? (tank.team === 'ie' ? 'IE' : 'NN') + ' Tank' : '---';
      const yours = isPlayer ? ' ← YOUR TURN' : (twState.playerTeam === 'mosaic' ? '' : ' (AI)');
      turnEl.textContent = who + yours;
    }
  }

  if (fireBtn) fireBtn.disabled = !isPlayer || twState.phase !== 'aim';

  if (ctrlArea)  ctrlArea.style.display  = (twState.playerTeam !== 'mosaic') ? 'flex' : 'none';
  if (watchArea) watchArea.style.display = (twState.playerTeam === 'mosaic') ? 'flex' : 'none';
}

function twShowWinner(state) {
  const overlay = document.getElementById('tw-win-overlay');
  const title   = document.getElementById('tw-win-title');
  const sub     = document.getElementById('tw-win-sub');
  if (!overlay || !title || !sub) return;

  const pool = state.winner === 'ie' ? TW_COMMENTARY.ie_win : TW_COMMENTARY.ns_win;
  const msg  = pool[Math.floor(Math.random() * pool.length)];
  const [headline, ...rest] = msg.split('\n');
  title.textContent = headline;
  sub.textContent   = rest.join(' ');
  overlay.style.display = 'flex';
}

function twPlayAgain() {
  const overlay = document.getElementById('tw-win-overlay');
  if (overlay) overlay.style.display = 'none';
  const playerTeam = twState ? twState.playerTeam : 'mosaic';
  twNewGame(playerTeam);
}

// ── ANGLE/POWER INPUTS ────────────────────────────────

function twAngleChange(val) {
  const el = document.getElementById('tw-angle-val');
  if (el) el.textContent = val + '°';
  if (twState) {
    const tank = twState.tanks[twState.currentTankIdx];
    if (tank) tank.angle = Number(val);
  }
}

function twPowerChange(val) {
  const el = document.getElementById('tw-power-val');
  if (el) el.textContent = val;
}

// ── ENTRY POINT (called from browser war modal) ───────

function startBrowserWar(side) {
  // Hide modal
  const modal = document.getElementById('browser-war-modal');
  if (modal) modal.style.display = 'none';

  // Open tank wars window
  if (typeof openWindow === 'function') openWindow('tankwars');

  // Give DOM a moment to render
  setTimeout(() => {
    const canvas = document.getElementById('tw-canvas');
    if (canvas) {
      canvas.width  = canvas.offsetWidth  || TW_W;
      canvas.height = canvas.offsetHeight || TW_H;
    }
    twNewGame(side);
    // If watch mode or AI goes first, start AI
    if (side === 'mosaic' || !['ie','netscape'].includes(side)) {
      setTimeout(() => twAITurn(twState), 800);
    } else if (twState && !twIsPlayerTurn(twState)) {
      setTimeout(() => twAITurn(twState), 800);
    }
  }, 200);
}
