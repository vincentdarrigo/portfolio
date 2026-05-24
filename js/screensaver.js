/* ═══════════════════════════════════════════════════════
   screensaver.js — Classic Screensaver Effects
   Vince Darrigo / The Mothership

   Effects: Starfield · Matrix Rain · Mystify · Pipes · 3D Cubes · Bounce
   Usage: launchScreensaver('starfield'|'matrix'|'mystify'|'pipes'|'cubes3d'|'bounce'|'random')
   Exit: click, keydown, or mousemove
   Auto-cycles every 45 seconds
═══════════════════════════════════════════════════════ */

const SS_CYCLE_EFFECTS  = ['starfield', 'matrix', 'mystify', 'pipes', 'cubes3d', 'bounce'];
const SS_NOSTALGIA_EFFECTS = ['starfield', 'matrix', 'mystify', 'pipes', 'cubes3d'];
let ssLastWasBounce = false;
let ssCanvas, ssCtx, ssAnimId, ssRunning = false;
let ssCycleTimer = null, ssCycleIdx = 0;

// ── LAUNCH / EXIT ─────────────────────────────────────

function launchScreensaver(type) {
  const overlay = document.getElementById('screensaver-overlay');
  if (!overlay) return;

  if (type === 'random' || !type) {
    if (!ssLastWasBounce) {
      type = 'bounce';
    } else {
      type = SS_NOSTALGIA_EFFECTS[Math.floor(Math.random() * SS_NOSTALGIA_EFFECTS.length)];
    }
    ssLastWasBounce = (type === 'bounce');
  }

  ssCycleIdx = SS_CYCLE_EFFECTS.indexOf(type);
  if (ssCycleIdx < 0) ssCycleIdx = 0;

  exitScreensaver(false);

  ssCanvas        = document.getElementById('screensaver-canvas');
  ssCanvas.width  = window.innerWidth;
  ssCanvas.height = window.innerHeight;
  ssCtx           = ssCanvas.getContext('2d');
  ssRunning       = true;

  overlay.style.display = 'block';

  const hint = document.getElementById('ss-exit-hint');
  if (hint) {
    hint.style.animation = 'none';
    hint.style.opacity   = '1';
    void hint.offsetWidth;
    hint.style.animation = 'fade-hint 3s ease forwards';
  }

  const effects = { starfield, matrix, mystify, pipes, cubes3d, bounce };
  (effects[type] || effects.starfield)();

  // Auto-cycle to next effect every 45 seconds
  if (ssCycleTimer) clearInterval(ssCycleTimer);
  ssCycleTimer = setInterval(() => {
    if (!ssRunning) { clearInterval(ssCycleTimer); ssCycleTimer = null; return; }
    // Alternate: bounce then nostalgia then bounce...
    let nextFx;
    if (!ssLastWasBounce) {
      nextFx = 'bounce';
    } else {
      nextFx = SS_NOSTALGIA_EFFECTS[Math.floor(Math.random() * SS_NOSTALGIA_EFFECTS.length)];
    }
    ssLastWasBounce = (nextFx === 'bounce');
    ssCycleIdx = SS_CYCLE_EFFECTS.indexOf(nextFx);
    if (ssCycleIdx < 0) ssCycleIdx = 0;
    cancelAnimationFrame(ssAnimId);
    ssCtx.clearRect(0, 0, ssCanvas.width, ssCanvas.height);
    const fx = { starfield, matrix, mystify, pipes, cubes3d, bounce };
    (fx[nextFx] || fx.starfield)();
  }, 45000);

  setTimeout(() => {
    overlay.addEventListener('click',      onSsExit,     { once: true });
    document.addEventListener('keydown',   onSsExit,     { once: true });
    document.addEventListener('mousemove', throttleExit, { once: true });
  }, 300);
}

function onSsExit()      { exitScreensaver(true); }
function throttleExit()  { setTimeout(() => exitScreensaver(true), 100); }

function exitScreensaver(cleanup) {
  ssRunning = false;
  cancelAnimationFrame(ssAnimId);
  if (ssCycleTimer) { clearInterval(ssCycleTimer); ssCycleTimer = null; }
  if (cleanup !== false) {
    const overlay = document.getElementById('screensaver-overlay');
    if (overlay) overlay.style.display = 'none';
    document.removeEventListener('keydown',   onSsExit);
    document.removeEventListener('mousemove', throttleExit);
  }
}

// ═══════════════════════════════════════════════════════
// STARFIELD — fly through the stars
// ═══════════════════════════════════════════════════════

