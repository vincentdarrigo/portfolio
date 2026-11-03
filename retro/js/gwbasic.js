/* ═══════════════════════════════════════════════════════
   gwbasic.js — GW-BASIC 3.23 + Logo Turtle Interpreter
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── TURTLE COLORS (GW-BASIC palette) ─────────────────
const GWB_PALETTE = [
  '#000000','#0000aa','#00aa00','#00aaaa',
  '#aa0000','#aa00aa','#aa5500','#aaaaaa',
  '#555555','#5555ff','#55ff55','#55ffff',
  '#ff5555','#ff55ff','#ffff55','#ffffff',
];

// ── PRE-LOADED PROGRAMS ───────────────────────────────

const GWB_PROGRAMS = {
  DEMO1: {
    name: 'SPIROGRAPH.BAS',
    lines: [
      '10 REM Spirograph — rainbow spiral',
      '20 SETSPEED 4',
      '30 FOR I = 0 TO 720',
      '40   SETCOLOR I MOD 15 + 1',
      '50   FD I * 0.55',
      '60   RT 59',
      '70 NEXT I',
    ],
    run: function*(turtle) {
      for (let i = 0; i <= 720; i++) {
        turtle.setColor(GWB_PALETTE[(i % 15) + 1]);
        yield* turtle.forward(i * 0.55);
        yield* turtle.right(59);
      }
    },
  },

  DEMO2: {
    name: 'STARBURST.BAS',
    lines: [
      '10 REM Nested Stars — 12 pentagrams',
      '20 SETSPEED 6',
      '30 FOR J = 0 TO 11',
      '40   SETCOLOR J MOD 14 + 1',
      '50   FOR I = 0 TO 4',
      '60     FD 130',
      '70     RT 144',
      '80   NEXT I',
      '90   RT 30',
      '100 NEXT J',
    ],
    run: function*(turtle) {
      for (let j = 0; j < 12; j++) {
        turtle.setColor(GWB_PALETTE[(j % 14) + 1]);
        for (let i = 0; i < 5; i++) {
          yield* turtle.forward(130);
          yield* turtle.right(144);
        }
        yield* turtle.right(30);
      }
    },
  },

  DEMO3: {
    name: 'HILBERT.BAS',
    lines: [
      '10 REM Hilbert Curve — order 5',
      '20 SETSPEED 8',
      '30 SETCOLOR 11',
      '40 HILBERT 5, 6, 90',
      '50 END',
    ],
    run: function*(turtle) {
      turtle.setColor(GWB_PALETTE[11]);
      const step = 6;
      yield* hilbert(turtle, 5, step, 90);
    },
  },

  DEMO4: {
    name: 'SNOWFLAKE.BAS',
    lines: [
      '10 REM Koch Snowflake — depth 4',
      '20 SETSPEED 5',
      '30 SETCOLOR 9',
      '40 LT 30',
      '50 FOR SIDE = 0 TO 2',
      '60   KOCH 4, 120',
      '70   RT 120',
      '80 NEXT SIDE',
    ],
    run: function*(turtle) {
      yield* turtle.left(30);
      turtle.setColor(GWB_PALETTE[9]);
      for (let side = 0; side < 3; side++) {
        yield* kochEdge(turtle, 4, 120);
        yield* turtle.right(120);
      }
    },
  },

  DEMO5: {
    name: 'FLOWER.BAS',
    lines: [
      '10 REM Flower — 36 rectangle petals',
      '20 SETSPEED 5',
      '30 FOR I = 0 TO 35',
      '40   SETCOLOR I MOD 14 + 1',
      '50   FD 120: RT 89',
      '60   FD 120: RT 89',
      '70   FD 120: RT 89',
      '80   FD 120: RT 89',
      '90   RT 10',
      '100 NEXT I',
    ],
    run: function*(turtle) {
      for (let i = 0; i < 36; i++) {
        turtle.setColor(GWB_PALETTE[(i % 14) + 1]);
        for (let s = 0; s < 4; s++) {
          yield* turtle.forward(120);
          yield* turtle.right(89);
        }
        yield* turtle.right(10);
      }
    },
  },
};

// Hilbert curve helper (recursive L-system)
function* hilbert(turtle, order, size, angle) {
  if (order === 0) return;
  yield* turtle.left(angle);
  yield* hilbert(turtle, order - 1, size, -angle);
  yield* turtle.forward(size);
  yield* turtle.right(angle);
  yield* hilbert(turtle, order - 1, size, angle);
  yield* turtle.forward(size);
  yield* hilbert(turtle, order - 1, size, angle);
  yield* turtle.right(angle);
  yield* turtle.forward(size);
  yield* hilbert(turtle, order - 1, size, -angle);
  yield* turtle.left(angle);
}

// Koch edge helper
function* kochEdge(turtle, depth, size) {
  if (depth === 0) {
    yield* turtle.forward(size);
    return;
  }
  yield* kochEdge(turtle, depth - 1, size / 3);
  yield* turtle.left(60);
  yield* kochEdge(turtle, depth - 1, size / 3);
  yield* turtle.right(120);
  yield* kochEdge(turtle, depth - 1, size / 3);
  yield* turtle.left(60);
  yield* kochEdge(turtle, depth - 1, size / 3);
}

// ── TURTLE CLASS ──────────────────────────────────────

class Turtle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.reset();
  }

  reset() {
    const W = this.canvas.width, H = this.canvas.height;
    this.x     = W / 2;
    this.y     = H / 2;
    this.angle = -90;   // facing up (0° = East)
    this.pen   = true;
    this.color = '#ffffff';
    this.speed = 4;     // pixels drawn per animation frame step
    this.ctx.clearRect(0, 0, W, H);
  }

  setColor(c) { this.color = c; }

  // Generator that draws n pixels forward, yielding occasionally for animation
  *forward(dist) {
    const rad = this.angle * Math.PI / 180;
    const dx  = Math.cos(rad);
    const dy  = Math.sin(rad);
    const spd = Math.max(1, this.speed);
    let traveled = 0;
    while (traveled < Math.abs(dist)) {
      const step = Math.min(spd, Math.abs(dist) - traveled);
      const nx = this.x + dx * step * Math.sign(dist);
      const ny = this.y + dy * step * Math.sign(dist);
      if (this.pen) {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth   = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(nx, ny);
        this.ctx.stroke();
      }
      this.x = nx;
      this.y = ny;
      traveled += step;
      yield;  // pause for animation frame
    }
  }

  *back(dist) { yield* this.forward(-dist); }

  *right(deg) { this.angle += deg; yield; }
  *left(deg)  { this.angle -= deg; yield; }

  *penUp()   { this.pen = false; yield; }
  *penDown() { this.pen = true;  yield; }

  *home() {
    const W = this.canvas.width, H = this.canvas.height;
    const wasPen = this.pen;
    this.pen = false;
    yield* this.forward(
      Math.hypot(W / 2 - this.x, H / 2 - this.y)
    );
    this.x     = W / 2;
    this.y     = H / 2;
    this.angle = -90;
    this.pen   = wasPen;
    yield;
  }
}

// ── STATE ─────────────────────────────────────────────

let gwbTurtle     = null;
let gwbCanvas     = null;
let gwbRunning    = false;
let gwbAnimId     = null;
let gwbProgram    = null;   // loaded program object
let gwbGenIter    = null;   // current generator iterator
let gwbInitialized = false;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-gwbasic');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !gwbInitialized) {
      gwbInitialized = true;
      gwbInit();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

function gwbInit() {
  gwbCanvas = document.getElementById('gwb-canvas');
  if (!gwbCanvas) return;

  // Size canvas to its container
  const pane = gwbCanvas.parentElement;
  gwbCanvas.width  = pane ? (pane.clientWidth || 378) : 378;
  gwbCanvas.height = pane ? (pane.clientHeight - 44 || 376) : 376; // minus header/demos bar
  gwbTurtle = new Turtle(gwbCanvas);

  // Boot messages
  gwbPrint('GW-BASIC Version 3.23', 'system');
  gwbPrint('Copyright (C) Microsoft Corp., 1983-2001', 'system');
  gwbPrint('61284 Bytes Free', 'system');
  gwbPrint('', 'ok');
  gwbPrint('Ok', 'ok');
  gwbPrint('');
  gwbPrint('Type DEMO1–DEMO5 and press ENTER.', 'system');
  gwbPrint('Or write your own: FD 100 RT 90', 'system');
  gwbPrint('', '');

  const inp = document.getElementById('gwb-input');
  if (inp) inp.addEventListener('keydown', gwbKeyDown);
}

// ── TERMINAL OUTPUT ───────────────────────────────────

function gwbPrint(text, cls = '') {
  const out = document.getElementById('gwb-output');
  if (!out) return;
  const line = document.createElement('div');
  line.className = 'gwb-line' + (cls ? ' gwb-' + cls : '');
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

// ── INPUT HANDLER ─────────────────────────────────────

function gwbKeyDown(e) {
  if (e.key !== 'Enter') return;
  const inp = document.getElementById('gwb-input');
  if (!inp) return;
  const raw = inp.value.trim();
  inp.value = '';
  if (!raw) return;

  gwbPrint(raw, 'code');
  gwbExec(raw.toUpperCase());
}

function gwbExec(cmd) {
  if (gwbRunning) {
    gwbPrint('Syntax error — program running', 'err');
    return;
  }

  // Built-in commands
  if (cmd === 'CLS') {
    const out = document.getElementById('gwb-output');
    if (out) out.innerHTML = '';
    gwbPrint('Ok', 'ok');
    return;
  }
  if (cmd === 'NEW') {
    gwbProgram = null;
    gwbTurtle && gwbTurtle.reset();
    gwbPrint('Ok', 'ok');
    return;
  }
  if (cmd === 'LIST') {
    if (!gwbProgram) { gwbPrint('Ok', 'ok'); return; }
    gwbProgram.lines.forEach(l => gwbPrint(l, 'code'));
    gwbPrint('Ok', 'ok');
    return;
  }
  if (cmd === 'RUN') {
    if (!gwbProgram) { gwbPrint('No program loaded. Type DEMO1–DEMO5.', 'err'); return; }
    gwbTurtle.reset();
    gwbStartRun(gwbProgram.run(gwbTurtle));
    return;
  }
  if (cmd === 'HOME') {
    if (gwbTurtle) { const g = gwbTurtle.home(); while (!g.next().done) {} }
    gwbPrint('Ok', 'ok');
    return;
  }
  if (cmd === 'CLEAR') {
    if (gwbTurtle) gwbTurtle.reset();
    gwbPrint('Ok', 'ok');
    return;
  }

  // Load demos
  const demoMatch = cmd.match(/^DEMO\s*(\d)$/);
  if (demoMatch) {
    const key = 'DEMO' + demoMatch[1];
    const prog = GWB_PROGRAMS[key];
    if (!prog) { gwbPrint('?File not found — try DEMO1 to DEMO5', 'err'); return; }
    gwbProgram = prog;
    gwbTurtle.reset();
    gwbPrint('Loading ' + prog.name + '...', 'system');
    prog.lines.forEach(l => gwbPrint(l, 'code'));
    gwbPrint('Ok', 'ok');
    gwbPrint('Type RUN to execute.', 'system');
    return;
  }

  // Interpret inline turtle commands
  const result = gwbInterpretLine(cmd);
  if (result === null) {
    gwbPrint('?Syntax error', 'err');
  } else {
    gwbStartRun(result);
  }
}

// ── INLINE COMMAND INTERPRETER ────────────────────────

function* gwbInlineGen(cmds) {
  for (const { op, val } of cmds) {
    switch (op) {
      case 'FD': case 'FORWARD': yield* gwbTurtle.forward(val); break;
      case 'BK': case 'BACK':    yield* gwbTurtle.back(val);    break;
      case 'RT': case 'RIGHT':   yield* gwbTurtle.right(val);   break;
      case 'LT': case 'LEFT':    yield* gwbTurtle.left(val);    break;
      case 'PU': case 'PENUP':   yield* gwbTurtle.penUp();      break;
      case 'PD': case 'PENDOWN': yield* gwbTurtle.penDown();    break;
      case 'HOME':               yield* gwbTurtle.home();       break;
      case 'CLEAR': case 'CLS':  gwbTurtle.reset(); yield;      break;
      case 'SETCOLOR':
        gwbTurtle.setColor(GWB_PALETTE[Math.max(0, Math.min(15, val))]);
        yield;
        break;
      case 'SETSPEED':
        gwbTurtle.speed = Math.max(1, val);
        yield;
        break;
    }
  }
}

function gwbInterpretLine(line) {
  // Parse space-separated tokens: FD 100 RT 90 etc.
  // Supports REPEAT n [cmds] (one level deep)
  const cmds = [];

  // Handle REPEAT n [...]
  const repeatMatch = line.match(/^REPEAT\s+(\d+(?:\.\d+)?)\s*\[(.+)\]$/);
  if (repeatMatch) {
    const n    = Math.min(2000, Math.round(Number(repeatMatch[1])));
    const inner = gwbParseTokens(repeatMatch[2]);
    if (!inner) return null;
    return (function*() {
      for (let i = 0; i < n; i++) {
        yield* gwbInlineGen(inner);
      }
      gwbPrint('Ok', 'ok');
    })();
  }

  const parsed = gwbParseTokens(line);
  if (!parsed) return null;

  return (function*() {
    yield* gwbInlineGen(parsed);
    gwbPrint('Ok', 'ok');
  })();
}

function gwbParseTokens(str) {
  const tokens = str.trim().split(/\s+/);
  const cmds   = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i].toUpperCase();
    // No-arg commands
    if (['PU','PENUP','PD','PENDOWN','HOME','CLEAR','CLS'].includes(t)) {
      cmds.push({ op: t, val: 0 });
      i++;
      continue;
    }
    // Single-arg commands
    if (['FD','FORWARD','BK','BACK','RT','RIGHT','LT','LEFT',
         'SETCOLOR','SETSPEED'].includes(t)) {
      const v = Number(tokens[i + 1]);
      if (isNaN(v)) return null;
      cmds.push({ op: t, val: v });
      i += 2;
      continue;
    }
    // Unknown → skip (handles PRINT etc.)
    if (t.startsWith('PRINT')) { i = tokens.length; continue; }
    return null;
  }
  return cmds.length ? cmds : null;
}

// ── ANIMATION LOOP ────────────────────────────────────

function gwbStartRun(generator) {
  if (gwbRunning) return;
  gwbRunning = true;
  gwbGenIter = generator;

  const STEPS_PER_FRAME = 12;

  function frame() {
    for (let s = 0; s < STEPS_PER_FRAME; s++) {
      const res = gwbGenIter.next();
      if (res.done) {
        gwbRunning = false;
        gwbGenIter = null;
        return;
      }
    }
    gwbAnimId = requestAnimationFrame(frame);
  }
  gwbAnimId = requestAnimationFrame(frame);
}

// ── STOP BUTTON ───────────────────────────────────────

function gwbStop() {
  cancelAnimationFrame(gwbAnimId);
  gwbRunning = false;
  gwbGenIter = null;
  gwbPrint('Break', 'err');
  gwbPrint('Ok', 'ok');
}

// ── CLEAR CANVAS ──────────────────────────────────────

function gwbClearCanvas() {
  gwbStop();
  if (gwbTurtle) gwbTurtle.reset();
  gwbPrint('Screen cleared.', 'system');
  gwbPrint('Ok', 'ok');
}

// ── DEMO SHORTCUT ─────────────────────────────────────

function gwbRunDemo(n) {
  if (gwbRunning) { gwbStop(); }
  const inp = document.getElementById('gwb-input');
  if (inp) inp.value = '';
  gwbExec('DEMO' + n);
  setTimeout(() => gwbExec('RUN'), 50);
}
