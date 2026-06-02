/* ═══════════════════════════════════════════════════════
   minesweeper.js — Classic Minesweeper
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const DIFFICULTIES = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
};

const NUM_COLORS = ['', '#0000ff','#008000','#ff0000','#000080','#800000','#008080','#000000','#808080'];

let mineRows, mineCols, mineCount;
let mineBoard     = [];
let mineGameState = 'waiting'; // waiting | playing | won | lost
let mineTimer     = 0;
let mineTimerInt  = null;
let mineRevealed  = 0;
let mineFlagged   = 0;
let mineCurrentDifficulty = 'beginner';

// ── INIT ──────────────────────────────────────────────

function initMinesweeper(difficulty) {
  if (difficulty) mineCurrentDifficulty = difficulty;
  const cfg = DIFFICULTIES[mineCurrentDifficulty] || DIFFICULTIES.beginner;
  mineRows  = cfg.rows;
  mineCols  = cfg.cols;
  mineCount = cfg.mines;

  mineGameState = 'waiting';
  mineTimer     = 0;
  mineRevealed  = 0;
  mineFlagged   = 0;
  clearInterval(mineTimerInt);

  mineBoard = Array.from({ length: mineRows }, () =>
    Array.from({ length: mineCols }, () => ({
      mine: false, revealed: false, flagged: false, question: false,
      count: 0, exploded: false, wrongFlag: false
    }))
  );

  // Resize the board grid CSS
  const boardEl = document.getElementById('mine-board');
  if (boardEl) boardEl.style.gridTemplateColumns = `repeat(${mineCols}, 18px)`;

  renderMineBoard();
  setMineLED(mineCount);
  setTimerLED(0);
  setSmiley('🙂');
  document.getElementById('mine-status').textContent =
    `Left-click to reveal · Right-click to flag · ${mineCount} mines`;
}

function placeMines(safeR, safeC) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * mineRows);
    const c = Math.floor(Math.random() * mineCols);
    if (!mineBoard[r][c].mine && !(r === safeR && c === safeC)) {
      mineBoard[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      if (!mineBoard[r][c].mine) mineBoard[r][c].count = adjMines(r, c);
    }
  }
}

function adjMines(r, c) {
  let n = 0;
  forAdj(r, c, (nr, nc) => { if (mineBoard[nr][nc].mine) n++; });
  return n;
}

function forAdj(r, c, fn) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < mineRows && nc >= 0 && nc < mineCols) fn(nr, nc);
    }
  }
}

// ── CLICK HANDLERS ────────────────────────────────────

function handleMineClick(r, c) {
  if (mineGameState === 'won' || mineGameState === 'lost') return;
  const cell = mineBoard[r][c];
  if (cell.revealed || cell.flagged) return;

  if (mineGameState === 'waiting') {
    mineGameState = 'playing';
    placeMines(r, c);
    mineTimerInt = setInterval(() => {
      mineTimer = Math.min(999, mineTimer + 1);
      setTimerLED(mineTimer);
    }, 1000);
  }

  if (cell.mine) {
    cell.exploded = true;
    endGame(false);
    return;
  }

  revealFlood(r, c);
  checkWin();
  renderMineBoard();
}

function handleMineRight(e, r, c) {
  e.preventDefault();
  if (mineGameState !== 'playing') return;
  const cell = mineBoard[r][c];
  if (cell.revealed) return;

  if (!cell.flagged && !cell.question) {
    cell.flagged = true;
    mineFlagged++;
  } else if (cell.flagged) {
    cell.flagged  = false;
    cell.question = true;
    mineFlagged--;
  } else {
    cell.question = false;
  }

  setMineLED(mineCount - mineFlagged);
  renderMineBoard();
}

function handleMineMiddle(e, r, c) {
  // Chord: if cell revealed and flag count matches, auto-reveal neighbors
  e.preventDefault();
  const cell = mineBoard[r][c];
  if (!cell.revealed || cell.count === 0) return;
  let flagNear = 0;
  forAdj(r, c, (nr, nc) => { if (mineBoard[nr][nc].flagged) flagNear++; });
  if (flagNear === cell.count) {
    forAdj(r, c, (nr, nc) => {
      if (!mineBoard[nr][nc].flagged && !mineBoard[nr][nc].revealed) {
        if (mineBoard[nr][nc].mine) { mineBoard[nr][nc].exploded = true; endGame(false); }
        else { revealFlood(nr, nc); }
      }
    });
    if (mineGameState !== 'lost') { checkWin(); renderMineBoard(); }
  }
}

// ── GAME LOGIC ────────────────────────────────────────

function revealFlood(r, c) {
  if (r < 0 || r >= mineRows || c < 0 || c >= mineCols) return;
  const cell = mineBoard[r][c];
  if (cell.revealed || cell.flagged || cell.mine) return;
  cell.revealed = true;
  mineRevealed++;
  if (cell.count === 0) forAdj(r, c, (nr, nc) => revealFlood(nr, nc));
}

function checkWin() {
  if (mineRevealed === mineRows * mineCols - mineCount) endGame(true);
}

function endGame(won) {
  clearInterval(mineTimerInt);
  mineGameState = won ? 'won' : 'lost';

  if (won) {
    setSmiley('😎');
    setMineLED(0);
    for (let r = 0; r < mineRows; r++)
      for (let c = 0; c < mineCols; c++)
        if (mineBoard[r][c].mine) mineBoard[r][c].flagged = true;
    document.getElementById('mine-status').textContent = `You win! Time: ${mineTimer}s 🎉`;
  } else {
    setSmiley('😵');
    // Reveal all mines, mark wrong flags
    for (let r = 0; r < mineRows; r++) {
      for (let c = 0; c < mineCols; c++) {
        const cell = mineBoard[r][c];
        if (cell.mine) cell.revealed = true;
        if (cell.flagged && !cell.mine) cell.wrongFlag = true;
      }
    }
    document.getElementById('mine-status').textContent = 'BOOM! Game over. Click 🙂 to restart.';
  }
  renderMineBoard();
}

// ── RENDER ────────────────────────────────────────────

function renderMineBoard() {
  const boardEl = document.getElementById('mine-board');
  if (!boardEl) return;

  boardEl.style.gridTemplateColumns = `repeat(${mineCols}, 18px)`;
  boardEl.innerHTML = '';

  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      const cell = mineBoard[r][c];
      const div  = document.createElement('div');
      div.className = 'mine-cell';

      if (cell.wrongFlag) {
        div.classList.add('mine-revealed', 'mine-wrong-flag');
        div.textContent = '🚩';
      } else if (cell.revealed) {
        div.classList.add('mine-revealed');
        if (cell.mine) {
          div.classList.add(cell.exploded ? 'mine-exploded' : '');
          div.textContent = '💣';
        } else if (cell.count > 0) {
          div.textContent    = cell.count;
          div.style.color    = NUM_COLORS[cell.count];
          div.style.fontSize = '11px';
        }
      } else if (cell.flagged) {
        div.classList.add('mine-unrevealed');
        div.textContent = '🚩';
      } else if (cell.question) {
        div.classList.add('mine-unrevealed');
        div.textContent = '?';
        div.style.color = '#000080';
      } else {
        div.classList.add('mine-unrevealed');
        div.addEventListener('click',       () => handleMineClick(r, c));
        div.addEventListener('contextmenu', (e) => handleMineRight(e, r, c));
        div.addEventListener('mousedown',   (e) => { if (e.button === 1) handleMineMiddle(e, r, c); });
      }

      boardEl.appendChild(div);
    }
  }
}

// ── LED DISPLAYS ──────────────────────────────────────

function setMineLED(n)  { const el = document.getElementById('mine-count-display'); if (el) el.textContent = String(Math.max(-99, Math.min(999, n))).padStart(3, '0'); }
function setTimerLED(n) { const el = document.getElementById('mine-timer-display'); if (el) el.textContent = String(n).padStart(3, '0'); }
function setSmiley(e)   { const el = document.getElementById('mine-smiley');        if (el) el.textContent = e; }

function toggleMineMenu() {
  document.getElementById('mine-menu-dropdown').classList.toggle('hidden');
}

// ── AUTO-INIT ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Init happens when the window opens (see openWindow hook in desktop.js)
  // We hook via the window's first display
  const mineWin = document.getElementById('window-minesweeper');
  if (!mineWin) return;
  const obs = new MutationObserver(() => {
    if (mineWin.style.display === 'block' && !mineWin.dataset.mineInit) {
      mineWin.dataset.mineInit = '1';
      initMinesweeper('beginner');
    }
  });
  obs.observe(mineWin, { attributes: true, attributeFilter: ['style'] });
});