function starfield() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const STARS = 300;

  const stars = Array.from({ length: STARS }, () => ({
    x: (Math.random() - 0.5) * W,
    y: (Math.random() - 0.5) * H,
    z: Math.random() * W,
    pz: 0,
  }));

  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, W, H);

  function frame() {
    if (!ssRunning) return;

    ssCtx.fillStyle = 'rgba(0,0,0,0.25)';
    ssCtx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;

    stars.forEach(s => {
      s.pz = s.z;
      s.z -= 5;
      if (s.z <= 0) {
        s.x  = (Math.random() - 0.5) * W;
        s.y  = (Math.random() - 0.5) * H;
        s.z  = W;
        s.pz = W;
      }

      const sx = (s.x / s.z) * W  + cx;
      const sy = (s.y / s.z) * H  + cy;
      const px = (s.x / s.pz) * W + cx;
      const py = (s.y / s.pz) * H + cy;

      const bright = Math.floor((1 - s.z / W) * 255);
      const size   = Math.max(0.3, (1 - s.z / W) * 2.5);

      ssCtx.strokeStyle = `rgb(${bright},${bright},${bright})`;
      ssCtx.lineWidth   = size;
      ssCtx.beginPath();
      ssCtx.moveTo(px, py);
      ssCtx.lineTo(sx, sy);
      ssCtx.stroke();
    });

    ssAnimId = requestAnimationFrame(frame);
  }

  frame();
}

// ═══════════════════════════════════════════════════════
// MATRIX RAIN — green Katakana cascade
// ═══════════════════════════════════════════════════════

function matrix() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const FONT_SIZE = 14;
  const COLS = Math.floor(W / FONT_SIZE);
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF!@#$%^&*';

  const drops = Array(COLS).fill(0).map(() => Math.floor(Math.random() * -H / FONT_SIZE));

  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, W, H);

  function frame() {
    if (!ssRunning) return;

    ssCtx.fillStyle = 'rgba(0,0,0,0.05)';
    ssCtx.fillRect(0, 0, W, H);

    ssCtx.font = `${FONT_SIZE}px "Courier New", monospace`;

    drops.forEach((y, i) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x    = i * FONT_SIZE;
      const yPx  = y * FONT_SIZE;

      // Head character is bright white
      ssCtx.fillStyle = '#ffffff';
      ssCtx.fillText(char, x, yPx);

      // Trail is green
      ssCtx.fillStyle = '#00cc00';
      if (y > 1) {
        const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ssCtx.fillText(trailChar, x, yPx - FONT_SIZE);
      }

      if (yPx > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });

    ssAnimId = requestAnimationFrame(frame);
  }

  frame();
}

// ═══════════════════════════════════════════════════════
// MYSTIFY — bouncing neon polygons (Win95 Mystify screensaver)
// ═══════════════════════════════════════════════════════

function mystify() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const NUM_POLYS    = 2;
  const POINTS_EACH  = 4;
  const TRAIL_LENGTH = 10;

  function makePolygon(hue) {
    return {
      hue,
      history: [],
      points: Array.from({ length: POINTS_EACH }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
      })),
    };
  }

  const polys = Array.from({ length: NUM_POLYS }, (_, i) => makePolygon(i * 180));

  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, W, H);

  function frame() {
    if (!ssRunning) return;

    ssCtx.fillStyle = 'rgba(0,0,0,0.15)';
    ssCtx.fillRect(0, 0, W, H);

    polys.forEach(poly => {
      // Snapshot current positions into history
      poly.history.push(poly.points.map(p => ({ x: p.x, y: p.y })));
      if (poly.history.length > TRAIL_LENGTH) poly.history.shift();

      // Draw trail (older = more transparent)
      poly.history.forEach((pts, hi) => {
        const alpha = (hi + 1) / TRAIL_LENGTH;
        const hue   = (poly.hue + hi * 3) % 360;
        ssCtx.strokeStyle = `hsla(${hue},100%,60%,${alpha})`;
        ssCtx.lineWidth   = 1.5;
        ssCtx.beginPath();
        pts.forEach((p, i) => i === 0 ? ssCtx.moveTo(p.x, p.y) : ssCtx.lineTo(p.x, p.y));
        ssCtx.closePath();
        ssCtx.stroke();
      });

      // Advance points
      poly.points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= W) p.vx *= -1;
        if (p.y <= 0 || p.y >= H) p.vy *= -1;
      });

      poly.hue = (poly.hue + 0.8) % 360;
    });

    ssAnimId = requestAnimationFrame(frame);
  }

  frame();
}

// ═══════════════════════════════════════════════════════
// PIPES — classic Windows 3D Pipes screensaver
// ═══════════════════════════════════════════════════════

