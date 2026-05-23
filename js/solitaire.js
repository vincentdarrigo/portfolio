/* ═══════════════════════════════════════════════════════
   solitaire.js — Klondike Solitaire
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const SOL_RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SOL_SUITS  = ['♠','♥','♦','♣'];
const SOL_RED    = new Set(['♥','♦']);
const SOL_RANK_V = {};
SOL_RANKS.forEach((r, i) => { SOL_RANK_V[r] = i + 1; });

let solStock = [], solWaste = [], solFoundations = [[],[],[],[]], solTableau = [];
let solSelected = null; // { area:'waste'|'tableau'|'foundation', col:number, cardIdx:number }
let solMoves = 0;

// ── AUTO-INIT ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const solWin = document.getElementById('window-solitaire');
  if (!solWin) return;
  const obs = new MutationObserver(() => {
    if (solWin.style.display === 'block' && !solWin.dataset.solInit) {
      solWin.dataset.solInit = '1';
      newSolitaireGame();
    }
  });
  obs.observe(solWin, { attributes: true, attributeFilter: ['style'] });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && solSelected) {
      solSelected = null;
      renderSolitaire();
    }
  });
});

// ── NEW GAME ──────────────────────────────────────────

function newSolitaireGame() {
  const deck = [];
  for (const suit of SOL_SUITS) {
    for (const rank of SOL_RANKS) {
      deck.push({ rank, suit });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  solTableau = Array.from({ length: 7 }, () => []);
  let di = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      solTableau[col].push({ ...deck[di++], faceUp: row === col });
    }
  }

  solStock       = deck.slice(di).map(c => ({ ...c, faceUp: false }));
  solWaste       = [];
  solFoundations = [[],[],[],[]];
  solSelected    = null;
  solMoves       = 0;

  const overlay = document.getElementById('sol-win-overlay');
  if (overlay) overlay.classList.add('hidden');
  renderSolitaire();
}

// ── STOCK ─────────────────────────────────────────────

function drawFromStock() {
  if (solStock.length === 0) {
    solStock = [...solWaste].reverse().map(c => ({ ...c, faceUp: false }));
    solWaste = [];
  } else {
    const card = solStock.pop();
    card.faceUp = true;
    solWaste.push(card);
  }
  solSelected = null;
  renderSolitaire();
}

// ── WASTE ─────────────────────────────────────────────

function clickWaste() {
  if (!solWaste.length) return;
  if (solSelected && solSelected.area === 'waste') {
    solSelected = null;
  } else {
    solSelected = { area: 'waste', col: -1, cardIdx: solWaste.length - 1 };
  }
  renderSolitaire();
}

// ── FOUNDATION ────────────────────────────────────────

function clickFoundation(fi) {
  if (!solSelected) { renderSolitaire(); return; }
  const cards = getSelectedCards();
  if (cards.length === 1 && canMoveToFoundation(cards[0], fi)) {
    const card = cards[0];
    removeSelectedFromSource();
    solFoundations[fi].push(card);
    solMoves++;
    solSelected = null;
    renderSolitaire();
    checkSolWin();
    return;
  }
  solSelected = null;
  renderSolitaire();
}

// ── TABLEAU ───────────────────────────────────────────

function clickTableauCard(col, cardIdx) {
  const card = solTableau[col][cardIdx];
  if (!card.faceUp) return;

  if (solSelected) {
    if (solSelected.area === 'tableau' && solSelected.col === col && solSelected.cardIdx === cardIdx) {
      solSelected = null;
      renderSolitaire();
      return;
    }
    const isTop = cardIdx === solTableau[col].length - 1;
    if (isTop) {
      const movingCards = getSelectedCards();
      if (movingCards.length && canPlaceCard(movingCards[0], col)) {
        removeSelectedFromSource();
        for (const c of movingCards) solTableau[col].push(c);
        solMoves++;
        solSelected = null;
        renderSolitaire();
        checkSolWin();
        return;
      }
    }
    solSelected = { area: 'tableau', col, cardIdx };
    renderSolitaire();
    return;
  }

  solSelected = { area: 'tableau', col, cardIdx };
  renderSolitaire();
}

function clickTableauCol(col) {
  if (!solSelected) return;
  const movingCards = getSelectedCards();
  if (movingCards.length && canPlaceCard(movingCards[0], col)) {
    removeSelectedFromSource();
    for (const c of movingCards) solTableau[col].push(c);
    solMoves++;
    solSelected = null;
    renderSolitaire();
    checkSolWin();
    return;
  }
  solSelected = null;
  renderSolitaire();
}

function dblClickCard(area, col, cardIdx) {
  if (area === 'foundation') return;
  solSelected = { area, col, cardIdx };
  const cards = getSelectedCards();
  if (cards.length === 1) {
    for (let fi = 0; fi < 4; fi++) {
      if (canMoveToFoundation(cards[0], fi)) {
        const card = cards[0];
        removeSelectedFromSource();
        solFoundations[fi].push(card);
        solMoves++;
        solSelected = null;
        renderSolitaire();
        checkSolWin();
        return;
      }
    }
  }
  solSelected = null;
  renderSolitaire();
}

// ── GAME LOGIC ────────────────────────────────────────

function getSelectedCards() {
  if (!solSelected) return [];
  if (solSelected.area === 'waste')    return [solWaste[solWaste.length - 1]];
  if (solSelected.area === 'tableau')  return solTableau[solSelected.col].slice(solSelected.cardIdx);
  return [];
}

function removeSelectedFromSource() {
  if (!solSelected) return;
  if (solSelected.area === 'waste') {
    solWaste.pop();
  } else if (solSelected.area === 'tableau') {
    solTableau[solSelected.col].splice(solSelected.cardIdx);
    flipTopCard(solSelected.col);
  }
}

function flipTopCard(col) {
  const c = solTableau[col];
  if (c.length > 0 && !c[c.length - 1].faceUp) c[c.length - 1].faceUp = true;
}

function canPlaceCard(card, targetCol) {
  const col = solTableau[targetCol];
  if (col.length === 0) return card.rank === 'K';
  const top = col[col.length - 1];
  if (!top.faceUp) return false;
  return SOL_RED.has(card.suit) !== SOL_RED.has(top.suit) &&
         SOL_RANK_V[card.rank] === SOL_RANK_V[top.rank] - 1;
}

function canMoveToFoundation(card, fi) {
  const found = solFoundations[fi];
  if (found.length === 0) return card.rank === 'A';
  const top = found[found.length - 1];
  return top.suit === card.suit && SOL_RANK_V[card.rank] === SOL_RANK_V[top.rank] + 1;
}

function checkSolWin() {
  if (solFoundations.reduce((s, f) => s + f.length, 0) === 52) {
    const overlay = document.getElementById('sol-win-overlay');
    if (overlay) overlay.classList.remove('hidden');
    startSolWinAnim();
  }
}

function startSolWinAnim() {
  const game = document.getElementById('sol-game');
  if (!game) return;

  const canvas = document.createElement('canvas');
  canvas.width  = game.scrollWidth  || 540;
  canvas.height = game.scrollHeight || 400;
  canvas.style.cssText = 'position:absolute;top:0;left:0;z-index:99;pointer-events:none;';
  game.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CW = 42, CH = 58;

  const SUITS = ['♠','♥','♦','♣'];
  const RANKS = ['A','K','Q','J','10','9','8','7'];
  const isRed = s => s === '♥' || s === '♦';

  // Spawn cards one at a time from bottom, like the real Win95 animation
  const cards = [];
  let spawnIdx = 0;

  function spawnCard() {
    if (spawnIdx >= 26) return;
    const suit  = SUITS[spawnIdx % 4];
    const rank  = RANKS[spawnIdx % 8];
    cards.push({
      rank, suit,
      x: W / 2 - CW / 2 + (Math.random() - 0.5) * 60,
      y: H - CH,
      vx: (Math.random() - 0.5) * 10,
      vy: -(14 + Math.random() * 10),
      bounces: 0,
    });
    spawnIdx++;
  }

  let t = 0;
  function frame() {
    t++;
    if (t % 10 === 0) spawnCard(); // new card every 10 frames

    ctx.clearRect(0, 0, W, H);

    cards.forEach(c => {
      c.vy += 0.5;
      c.x  += c.vx;
      c.y  += c.vy;

      if (c.x < 0)           { c.x = 0;       c.vx =  Math.abs(c.vx); }
      else if (c.x + CW > W) { c.x = W - CW;  c.vx = -Math.abs(c.vx); }

      if (c.y + CH >= H) {
        c.y = H - CH;
        c.vy = -Math.abs(c.vy) * 0.68;
        c.vx *= 0.95;
        c.bounces++;
      }

      // Card face
      ctx.fillStyle = '#fff';
      ctx.fillRect(c.x, c.y, CW, CH);
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x, c.y, CW, CH);

      ctx.fillStyle = isRed(c.suit) ? '#c00' : '#000';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(`${c.rank}${c.suit}`, c.x + 3, c.y + 13);
      ctx.save();
      ctx.translate(c.x + CW, c.y + CH);
      ctx.rotate(Math.PI);
      ctx.fillText(`${c.rank}${c.suit}`, 3, 13);
      ctx.restore();
    });

    if (t < 480) requestAnimationFrame(frame);
    else canvas.remove();
  }

  requestAnimationFrame(frame);
}

// ── RENDER ────────────────────────────────────────────

function renderSolitaire() {
  renderSolStock();
  renderSolWaste();
  renderSolFoundations();
  renderSolTableau();
  updateSolStatus();
}

function renderSolStock() {
  const el = document.getElementById('sol-stock');
  if (!el) return;
  el.innerHTML = '';
  el.onclick = drawFromStock;

  if (solStock.length > 0) {
    const cardEl = document.createElement('div');
    cardEl.className = 'sol-card';
    cardEl.innerHTML = '<div class="sol-card-back"></div>';
    cardEl.style.cssText = 'position:relative;top:0;left:0;';
    cardEl.addEventListener('click', (e) => { e.stopPropagation(); drawFromStock(); });
    el.appendChild(cardEl);
  } else {
    el.innerHTML = '<div class="sol-empty-stock">↺</div>';
  }
}

function renderSolWaste() {
  const el = document.getElementById('sol-waste');
  if (!el) return;
  el.innerHTML = '';
  el.onclick = null;

  if (solWaste.length > 0) {
    const card = solWaste[solWaste.length - 1];
    const cardEl = makeCardEl(card, 'waste', -1, solWaste.length - 1);
    cardEl.style.cssText = 'position:relative;top:0;left:0;';
    el.appendChild(cardEl);
  }
}

function renderSolFoundations() {
  const SUIT_LABELS = ['♠','♥','♦','♣'];
  for (let fi = 0; fi < 4; fi++) {
    const el = document.getElementById(`sol-found-${fi}`);
    if (!el) continue;
    el.onclick = () => clickFoundation(fi);
    el.innerHTML = '';

    const found = solFoundations[fi];
    if (found.length > 0) {
      const card = found[found.length - 1];
      const cardEl = makeCardEl(card, 'foundation', fi, found.length - 1);
      cardEl.style.cssText = 'position:relative;top:0;left:0;';
      el.appendChild(cardEl);
    } else {
      const lbl = document.createElement('span');
      lbl.className = 'sol-foundation-label';
      lbl.textContent = SUIT_LABELS[fi];
      el.appendChild(lbl);
    }
  }
}

function renderSolTableau() {
  const FACEDOWN_STEP = 18;
  const FACEUP_STEP   = 24;

  for (let col = 0; col < 7; col++) {
    const el = document.getElementById(`sol-col-${col}`);
    if (!el) continue;
    el.innerHTML = '';
    el.onclick = () => clickTableauCol(col);

    const cards = solTableau[col];
    if (cards.length === 0) {
      el.style.height = '95px';
      continue;
    }

    let offsetY = 0;
    cards.forEach((card, ci) => {
      const cardEl = makeCardEl(card, 'tableau', col, ci);
      cardEl.style.top = `${offsetY}px`;
      el.appendChild(cardEl);
      if (ci < cards.length - 1) {
        offsetY += card.faceUp ? FACEUP_STEP : FACEDOWN_STEP;
      }
    });

    el.style.height = `${offsetY + 95}px`;
  }
}

function makeCardEl(card, area, col, cardIdx) {
  const el = document.createElement('div');
  el.className = 'sol-card';

  const isSel = solSelected && solSelected.area === area && (
    area === 'tableau'
      ? solSelected.col === col && cardIdx >= solSelected.cardIdx
      : solSelected.col === col
  );
  if (isSel) el.classList.add('sol-selected');

  if (!card.faceUp) {
    el.innerHTML = '<div class="sol-card-back"></div>';
    return el;
  }

  const isRed = SOL_RED.has(card.suit);
  el.innerHTML = `
    <div class="sol-card-face ${isRed ? 'sol-red' : 'sol-black'}">
      <div class="sol-card-corner">
        <div class="sol-card-corner-rank">${card.rank}</div>
        <div class="sol-card-corner-suit">${card.suit}</div>
      </div>
      <div class="sol-card-center-suit">${card.suit}</div>
      <div class="sol-card-corner sol-card-corner-bot">
        <div class="sol-card-corner-rank">${card.rank}</div>
        <div class="sol-card-corner-suit">${card.suit}</div>
      </div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (area === 'waste')      clickWaste();
    else if (area === 'tableau')    clickTableauCard(col, cardIdx);
    else if (area === 'foundation') clickFoundation(col); // col = fi
  });

  el.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    dblClickCard(area, col, cardIdx);
  });

  return el;
}

function updateSolStatus() {
  const el = document.getElementById('sol-status');
  if (!el) return;
  const foundCount = solFoundations.reduce((s, f) => s + f.length, 0);
  if (solSelected) {
    const cards = getSelectedCards();
    el.textContent = `${cards.length} card${cards.length !== 1 ? 's' : ''} selected — click destination or press Esc to cancel`;
  } else {
    el.textContent = `Stock: ${solStock.length} · Moves: ${solMoves} · Foundation: ${foundCount}/52 · Double-click to auto-send`;
  }
}
