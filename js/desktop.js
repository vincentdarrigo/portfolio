/* ═══════════════════════════════════════════════════════
   desktop.js — Win95 Portfolio Desktop Manager
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// Window titles shown in the taskbar
const WINDOW_TITLES = {
  about:            '💻 About Vince',
  projects:         '📁 My Projects',
  questforge:       '🗺️ QuestForge',
  questourism:      '🌐 Questourism.com',
  predictrix:       '📊 Predictrix.app',
  reviewflow:       '🔄 ReviewFlow',
  thinkio:          '🧠 Thinkio',
  trivia:           '❓ AI Trivia',
  resume:           '📄 Resume.doc',
  vault:            '🔒 Restricted Area',
  private:          '🔓 Private Projects',
  minesweeper:      '💣 Minesweeper',
  paint:            '🎨 Paint',
  solitaire:        '🃏 Solitaire',
  snake:            '🐍 Snake',
  tetris:           '🎮 Tetris',
  messenger:        '💬 Buddy Chat',
  tamagotchi:       '🥚 Tamagotchi',
  winamp:           '🎵 WinAmp',
  'chat-history':   '📜 Conversation History',
  limester:         '🍋 LimeSter',
  ie:               '🌐 Internet Explorer',
  netscape:         '☄️ Netscape Navigator',
};

// ── VOLUME ────────────────────────────────────────────
let masterVolume = 0.75;

function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, Number(v)));
  document.querySelectorAll('audio').forEach(a => { a.volume = masterVolume; });
  const lbl = document.getElementById('vol-pct-label');
  if (lbl) lbl.textContent = Math.round(masterVolume * 100) + '%';
  const slider = document.getElementById('vol-slider');
  if (slider) slider.value = Math.round(masterVolume * 100);
}

function toggleVolumePopup() {
  const popup = document.getElementById('vol-popup');
  if (!popup) return;
  const visible = popup.style.display !== 'none';
  popup.style.display = visible ? 'none' : 'block';
  if (!visible) {
    // close on outside click
    setTimeout(() => {
      const handler = (e) => {
        if (!popup.contains(e.target) && e.target.id !== 'vol-tray') {
          popup.style.display = 'none';
          document.removeEventListener('mousedown', handler);
        }
      };
      document.addEventListener('mousedown', handler);
    }, 10);
  }
}

// Track state for each window
const windowState = {}; // { id: { open: bool, minimized: bool } }

let zTop = 100; // z-index counter

// ── DRAG STATE ────────────────────────────────────────
const drag = { active: false, id: null, ox: 0, oy: 0 };

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Make all windows draggable
  document.querySelectorAll('.win95-window').forEach(win => {
    const id = win.id.replace('window-', '');
    windowState[id] = { open: false, minimized: false };
    attachDrag(win);

    // Bring to front on any click inside window
    win.addEventListener('mousedown', () => bringToFront(id), true);
  });

  // Close start menu on outside click
  document.addEventListener('mousedown', (e) => {
    const menu = document.getElementById('start-menu');
    const btn  = document.getElementById('start-btn');
    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
      closeStartMenu();
    }
  });

  // Global drag move
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup',   onDragEnd);

  // Start the clock
  updateClock();
  setInterval(updateClock, 1000);

  // Kick off Gateway BIOS → Win95 login → boot sequence
  runGatewayBoot();
});

// ── BOOT SEQUENCE ─────────────────────────────────────

let bootSoundFired = false;

function runGatewayBoot() {
  const overlay = document.getElementById('gateway-overlay');
  if (!overlay) { showWin95Login(); return; }

  const screen = document.getElementById('bios-text');
  if (!screen) { showWin95Login(); return; }

  const lines = [
    { delay: 80,   cls: 'bios-header', html: '🐄&nbsp; GATEWAY 2000 &nbsp;🐄&nbsp;&nbsp; BIOS v2.0.1 &nbsp;🐄' },
    { delay: 20,   cls: 'bios-dim',    text: 'Copyright © 1996 Gateway 2000, Inc. — "Any way you want it."' },
    { delay: 500,  cls: '',            text: '' },
    { delay: 200,  cls: '',            text: 'CPU : Intel® Pentium® 133MHz' },
    { delay: 400,  cls: 'bios-ok',     text: 'Memory Test : 65536K OK' },
    { delay: 350,  cls: '',            text: '' },
    { delay: 200,  cls: '',            text: 'Primary Master  : QUANTUM BIGFOOT 4.3GB' },
    { delay: 350,  cls: '',            text: 'Primary Slave   : GATEWAY 4X CD-ROM' },
    { delay: 300,  cls: 'bios-dim',    text: 'USB Controller  : Not detected.  (This is 1996. Relax.)' },
    { delay: 500,  cls: '',            text: '' },
    { delay: 250,  cls: '',            text: 'Initializing Plug and Play devices...' },
    { delay: 350,  cls: 'bios-dim',    text: 'PCI Bus v2.1  —  IRQ Steering Enabled  —  Windows 95 support: YES' },
    { delay: 600,  cls: '',            text: '' },
    { delay: 300,  cls: 'bios-warn',   text: 'Starting Windows 95...' },
  ];

  let t = 0;
  lines.forEach(line => {
    t += line.delay;
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'bios-line' + (line.cls ? ' ' + line.cls : '');
      if (line.html) el.innerHTML = line.html;
      else el.textContent = line.text;
      screen.appendChild(el);
    }, t);
  });

  // Fade out BIOS → show login (show login first so there's no flash of desktop)
  t += 1000;
  setTimeout(() => {
    showWin95Login();
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 520);
  }, t);
}

function showWin95Login() {
  const el = document.getElementById('win95-login-overlay');
  if (el) el.style.display = 'flex';
}

function doWin95Login() {
  const loginEl = document.getElementById('win95-login-overlay');
  if (loginEl) loginEl.style.display = 'none';

  // Play startup sound — this click IS the user gesture that unlocks audio
  bootSoundFired = true;
  const snd = document.getElementById('snd-win95-startup');
  if (snd) snd.play().catch(() => {});

  // Show the Windows 95 progress-bar boot screen and run it
  const bootEl = document.getElementById('boot-overlay');
  if (bootEl) bootEl.style.display = 'flex';
  runBootSequence();
}

function runBootSequence() {
  const overlay = document.getElementById('boot-overlay');
  if (!overlay) { document.dispatchEvent(new Event('bootComplete')); return; }

  const bar = document.getElementById('boot-bar-fill');
  let w = 0;
  const tick = setInterval(() => {
    w += Math.random() * 6 + 2;
    if (w >= 100) {
      w = 100;
      if (bar) bar.style.width = w + '%';
      clearInterval(tick);
      playBootSound(overlay);
      return;
    }
    if (bar) bar.style.width = w + '%';
  }, 90);
}

function playBootSound(overlay) {
  if (!bootSoundFired) {
    const snd = document.getElementById('snd-win95-startup');
    if (snd) snd.play().catch(() => {});
  }
  setTimeout(() => finishBoot(overlay), 1800);
}

function finishBoot(overlay) {
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
    document.dispatchEvent(new Event('bootComplete'));
    startIdleDetection();
  }, 720);
}

// ── IDLE SCREENSAVER ──────────────────────────────────

let idleTimer = null;
const IDLE_MS  = 30000; // 30 seconds of no activity

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (typeof ssRunning !== 'undefined' && ssRunning) return;
  idleTimer = setTimeout(() => {
    if (typeof ssRunning === 'undefined' || !ssRunning) {
      if (typeof launchScreensaver === 'function') launchScreensaver('random');
    }
  }, IDLE_MS);
}

function startIdleDetection() {
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

// ── WINDOW OPEN / CLOSE / MINIMIZE ────────────────────

function openWindow(id) {
  const el = document.getElementById('window-' + id);
  if (!el) return;

  closeStartMenu();

  const state = windowState[id] || (windowState[id] = { open: false, minimized: false });

  if (state.open && !state.minimized) {
    // Already open — just bring to front
    bringToFront(id);
    return;
  }

  // If minimized, restore; otherwise open fresh
  el.style.display = 'block';
  state.open       = true;
  state.minimized  = false;

  // Center window on first open if no position set manually
  if (!el.dataset.positioned) {
    centerWindow(el);
    el.dataset.positioned = '1';
  }

  bringToFront(id);
  updateTaskbar();
}

function closeWindow(id) {
  const el = document.getElementById('window-' + id);
  if (!el) return;
  el.style.display = 'none';
  if (windowState[id]) {
    windowState[id].open      = false;
    windowState[id].minimized = false;
  }
  updateTaskbar();
}

function minimizeWindow(id) {
  const el = document.getElementById('window-' + id);
  if (!el) return;
  el.style.display = 'none';
  if (windowState[id]) windowState[id].minimized = true;
  updateTaskbar();
}

function restoreWindow(id) {
  const el = document.getElementById('window-' + id);
  if (!el) return;
  el.style.display = 'block';
  if (windowState[id]) windowState[id].minimized = false;
  bringToFront(id);
  updateTaskbar();
}

function bringToFront(id) {
  zTop++;
  const el = document.getElementById('window-' + id);
  if (el) el.style.zIndex = zTop;
}

function centerWindow(el) {
  const taskbarH = 28;
  const w = el.offsetWidth  || 500;
  const h = el.offsetHeight || 400;
  el.style.left = Math.max(0, (window.innerWidth  - w) / 2) + 'px';
  el.style.top  = Math.max(0, (window.innerHeight - taskbarH - h) / 2) + 'px';
}

// ── TABS ──────────────────────────────────────────────

function switchTab(windowId, tabName) {
  const winEl = document.getElementById('window-' + windowId);
  if (!winEl) return;

  // Deactivate all tab buttons and panels for this window
  winEl.querySelectorAll('.win95-tab').forEach(btn => btn.classList.remove('active'));
  winEl.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));

  // Activate selected
  const panel = document.getElementById('tab-' + windowId + '-' + tabName);
  if (panel) panel.classList.remove('hidden');

  // Mark button active — find the one whose onclick contains this tabName
  winEl.querySelectorAll('.win95-tab').forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + tabName + "'")) {
      btn.classList.add('active');
    }
  });
}

// ── TASKBAR ───────────────────────────────────────────

function updateTaskbar() {
  const bar = document.getElementById('taskbar-windows');
  bar.innerHTML = '';

  Object.keys(windowState).forEach(id => {
    const state = windowState[id];
    if (!state.open) return;

    const btn = document.createElement('button');
    btn.className  = 'taskbar-win-btn' + (state.minimized ? ' minimized' : '');
    btn.textContent = WINDOW_TITLES[id] || id;
    btn.title       = WINDOW_TITLES[id] || id;
    btn.onclick = () => {
      if (state.minimized) {
        restoreWindow(id);
      } else {
        minimizeWindow(id);
      }
    };
    bar.appendChild(btn);
  });
}

// ── CLOCK ─────────────────────────────────────────────

function updateClock() {
  const now = new Date();
  let h   = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('taskbar-clock').textContent = h + ':' + m + ' ' + ampm;
}

// ── START MENU ────────────────────────────────────────

function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  const btn  = document.getElementById('start-btn');
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
  btn.classList.toggle('active', !isOpen);
}

function closeStartMenu() {
  document.getElementById('start-menu').classList.add('hidden');
  document.getElementById('start-btn').classList.remove('active');
  // Clear search when menu closes
  const searchInput = document.getElementById('start-search');
  if (searchInput) { searchInput.value = ''; filterStartMenu(''); }
}

function filterStartMenu(q) {
  const results  = document.getElementById('start-search-results');
  const itemsWrap = document.querySelector('#start-menu .start-items');
  if (!results || !itemsWrap) return;

  q = (q || '').trim().toLowerCase();

  // Restore all items when query is empty
  if (!q) {
    results.style.display = 'none';
    itemsWrap.querySelectorAll('.start-item, .start-has-sub, .start-divider, .start-sub-label')
      .forEach(el => { el.style.display = ''; });
    return;
  }

  // Collect all leaf items (top-level non-sub + submenu items)
  const candidates = [];
  itemsWrap.querySelectorAll('.start-item:not(.start-has-sub)').forEach(el => {
    if (el.closest('#start-search-results')) return;
    candidates.push({ text: el.textContent.trim(), onclick: el.getAttribute('onclick') });
  });

  results.innerHTML = '';
  const hits = candidates.filter(c => c.text.toLowerCase().includes(q));
  if (hits.length === 0) {
    results.innerHTML = '<div style="padding:4px 8px; color:#888; font-size:10px; font-style:italic;">No results</div>';
  } else {
    hits.forEach(c => {
      const el = document.createElement('div');
      el.className = 'start-item';
      el.textContent = c.text;
      if (c.onclick) el.setAttribute('onclick', c.onclick);
      results.appendChild(el);
    });
  }
  results.style.display = 'block';

  // Hide normal items while showing results
  itemsWrap.querySelectorAll('.start-item, .start-has-sub, .start-divider, .start-sub-label')
    .forEach(el => {
      if (!el.closest('.start-search-row') && !el.closest('#start-search-results')) {
        el.style.display = 'none';
      }
    });
}

// ── DRAGGING ──────────────────────────────────────────

function attachDrag(winEl) {
  const titlebar = winEl.querySelector('.win95-titlebar');
  if (!titlebar) return;

  titlebar.addEventListener('mousedown', (e) => {
    // Don't drag if clicking the control buttons
    if (e.target.closest('.win95-controls')) return;

    drag.active = true;
    drag.id     = winEl.id;

    const rect = winEl.getBoundingClientRect();
    drag.ox = e.clientX - rect.left;
    drag.oy = e.clientY - rect.top;

    e.preventDefault();
  });
}

function onDragMove(e) {
  if (!drag.active) return;
  const winEl = document.getElementById(drag.id);
  if (!winEl) return;

  const taskbarH = 28;
  let x = e.clientX - drag.ox;
  let y = e.clientY - drag.oy;

  // Constrain within viewport
  x = Math.max(0, Math.min(x, window.innerWidth  - winEl.offsetWidth));
  y = Math.max(0, Math.min(y, window.innerHeight - taskbarH - winEl.offsetHeight));

  winEl.style.left = x + 'px';
  winEl.style.top  = y + 'px';
}

function onDragEnd() {
  drag.active = false;
}

// ── SHUTDOWN ──────────────────────────────────────────

function showShutdown() {
  closeStartMenu();
  document.getElementById('shutdown-overlay').style.display = 'flex';
}

function closeShutdown() {
  document.getElementById('shutdown-overlay').style.display = 'none';
}

function doShutdown() {
  const choice = document.querySelector('input[name="shutdown"]:checked')?.value;
  closeShutdown();

  if (choice === 'cancel') return;

  // Fade the desktop to black
  const desktop = document.getElementById('desktop');
  desktop.classList.add('shutting-down');

  setTimeout(() => {
    document.body.style.background = '#000';
    document.body.innerHTML = `
      <div style="
        display:flex; align-items:center; justify-content:center;
        height:100vh; background:#000; color:#c0c0c0;
        font-family: Arial, sans-serif; font-size:14px;
        flex-direction:column; gap:16px;
      ">
        <p>It is now safe to hire Vince.</p>
        <p style="font-size:11px; color:#666;">
          <a href="mailto:vincent.darrigo@gmail.com" style="color:#888;">vincent.darrigo@gmail.com</a>
        </p>
        <button onclick="location.reload()"
          style="margin-top:12px; padding:6px 20px; background:#333; color:#c0c0c0; border:1px solid #555; cursor:pointer; font-size:11px;">
          Restart
        </button>
      </div>`;
  }, 1600);
}

// ── WELCOME DIALOG ────────────────────────────────────

function showWelcome() {
  // Inject a one-time welcome dialog
  const overlay = document.createElement('div');
  overlay.className = 'win95-modal-overlay';
  overlay.id = 'welcome-overlay';

  overlay.innerHTML = `
    <div class="win95-dialog" style="width:380px;">
      <div class="win95-titlebar" style="cursor:default;">
        <span class="win95-title-icon">💻</span>
        <span class="win95-title-text">Welcome to Vince's Portfolio</span>
      </div>
      <div class="win95-content" style="background:#c0c0c0; max-height:none; padding:16px;">
        <p style="margin-bottom:10px;">
          <strong>Welcome!</strong> You are now viewing Vince Darrigo's developer portfolio.
        </p>
        <p style="margin-bottom:10px; font-size:11px; line-height:1.6;">
          Double-click desktop icons or use the <strong>Start</strong> menu to explore projects,
          view the resume, or sign the guestbook.
        </p>
        <p style="font-size:10px; color:#555;">
          Tip: There's a hidden area somewhere on this desktop. 🔒
        </p>
      </div>
      <div class="dialog-buttons">
        <button class="win95-dialog-btn" onclick="document.getElementById('welcome-overlay').remove(); openWindow('about');">
          OK
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}