function pipes() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const CELL = 22, PW = 10;
  const COLS = Math.floor(W / CELL);
  const ROWS = Math.floor(H / CELL);
  const COLORS = ['#ff3333','#33ff33','#3399ff','#ffff33','#ff33ff','#33ffff','#ff8800','#cc44ff'];
  const occupied = new Uint8Array(COLS * ROWS);

  function newPipe() {
    let x, y, tries = 0;
    do { x = Math.floor(Math.random() * COLS); y = Math.floor(Math.random() * ROWS); tries++; }
    while (occupied[y * COLS + x] && tries < 200);
    const dirs = [[0,-1],[0,1],[1,0],[-1,0]];
    const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
    return { x, y, px: x, py: y, dx, dy, color: COLORS[Math.floor(Math.random() * COLORS.length)], steps: 0 };
  }

  const NUM_PIPES = 5;
  const activePipes = Array.from({ length: NUM_PIPES }, newPipe);

  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, W, H);

  function drawSeg(cx1, cy1, cx2, cy2, color) {
    const x1 = cx1 * CELL + CELL / 2, y1 = cy1 * CELL + CELL / 2;
    const x2 = cx2 * CELL + CELL / 2, y2 = cy2 * CELL + CELL / 2;
    ssCtx.strokeStyle = color;
    ssCtx.lineWidth = PW;
    ssCtx.lineCap = 'round';
    ssCtx.beginPath();
    ssCtx.moveTo(x1, y1);
    ssCtx.lineTo(x2, y2);
    ssCtx.stroke();
    ssCtx.fillStyle = color;
    ssCtx.beginPath();
    ssCtx.arc(x2, y2, PW * 0.65, 0, Math.PI * 2);
    ssCtx.fill();
  }

  function frame() {
    if (!ssRunning) return;
    activePipes.forEach(p => {
      drawSeg(p.px, p.py, p.x, p.y, p.color);
      occupied[p.y * COLS + p.x] = 1;
      p.px = p.x; p.py = p.y;

      if (Math.random() < 0.12) {
        const dirs = [[0,-1],[0,1],[1,0],[-1,0]].filter(d => !(d[0] === -p.dx && d[1] === -p.dy));
        [p.dx, p.dy] = dirs[Math.floor(Math.random() * dirs.length)];
      }

      const nx = p.x + p.dx, ny = p.y + p.dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || (p.steps > 4 && occupied[ny * COLS + nx])) {
        Object.assign(p, newPipe()); return;
      }
      p.x = nx; p.y = ny; p.steps++;
    });

    const fill = occupied.reduce((s, v) => s + v, 0) / (COLS * ROWS);
    if (fill > 0.78) {
      ssCtx.fillStyle = '#000';
      ssCtx.fillRect(0, 0, W, H);
      occupied.fill(0);
      activePipes.forEach((p, i) => Object.assign(p, newPipe()));
    }

    setTimeout(() => { ssAnimId = requestAnimationFrame(frame); }, 55);
  }

  frame();
}

// ═══════════════════════════════════════════════════════
// CUBES3D — spinning neon wireframe cubes
// ═══════════════════════════════════════════════════════

function cubes3d() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const NUM_CUBES = 4;

  const VERTS = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

  function rX(v, a) { return [v[0], v[1]*Math.cos(a)-v[2]*Math.sin(a), v[1]*Math.sin(a)+v[2]*Math.cos(a)]; }
  function rY(v, a) { return [v[0]*Math.cos(a)+v[2]*Math.sin(a), v[1], -v[0]*Math.sin(a)+v[2]*Math.cos(a)]; }
  function rZ(v, a) { return [v[0]*Math.cos(a)-v[1]*Math.sin(a), v[0]*Math.sin(a)+v[1]*Math.cos(a), v[2]]; }
  function proj(v, cx, cy, s) { const fov = 5, z = v[2] + fov; return [cx + (v[0]/z)*s*fov, cy + (v[1]/z)*s*fov]; }

  function makeCube() {
    const s = 50 + Math.random() * 80;
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random()-0.5)*2.5, vy: (Math.random()-0.5)*2.5,
      size: s, rx: Math.random()*Math.PI*2, ry: Math.random()*Math.PI*2, rz: Math.random()*Math.PI*2,
      drx: (Math.random()-0.5)*0.03, dry: (Math.random()-0.5)*0.035, drz: (Math.random()-0.5)*0.02,
      hue: Math.random()*360,
    };
  }

  const cubes = Array.from({ length: NUM_CUBES }, makeCube);

  ssCtx.fillStyle = '#000';
  ssCtx.fillRect(0, 0, W, H);

  function frame() {
    if (!ssRunning) return;
    ssCtx.fillStyle = 'rgba(0,0,0,0.18)';
    ssCtx.fillRect(0, 0, W, H);

    cubes.forEach(c => {
      c.rx += c.drx; c.ry += c.dry; c.rz += c.drz;
      c.hue = (c.hue + 0.6) % 360;
      c.x += c.vx; c.y += c.vy;
      if (c.x < -c.size || c.x > W + c.size) c.vx *= -1;
      if (c.y < -c.size || c.y > H + c.size) c.vy *= -1;
      c.x = Math.max(-c.size, Math.min(W + c.size, c.x));
      c.y = Math.max(-c.size, Math.min(H + c.size, c.y));

      const pts = VERTS.map(v => proj(rZ(rY(rX(v, c.rx), c.ry), c.rz), c.x, c.y, c.size));
      ssCtx.strokeStyle = `hsl(${c.hue},100%,62%)`;
      ssCtx.lineWidth = 2;
      EDGES.forEach(([a, b]) => {
        ssCtx.beginPath();
        ssCtx.moveTo(pts[a][0], pts[a][1]);
        ssCtx.lineTo(pts[b][0], pts[b][1]);
        ssCtx.stroke();
      });
    });

    ssAnimId = requestAnimationFrame(frame);
  }

  frame();
}

