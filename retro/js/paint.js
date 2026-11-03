/* ═══════════════════════════════════════════════════════
   paint.js — Win95 Paint App
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const WIN95_PALETTE = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#c0c0c0','#ffffff','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
  '#ff8040','#804000','#ffff80','#80ff00','#00ff80','#80ffff','#8080ff','#ff0080',
  '#ff8080','#ffcc80','#ffff40','#80ff80','#80ffff','#80c0ff',
];

let paintCanvas, paintCtx;
let painting   = false;
let paintTool  = 'pencil';
let paintFg    = '#000000';
let paintBg    = '#ffffff';
let paintSize  = 1;
let lastX = 0, lastY = 0;
let startX = 0, startY = 0;
let snapshot  = null; // for shape preview
let textInput = null; // active text insertion

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const paintWin = document.getElementById('window-paint');
  if (!paintWin) return;

  const obs = new MutationObserver(() => {
    if (paintWin.style.display === 'block' && !paintWin.dataset.paintInit) {
      paintWin.dataset.paintInit = '1';
      initPaint();
    }
  });
  obs.observe(paintWin, { attributes: true, attributeFilter: ['style'] });
});

function initPaint() {
  paintCanvas = document.getElementById('paint-canvas');
  paintCtx    = paintCanvas.getContext('2d');

  // White canvas
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);

  buildPalette();

  // Mouse events
  paintCanvas.addEventListener('mousedown',  paintStart);
  paintCanvas.addEventListener('mousemove',  paintMove);
  paintCanvas.addEventListener('mouseup',    paintEnd);
  paintCanvas.addEventListener('mouseleave', paintEnd);
  paintCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Tool buttons
  document.getElementById('paint-tools').addEventListener('click', (e) => {
    const btn = e.target.closest('.paint-tool-btn');
    if (!btn) return;
    document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    paintTool = btn.dataset.tool;
    paintCanvas.style.cursor = paintTool === 'text' ? 'text' : 'crosshair';
    if (paintTool === 'eraser') paintCanvas.style.cursor = 'cell';
  });

  updateColorSwatches();
}

// ── PALETTE ───────────────────────────────────────────

function buildPalette() {
  const container = document.getElementById('paint-palette');
  if (!container) return;
  container.innerHTML = '';
  WIN95_PALETTE.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'paint-swatch';
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener('click',       () => { paintFg = color; updateColorSwatches(); });
    swatch.addEventListener('contextmenu', (e) => { e.preventDefault(); paintBg = color; updateColorSwatches(); });
    container.appendChild(swatch);
  });
}

function updateColorSwatches() {
  const fg = document.getElementById('paint-fg-swatch');
  const bg = document.getElementById('paint-bg-swatch');
  if (fg) fg.style.background = paintFg;
  if (bg) bg.style.background = paintBg;
}

// ── SIZE ──────────────────────────────────────────────

function setPaintSize(size) {
  paintSize = size;
  document.querySelectorAll('.paint-size-dot').forEach(d => {
    d.classList.toggle('active', parseInt(d.dataset.size) === size);
  });
}

// ── DRAW EVENTS ───────────────────────────────────────

function getPos(e) {
  const rect = paintCanvas.getBoundingClientRect();
  return {
    x: Math.round(e.clientX - rect.left),
    y: Math.round(e.clientY - rect.top),
  };
}

function paintStart(e) {
  const { x, y } = getPos(e);
  const isRight   = e.button === 2;
  const color     = isRight ? paintBg : paintFg;

  if (paintTool === 'picker') {
    const px = paintCtx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(px[0], px[1], px[2]);
    if (isRight) paintBg = hex; else paintFg = hex;
    updateColorSwatches();
    return;
  }

  if (paintTool === 'fill') {
    floodFill(x, y, color);
    return;
  }

  if (paintTool === 'text') {
    spawnTextInput(x, y, color);
    return;
  }

  painting  = true;
  startX    = x;
  startY    = y;
  lastX     = x;
  lastY     = y;

  if (['line', 'rect', 'oval'].includes(paintTool)) {
    snapshot = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  }

  if (paintTool === 'pencil' || paintTool === 'eraser') {
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
    paintCtx.lineWidth   = paintSize;
    paintCtx.lineCap     = 'round';
    paintCtx.lineJoin    = 'round';
    paintCtx.strokeStyle = paintTool === 'eraser' ? paintBg : color;
    paintCtx.lineTo(x + 0.1, y + 0.1); // dot for single click
    paintCtx.stroke();
  }
}

function paintMove(e) {
  if (!painting) return;
  const { x, y } = getPos(e);
  const isRight   = e.buttons === 2;
  const color     = isRight ? paintBg : paintFg;

  updateStatus(`${x}, ${y}`);

  switch (paintTool) {
    case 'pencil':
    case 'eraser':
      paintCtx.beginPath();
      paintCtx.moveTo(lastX, lastY);
      paintCtx.lineTo(x, y);
      paintCtx.lineWidth   = paintSize;
      paintCtx.lineCap     = 'round';
      paintCtx.strokeStyle = paintTool === 'eraser' ? paintBg : color;
      paintCtx.stroke();
      break;

    case 'line':
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.beginPath();
      paintCtx.moveTo(startX, startY);
      paintCtx.lineTo(x, y);
      paintCtx.lineWidth   = paintSize;
      paintCtx.strokeStyle = color;
      paintCtx.lineCap     = 'square';
      paintCtx.stroke();
      break;

    case 'rect':
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.beginPath();
      paintCtx.strokeStyle = color;
      paintCtx.lineWidth   = paintSize;
      paintCtx.strokeRect(startX, startY, x - startX, y - startY);
      break;

    case 'oval':
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.beginPath();
      paintCtx.ellipse(
        (startX + x) / 2, (startY + y) / 2,
        Math.abs(x - startX) / 2, Math.abs(y - startY) / 2,
        0, 0, Math.PI * 2
      );
      paintCtx.strokeStyle = color;
      paintCtx.lineWidth   = paintSize;
      paintCtx.stroke();
      break;
  }

  lastX = x;
  lastY = y;
}

function paintEnd() {
  painting  = false;
  snapshot  = null;
  updateStatus('Ready');
}

// ── FLOOD FILL ────────────────────────────────────────

function floodFill(startX, startY, fillHex) {
  const imgData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  const data    = imgData.data;
  const w       = paintCanvas.width;
  const h       = paintCanvas.height;

  const idx = (x, y) => (y * w + x) * 4;
  const target = data.slice(idx(startX, startY), idx(startX, startY) + 4);
  const fill   = hexToRgba(fillHex);

  if (colorsMatch(target, fill)) return;

  const stack = [[startX, startY]];
  const visited = new Uint8Array(w * h);

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (visited[y * w + x]) continue;
    if (!colorsMatch(data.slice(idx(x, y), idx(x, y) + 4), target)) continue;

    visited[y * w + x] = 1;
    data[idx(x,y)]     = fill[0];
    data[idx(x,y)+1]   = fill[1];
    data[idx(x,y)+2]   = fill[2];
    data[idx(x,y)+3]   = fill[3];

    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }

  paintCtx.putImageData(imgData, 0, 0);
}

function colorsMatch(a, b, tol = 10) {
  return Math.abs(a[0]-b[0]) < tol && Math.abs(a[1]-b[1]) < tol &&
         Math.abs(a[2]-b[2]) < tol && Math.abs(a[3]-b[3]) < tol;
}

// ── TEXT TOOL ─────────────────────────────────────────

function spawnTextInput(x, y, color) {
  if (textInput) commitText();
  const wrap = paintCanvas.parentElement;
  const rect = paintCanvas.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.style.cssText = `
    position:absolute;
    left:${x + (rect.left - wrapRect.left) + 6}px;
    top:${y  + (rect.top  - wrapRect.top)  + 6}px;
    background:transparent;
    border:1px dotted #000;
    font-size:${Math.max(12, paintSize * 3)}px;
    color:${color};
    outline:none;
    min-width:80px;
    z-index:100;
  `;
  textInput.placeholder = 'Type here';
  wrap.style.position   = 'relative';
  wrap.appendChild(textInput);
  textInput.focus();
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') commitText();
  });
  textInput.addEventListener('blur', commitText);
}

function commitText() {
  if (!textInput) return;
  const val = textInput.value.trim();
  if (val) {
    const x   = parseInt(textInput.style.left) - (paintCanvas.getBoundingClientRect().left - textInput.parentElement.getBoundingClientRect().left) - 6;
    const y   = parseInt(textInput.style.top)  - (paintCanvas.getBoundingClientRect().top  - textInput.parentElement.getBoundingClientRect().top)  - 6;
    paintCtx.font      = `${Math.max(12, paintSize * 3)}px Arial`;
    paintCtx.fillStyle = paintFg;
    paintCtx.fillText(val, x, y + parseInt(paintCtx.font));
  }
  textInput.remove();
  textInput = null;
}

// ── ACTIONS ───────────────────────────────────────────

function paintNew() {
  paintCtx.fillStyle = paintBg;
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function paintSave() {
  const link = document.createElement('a');
  link.download = 'masterpiece.png';
  link.href = paintCanvas.toDataURL();
  link.click();
}

// ── HELPERS ───────────────────────────────────────────

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b, 255];
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function updateStatus(msg) {
  const el = document.getElementById('paint-status');
  if (el) el.textContent = msg;
}
