/* ═══════════════════════════════════════════════════════
   tetris.js — Gameboy Tetris
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const TET_COLS = 10, TET_ROWS = 20, TET_CELL = 9;
const TET_BW = TET_COLS * TET_CELL; // 90
const TET_BH = TET_ROWS * TET_CELL; // 180
const TET_PW = 45; // side panel width
const TET_CW = TET_BW + TET_PW; // total canvas width: 135
const TET_CH = TET_BH;           // total canvas height: 180

const GB = {
  bg:    '#9bbc0f',
  light: '#8bac0f',
  mid:   '#306230',
  dark:  '#0f380f',
  white: '#e0f8d0',
};

// 7 standard tetrominoes
const TET_PIECES = [
  [[0,0],[1,0],[2,0],[3,0]], // I
  [[0,0],[1,0],[0,1],[1,1]], // O
  [[1,0],[0,1],[1,1],[2,1]], // T
  [[1,0],[2,0],[0,1],[1,1]], // S
  [[0,0],[1,0],[1,1],[2,1]], // Z
  [[0,0],[0,1],[1,1],[2,1]], // J
  [[2,0],[0,1],[1,1],[2,1]], // L
];

let tetBoard, tetCurrent, tetNext;
let tetScore, tetLevel, tetLines;
let tetStatus; // idle | playing | paused | gameover
let tetTimer;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-tetris');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !win.dataset.tetInit) {
      win.dataset.tetInit = '1';
      initTetris();
    }
    if (win.style.display !== 'block') {
      tetStopMusic();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });

  document.addEventListener('keydown', handleTetrisKey);
});

function tetPlayMusic() {
  const a = document.getElementById('snd-tetris-music');
  if (a) { a.loop = true; a.currentTime = 0; a.play().catch(() => {}); }
}

function tetStopMusic() {
  const a = document.getElementById('snd-tetris-music');
  if (a) { a.pause(); a.currentTime = 0; }
}

function initTetris() {
  clearInterval(tetTimer);
  tetStopMusic();
  tetBoard  = Array.from({ length: TET_ROWS }, () => Array(TET_COLS).fill(0));
  tetScore  = 0; tetLevel = 1; tetLines = 0;
  tetStatus = 'idle';
  tetTimer  = null;
  tetNext   = spawnPiece();
  tetCurrent = null;
  renderTetris();
  drawTetTitle();
}

function drawTetTitle() {
  const ctx = getTetCtx(); if (!ctx) return;
  ctx.fillStyle = GB.bg;
  ctx.fillRect(0, 0, TET_CW, TET_CH);
  ctx.fillStyle = GB.dark;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TETRIS', TET_BW / 2, TET_CH / 2 - 22);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Press START', TET_BW / 2, TET_CH / 2 + 2);
  ctx.fillText('← → move', TET_BW / 2, TET_CH / 2 + 18);
  ctx.fillText('↑ / A  rotate', TET_BW / 2, TET_CH / 2 + 32);
  ctx.fillText('Space = drop', TET_BW / 2, TET_CH / 2 + 46);
  ctx.textAlign = 'left';
}

// ── SPAWN ─────────────────────────────────────────────

function spawnPiece() {
  const cells = TET_PIECES[Math.floor(Math.random() * TET_PIECES.length)];
  return { cells: cells.map(c => [...c]), x: 3, y: 0 };
}

function startTetris() {
  tetCurrent = { ...tetNext, x: 3, y: 0, cells: tetNext.cells.map(c => [...c]) };
  tetNext = spawnPiece();
  tetStatus = 'playing';
  const speed = tetSpeed();
  tetTimer = setInterval(tetTick, speed);
  tetPlayMusic();
  renderTetris();
}

function tetSpeed() { return Math.max(80, 500 - (tetLevel - 1) * 42); }

// ── TICK ──────────────────────────────────────────────

function tetTick() {
  if (tetStatus !== 'playing') return;
  if (!tetMove(0, 1)) { tetLock(); }
  renderTetris();
}

function tetMove(dx, dy) {
  const nx = tetCurrent.x + dx, ny = tetCurrent.y + dy;
  if (tetCollide(tetCurrent.cells, nx, ny)) return false;
  tetCurrent.x = nx; tetCurrent.y = ny;
  return true;
}

function tetRotate() {
  const maxY = Math.max(...tetCurrent.cells.map(c => c[1]));
  const rotated = tetCurrent.cells.map(([x, y]) => [maxY - y, x]);
  for (const shift of [0, 1, -1, 2, -2]) {
    if (!tetCollide(rotated, tetCurrent.x + shift, tetCurrent.y)) {
      tetCurrent.cells = rotated;
      tetCurrent.x += shift;
      return;
    }
  }
}

function tetHardDrop() {
  while (tetMove(0, 1)) {}
  tetLock();
  renderTetris();
}

function tetCollide(cells, ox, oy) {
  return cells.some(([cx, cy]) => {
    const x = cx + ox, y = cy + oy;
    return x < 0 || x >= TET_COLS || y >= TET_ROWS || (y >= 0 && tetBoard[y][x]);
  });
}

function tetLock() {
  tetCurrent.cells.forEach(([cx, cy]) => {
    const x = cx + tetCurrent.x, y = cy + tetCurrent.y;
    if (y >= 0) tetBoard[y][x] = 1;
  });
  const cleared = clearTetLines();
  if (cleared) {
    const pts = [0, 100, 300, 500, 800];
    tetScore += (pts[cleared] || 800) * tetLevel;
    tetLines += cleared;
    tetLevel  = Math.floor(tetLines / 10) + 1;
    clearInterval(tetTimer);
    tetTimer = setInterval(tetTick, tetSpeed());
  }
  tetCurrent = { ...tetNext, x: 3, y: 0, cells: tetNext.cells.map(c => [...c]) };
  tetNext = spawnPiece();

  if (tetCollide(tetCurrent.cells, tetCurrent.x, tetCurrent.y)) {
    clearInterval(tetTimer);
    tetStatus = 'gameover';
    tetStopMusic();
  }
}

function clearTetLines() {
  let count = 0;
  for (let y = TET_ROWS - 1; y >= 0; y--) {
    if (tetBoard[y].every(c => c)) {
      tetBoard.splice(y, 1);
      tetBoard.unshift(Array(TET_COLS).fill(0));
      count++; y++;
    }
  }
  return count;
}

// ── RENDER ────────────────────────────────────────────

function getTetCtx() {
  const canvas = document.getElementById('tetris-canvas');
  return canvas ? canvas.getContext('2d') : null;
}

function renderTetris() {
  const ctx = getTetCtx(); if (!ctx) return;
  const C = TET_CELL;

  ctx.fillStyle = GB.bg;
  ctx.fillRect(0, 0, TET_CW, TET_CH);

  // Board border
  ctx.strokeStyle = GB.dark;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, TET_BW, TET_BH);

  // Grid lines
  ctx.strokeStyle = GB.light;
  ctx.lineWidth = 0.5;
  for (let x = 1; x < TET_COLS; x++) { ctx.beginPath(); ctx.moveTo(x*C,0); ctx.lineTo(x*C,TET_BH); ctx.stroke(); }
  for (let y = 1; y < TET_ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*C); ctx.lineTo(TET_BW,y*C); ctx.stroke(); }

  // Board cells
  for (let y = 0; y < TET_ROWS; y++) {
    for (let x = 0; x < TET_COLS; x++) {
      if (tetBoard[y][x]) drawTetBlock(ctx, x * C, y * C, C);
    }
  }

  // Ghost piece
  if (tetCurrent && tetStatus === 'playing') {
    let ghostY = tetCurrent.y;
    while (!tetCollide(tetCurrent.cells, tetCurrent.x, ghostY + 1)) ghostY++;
    if (ghostY !== tetCurrent.y) {
      tetCurrent.cells.forEach(([cx, cy]) => {
        const x = cx + tetCurrent.x, y = cy + ghostY;
        if (y >= 0 && y < TET_ROWS) {
          ctx.fillStyle = 'rgba(15,56,15,0.25)';
          ctx.fillRect(x*C+2, y*C+2, C-4, C-4);
        }
      });
    }
  }

  // Current piece
  if (tetCurrent) {
    tetCurrent.cells.forEach(([cx, cy]) => {
      const x = cx + tetCurrent.x, y = cy + tetCurrent.y;
      if (y >= 0 && y < TET_ROWS) drawTetBlock(ctx, x * C, y * C, C);
    });
  }

  // Side panel
  const PX = TET_BW + 4;
  ctx.fillStyle = GB.dark;

  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('SCORE', PX, 14);
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText(String(tetScore).padStart(7,'0'), PX, 26);

  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('LEVEL', PX, 48);
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(String(tetLevel), PX, 62);

  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('LINES', PX, 84);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(String(tetLines).padStart(4,'0'), PX, 97);

  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('NEXT', PX, 120);
  if (tetNext) {
    const NC = 10;
    ctx.fillStyle = GB.bg;
    ctx.fillRect(PX - 2, 124, TET_PW - 4, 52);
    tetNext.cells.forEach(([cx, cy]) => {
      drawTetBlock(ctx, PX + cx * NC, 126 + cy * NC, NC);
    });
  }

  // Status overlay
  if (tetStatus === 'gameover') {
    ctx.fillStyle = 'rgba(15,56,15,0.82)';
    ctx.fillRect(0, TET_CH/2 - 44, TET_BW, 90);
    ctx.fillStyle = GB.bg;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', TET_BW/2, TET_CH/2 - 18);
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('Score: ' + tetScore, TET_BW/2, TET_CH/2 - 2);
    ctx.fillText('Level: ' + tetLevel, TET_BW/2, TET_CH/2 + 12);
    ctx.fillText('Press START', TET_BW/2, TET_CH/2 + 30);
    ctx.textAlign = 'left';
  }

  if (tetStatus === 'paused') {
    ctx.fillStyle = 'rgba(15,56,15,0.7)';
    ctx.fillRect(0, TET_CH/2 - 24, TET_BW, 48);
    ctx.fillStyle = GB.bg;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', TET_BW/2, TET_CH/2 + 4);
    ctx.textAlign = 'left';
  }
}

function drawTetBlock(ctx, px, py, size) {
  ctx.fillStyle = GB.mid;
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
  ctx.fillStyle = GB.dark;
  ctx.fillRect(px + 1, py + 1, size - 2, 2);
  ctx.fillRect(px + 1, py + 1, 2, size - 2);
  ctx.fillStyle = GB.white;
  ctx.fillRect(px + size - 3, py + 1, 2, size - 2);
  ctx.fillRect(px + 1, py + size - 3, size - 2, 2);
}

// ── INPUT ─────────────────────────────────────────────

function handleTetrisKey(e) {
  if (document.getElementById('window-tetris')?.style.display !== 'block') return;

  if (tetStatus === 'idle' || tetStatus === 'gameover') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); initTetris(); startTetris(); return; }
  }

  if (tetStatus !== 'playing' && tetStatus !== 'paused') return;

  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    if (tetStatus === 'playing') { tetStatus = 'paused'; clearInterval(tetTimer); }
    else { tetStatus = 'playing'; tetTimer = setInterval(tetTick, tetSpeed()); }
    renderTetris(); return;
  }

  if (tetStatus !== 'playing') return;

  switch (e.key) {
    case 'ArrowLeft':  tetMove(-1, 0); break;
    case 'ArrowRight': tetMove(1, 0);  break;
    case 'ArrowDown':  tetMove(0, 1);  break;
    case 'ArrowUp':    tetRotate();    break;
    case ' ':          tetHardDrop(); return;
    case 'z': case 'Z': case 'a': case 'A': tetRotate(); break;
    default: return;
  }

  if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
  renderTetris();
}

// ── BUTTON HANDLERS (on-screen) ───────────────────────

function tetBtn(action) {
  switch (action) {
    case 'left':   if (tetStatus === 'playing') { tetMove(-1,0); renderTetris(); } break;
    case 'right':  if (tetStatus === 'playing') { tetMove(1,0);  renderTetris(); } break;
    case 'down':   if (tetStatus === 'playing') { tetMove(0,1);  renderTetris(); } break;
    case 'rotate': if (tetStatus === 'playing') { tetRotate();   renderTetris(); } break;
    case 'drop':   if (tetStatus === 'playing') { tetHardDrop(); } break;
    case 'start':
      if (tetStatus === 'idle' || tetStatus === 'gameover') { initTetris(); startTetris(); }
      else if (tetStatus === 'playing') { tetStatus = 'paused'; clearInterval(tetTimer); renderTetris(); }
      else if (tetStatus === 'paused')  { tetStatus = 'playing'; tetTimer = setInterval(tetTick, tetSpeed()); }
      break;
  }
}