// ═══════════════════════════════════════════════════════
// BOUNCE — 3D rotating block text, single Easter egg message
// ═══════════════════════════════════════════════════════

function bounce() {
  const W = ssCanvas.width, H = ssCanvas.height;
  const LINE1 = "What's in the locked folder?";
  const LINE2 = "Interview Vince to find out! 🔒";

  const PALETTE = [
    ['#ff4444','#7a1010'],['#44ff44','#107a10'],['#4488ff','#102060'],
    ['#ffff44','#7a7a10'],['#ff44ff','#7a107a'],['#44ffff','#107a7a'],
    ['#ff8844','#7a3a10'],
  ];
  let pi = Math.floor(Math.random() * PALETTE.length);

  // Responsive font size — keep both lines visible
  const FS = Math.max(20, Math.min(42, Math.floor(W / 22)));
  ssCtx.font = `bold ${FS}px Impact,"Arial Black",Arial,sans-serif`;
  const tw1 = ssCtx.measureText(LINE1).width;
  const tw2 = ssCtx.measureText(LINE2).width;
  const TW  = Math.max(tw1, tw2);
  const TH  = FS * 2.4; // two lines + gap

  let cx = W / 2;
  let cy = H / 2;
  let vx = (Math.random() > 0.5 ? 1 : -1) * 1.1;
  let vy = (Math.random() > 0.5 ? 1 : -1) * 0.9;

  let rotY = Math.random() * Math.PI * 2; // Y-axis rotation → scaleX oscillates
  let rotX = Math.random() * Math.PI * 2; // X-axis tilt     → scaleY oscillates

  function draw3DLines(sX, sY) {
    const [front, shadow] = PALETTE[pi];
    const DEPTH = 7;
    const lineGap = FS * 1.25;

    ssCtx.font = `bold ${FS}px Impact,"Arial Black",Arial,sans-serif`;

    [LINE1, LINE2].forEach((line, li) => {
      const tw = ssCtx.measureText(line).width;
      const ox = -tw / 2;
      const oy = (li - 0.5) * lineGap;

      // Extrusion layers (drawn back-to-front)
      for (let d = DEPTH; d >= 1; d--) {
        const ratio = d / DEPTH;
        // Parse shadow color channels for dimming
        const sr = parseInt(shadow.slice(1,3),16);
        const sg = parseInt(shadow.slice(3,5),16);
        const sb = parseInt(shadow.slice(5,7),16);
        ssCtx.fillStyle = `rgba(${Math.floor(sr*(1-ratio*0.3))},${Math.floor(sg*(1-ratio*0.3))},${Math.floor(sb*(1-ratio*0.3))},0.9)`;
        ssCtx.fillText(line, ox + d * (sX < 0 ? -1 : 1), oy + d * (sY < 0 ? -1 : 1));
      }

      // Front face
      ssCtx.fillStyle = front;
      ssCtx.fillText(line, ox, oy);
    });
  }

  function frame() {
    if (!ssRunning) return;

    ssCtx.fillStyle = '#000';
    ssCtx.fillRect(0, 0, W, H);

    rotY += 0.028;
    rotX += 0.019;
    const sX = Math.cos(rotY); // Y-axis spin
    const sY = Math.cos(rotX); // X-axis tilt

    ssCtx.save();
    ssCtx.translate(cx, cy);
    ssCtx.scale(sX || 0.001, sY || 0.001);
    draw3DLines(sX, sY);
    ssCtx.restore();

    // Drift + bounce
    cx += vx; cy += vy;
    const pad = TW / 2 + 20;
    const padV = TH / 2 + 10;
    if (cx - pad < 0 || cx + pad > W) {
      vx = -vx;
      cx = Math.max(pad, Math.min(W - pad, cx));
      pi = (pi + 1) % PALETTE.length;
    }
    if (cy - padV < 0 || cy + padV > H) {
      vy = -vy;
      cy = Math.max(padV, Math.min(H - padV, cy));
    }

    ssAnimId = requestAnimationFrame(frame);
  }

  frame();
}
