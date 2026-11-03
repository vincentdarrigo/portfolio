/* ═══════════════════════════════════════════════════════
   snake.js — Nokia 3310 Snake
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const SNK_COLS = 20, SNK_ROWS = 16, SNK_CELL = 10;

const SNK_CLR = {
  bg:    '#8bac0f',
  grid:  '#9bbc0f',
  snake: '#0f380f',
  body:  '#306230',
  food:  '#0f380f',
  text:  '#0f380f',
};

let snk = {
  snake:   [],
  dir:     { dx: 1, dy: 0 },
  nextDir: { dx: 1, dy: 0 },
  food:    { x: 10, y: 8 },
  score:   0,
  hiScore: 0,
  level:   1,
  speed:   200,
  status:  'idle', // idle | playing | paused | dead
  timer:   null,
};

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-snake');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !win.dataset.snakeInit) {
      win.dataset.snakeInit = '1';
      initSnake();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });

  document.addEventListener('keydown', handleSnakeKey);
});

function initSnake() {
  clearInterval(snk.timer);
  snk.snake   = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];
  snk.dir     = { dx: 1, dy: 0 };
  snk.nextDir = { dx: 1, dy: 0 };
  snk.score   = 0;
  snk.level   = 1;
  snk.speed   = 200;
  snk.status  = 'idle';
  snk.timer   = null;
  placeSnakeFood();
  drawSnakeTitle();
}

// ── TITLE SCREEN ──────────────────────────────────────

function drawSnakeTitle() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = SNK_CLR.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = SNK_CLR.text;
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SNAKE', W / 2, H / 2 - 18);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Hi: ' + snk.hiScore, W / 2, H / 2 + 2);
  ctx.fillText('Press OK to start', W / 2, H / 2 + 18);
  ctx.textAlign = 'left';
  updateSnakeHUD();
}

// ── GAME LOOP ─────────────────────────────────────────

function startOrRestartSnake() {
  clearInterval(snk.timer);
  snk.snake   = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];
  snk.dir     = { dx: 1, dy: 0 };
  snk.nextDir = { dx: 1, dy: 0 };
  snk.score   = 0;
  snk.level   = 1;
  snk.speed   = 200;
  snk.status  = 'playing';
  placeSnakeFood();
  snk.timer = setInterval(snakeTick, snk.speed);
  renderSnake();
}

function snakeTick() {
  if (snk.status !== 'playing') return;

  snk.dir = snk.nextDir;
  const head = snk.snake[0];
  const newHead = {
    x: (head.x + snk.dir.dx + SNK_COLS) % SNK_COLS,
    y: (head.y + snk.dir.dy + SNK_ROWS) % SNK_ROWS,
  };

  if (snk.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
    snakeDie(); return;
  }

  snk.snake.unshift(newHead);

  if (newHead.x === snk.food.x && newHead.y === snk.food.y) {
    snk.score += 10 * snk.level;
    if (snk.score >= snk.level * 50) {
      snk.level = Math.min(9, snk.level + 1);
      snk.speed = Math.max(60, 200 - (snk.level - 1) * 16);
      clearInterval(snk.timer);
      snk.timer = setInterval(snakeTick, snk.speed);
    }
    placeSnakeFood();
    snkPlayBeep();
  } else {
    snk.snake.pop();
  }

  renderSnake();
}

function snakeDie() {
  clearInterval(snk.timer);
  snk.status = 'dead';
  if (snk.score > snk.hiScore) snk.hiScore = snk.score;
  renderSnake();
  updateSnakeHUD();

  setTimeout(() => {
    snkPlayNokiaRing();
    const overlay = document.getElementById('nokia-call-overlay');
    if (overlay) overlay.style.display = 'flex';
  }, 300);
}

function snkPlayBeep() {
  const a = document.getElementById('snd-snake-beep');
  if (a) { a.currentTime = 0; a.play().catch(() => {}); }
}

function snkPlayNokiaRing() {
  const a = document.getElementById('snd-nokia-ring');
  if (a) { a.loop = true; a.currentTime = 0; a.play().catch(() => {}); }
}

function dismissNokiaCall(answer) {
  const ring = document.getElementById('snd-nokia-ring');
  if (ring) { ring.pause(); ring.currentTime = 0; }
  const overlay = document.getElementById('nokia-call-overlay');
  if (overlay) overlay.style.display = 'none';
  if (answer) {
    if (typeof openWindow === 'function') openWindow('resume');
  } else {
    startOrRestartSnake();
  }
}

function placeSnakeFood() {
  let food;
  do {
    food = { x: Math.floor(Math.random() * SNK_COLS), y: Math.floor(Math.random() * SNK_ROWS) };
  } while (snk.snake.some(s => s.x === food.x && s.y === food.y));
  snk.food = food;
}

// ── RENDER ────────────────────────────────────────────

function renderSnake() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const C = SNK_CELL, W = canvas.width, H = canvas.height;

  ctx.fillStyle = SNK_CLR.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = SNK_CLR.grid;
  ctx.lineWidth = 0.4;
  for (let x = 0; x <= SNK_COLS; x++) { ctx.beginPath(); ctx.moveTo(x * C, 0); ctx.lineTo(x * C, H); ctx.stroke(); }
  for (let y = 0; y <= SNK_ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * C); ctx.lineTo(W, y * C); ctx.stroke(); }

  // Food (blinking square)
  ctx.fillStyle = SNK_CLR.food;
  ctx.fillRect(snk.food.x * C + 2, snk.food.y * C + 2, C - 4, C - 4);
  ctx.fillStyle = SNK_CLR.bg;
  ctx.fillRect(snk.food.x * C + 4, snk.food.y * C + 4, C - 8, C - 8);

  // Snake
  snk.snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? SNK_CLR.snake : SNK_CLR.body;
    ctx.fillRect(seg.x * C + 1, seg.y * C + 1, C - 2, C - 2);
    if (i === 0) {
      // Eyes on head
      const ex1 = snk.dir.dy !== 0 ? seg.x * C + 2 : (snk.dir.dx > 0 ? seg.x * C + C - 4 : seg.x * C + 2);
      const ey1 = snk.dir.dx !== 0 ? seg.y * C + 2 : (snk.dir.dy > 0 ? seg.y * C + C - 4 : seg.y * C + 2);
      ctx.fillStyle = SNK_CLR.bg;
      ctx.fillRect(ex1, ey1, 2, 2);
      ctx.fillRect(ex1 + (snk.dir.dy !== 0 ? 4 : 0), ey1 + (snk.dir.dx !== 0 ? 4 : 0), 2, 2);
    }
  });

  updateSnakeHUD();
}

function updateSnakeHUD() {
  const sc = document.getElementById('snake-score');
  const lv = document.getElementById('snake-level');
  if (sc) sc.textContent = snk.score;
  if (lv) lv.textContent = snk.level;
}

// ── INPUT ─────────────────────────────────────────────

function setSnakeDir(dir) {
  const map = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
  const [dx, dy] = map[dir];
  if (snk.dir.dx === -dx && snk.dir.dy === -dy) return; // no 180
  snk.nextDir = { dx, dy };
  if (snk.status === 'idle' || snk.status === 'dead') startOrRestartSnake();
}

function handleSnakeKey(e) {
  if (document.getElementById('window-snake')?.style.display !== 'block') return;

  const keyDir = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
  };

  if (keyDir[e.key]) {
    setSnakeDir(keyDir[e.key]);
    if (e.key.startsWith('Arrow')) e.preventDefault();
    return;
  }

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (snk.status === 'idle' || snk.status === 'dead') {
      const ring = document.getElementById('snd-nokia-ring');
      if (ring) { ring.pause(); ring.currentTime = 0; }
      const overlay = document.getElementById('nokia-call-overlay');
      if (overlay) overlay.style.display = 'none';
      startOrRestartSnake(); return;
    }
    if (snk.status === 'playing') { snk.status = 'paused'; clearInterval(snk.timer); renderSnake(); return; }
    if (snk.status === 'paused')  { snk.status = 'playing'; snk.timer = setInterval(snakeTick, snk.speed); return; }
  }
}
