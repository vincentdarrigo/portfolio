/* ═══════════════════════════════════════════════════════
   limester.js — LimeSter 2.4 P2P "File Sharing"
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── FILE MANIFEST ────────────────────────────────────

const LS_FILES = [
  { name: 'resume_final_FINAL_v7_REALLY_FINAL.doc', user: 'VinceDarrigo',    size: '328 KB',  pct: 100, open: () => openWindow('resume')      },
  { name: 'project_echo_complete_walkthrough.avi',  user: 'MothershipAV',    size: '47.2 MB', pct: 74,  open: () => openWindow('projects')    },
  { name: 'imraface_portal_demo_hq.mp4',            user: 'VinceDarrigo',    size: '18.6 MB', pct: 42,  open: () => openWindow('projects')    },
  { name: 'all_about_the_pentiums_320kbps.mp3',     user: 'WeirdAl_Rips',    size: '4.1 MB',  pct: 100, open: () => openWindow('winamp')      },
  { name: 'anytime_bar_trivia_sourcecode.zip',      user: 'VinceDarrigo',    size: '892 KB',  pct: 88,  open: () => openWindow('projects')    },
  { name: 'predictrix_trained_model_v3.dat',        user: 'VinceDarrigo',    size: '2.3 MB',  pct: 56,  open: null                            },
  { name: 'not_a_virus_TOTALLY_SAFE_i_promise.exe', user: 'TrustMeCorp',     size: '512 B',   pct: 100, open: null,  sketchy: true            },
  { name: 'free_ram_booster_2001.exe',              user: 'FreewareZone99',  size: '48 KB',   pct: 100, open: null,  virus: true               },
];

// ── STATE ─────────────────────────────────────────────

let lsInitialized = false;
let lsProgressInterval = null;

// ── AUTO-START AFTER BOOT ─────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('bootComplete', () => {
    // Open LimeSter 13 seconds after boot — feels like it auto-launched
    setTimeout(() => {
      if (typeof openWindow === 'function') openWindow('limester');
      lsRunStartupSequence();
    }, 13000);
  });

  // Also init if manually opened
  const win = document.getElementById('window-limester');
  if (win) {
    const obs = new MutationObserver(() => {
      if (win.style.display === 'block' && !lsInitialized) {
        lsRunStartupSequence();
      }
    });
    obs.observe(win, { attributes: true, attributeFilter: ['style'] });
  }
});

// ── STARTUP SEQUENCE ──────────────────────────────────

function lsRunStartupSequence() {
  if (lsInitialized) return;
  lsInitialized = true;

  const list   = document.getElementById('ls-download-list');
  const status = document.getElementById('ls-status-text');

  if (status) status.textContent = 'Initializing LimeSter network...';
  if (list)   list.innerHTML = '<div class="ls-connecting">Searching for peers... please wait</div>';

  // Count up peers to show "connecting" feel
  let peers = 0;
  const iv = setInterval(() => {
    peers += Math.floor(Math.random() * 180 + 40);
    if (list) list.innerHTML = `<div class="ls-connecting">Connecting to LimeSter network...<br>${peers.toLocaleString()} peers found</div>`;
    if (peers >= 1200) {
      clearInterval(iv);
      if (status) status.textContent = `Connected — ${peers.toLocaleString()} users online | 🔥 Firewall: OFF`;
      setTimeout(lsRenderFiles, 600);
    }
  }, 260);

  // Auto-minimize after 11 seconds — like it quietly moved to background
  setTimeout(() => {
    if (typeof minimizeWindow === 'function') minimizeWindow('limester');
  }, 11000);
}

// ── RENDER FILE LIST ──────────────────────────────────

function lsRenderFiles() {
  const list = document.getElementById('ls-download-list');
  if (!list) return;

  list.innerHTML = '';
  LS_FILES.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'ls-file-row' + (f.virus ? ' ls-virus' : f.sketchy ? ' ls-sketchy' : '');
    row.title = f.pct === 100 ? 'Double-click to open' : 'Downloading...';

    const icon = f.virus ? '⚠️' : (f.sketchy ? '⚠️' : (f.pct === 100 ? '✅' : '⬇️'));

    row.innerHTML =
      `<span class="ls-file-icon">${icon}</span>` +
      `<span class="ls-file-name">${escLs(f.name)}</span>` +
      `<span class="ls-file-user" style="font-size:9px;color:#777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escLs(f.user)}</span>` +
      `<span class="ls-file-size" style="font-size:10px;text-align:right;">${f.size}</span>` +
      `<span class="ls-file-bar"><div class="ls-bar-track"><div class="ls-bar-fill${f.pct===100?' ls-bar-done':''}" id="ls-bar-${i}" style="width:${f.pct}%"></div></div></span>` +
      `<span class="ls-file-pct" id="ls-pct-${i}" style="font-size:9px;text-align:right;">${Math.floor(f.pct)}%</span>`;

    if (f.virus) {
      row.ondblclick = lsVirusWarning;
    } else if (f.sketchy) {
      row.ondblclick = lsSketchyWarning;
    } else if (f.open && f.pct === 100) {
      row.ondblclick = f.open;
    }

    list.appendChild(row);
  });

  lsAnimateInProgress();
}

function lsAnimateInProgress() {
  clearInterval(lsProgressInterval);
  lsProgressInterval = setInterval(() => {
    LS_FILES.forEach((f, i) => {
      if (f.pct < 100) {
        f.pct = Math.min(100, f.pct + Math.random() * 0.25);
        const bar = document.getElementById('ls-bar-' + i);
        const pct = document.getElementById('ls-pct-' + i);
        if (bar) bar.style.width = f.pct + '%';
        if (pct) pct.textContent = Math.floor(f.pct) + '%';
        if (f.pct >= 100) {
          if (bar) bar.classList.add('ls-bar-done');
          const row = bar && bar.closest('.ls-file-row');
          if (row) { row.title = 'Double-click to open'; }
          const icon = document.querySelector(`#ls-download-list .ls-file-row:nth-child(${i+1}) .ls-file-icon`);
          if (icon) icon.textContent = '✅';
        }
      }
    });
  }, 200);
}

// ── POPUPS ────────────────────────────────────────────

function lsVirusWarning() {
  lsShowPopup(`
    <p style="margin:0 0 8px;"><strong>⚠️ Security Warning</strong></p>
    <p style="margin:0 0 8px;font-size:10px;">You are about to run <code>free_ram_booster_2001.exe</code></p>
    <p style="margin:0 0 8px;font-size:10px;color:#555;">This file is flagged by 14 users. It claims to boost your RAM.<br>
    It will actually launch a logic puzzle you cannot easily escape.</p>
    <p style="margin:0 0 12px;font-size:10px;color:#888;">Author: FreewareZone99 &nbsp;|&nbsp; 10,892 downloads &nbsp;|&nbsp; Rating: ⭐</p>
    <div style="display:flex;gap:6px;justify-content:center;">
      <button class="win95-btn" onclick="openWindow('minesweeper'); this.closest('.ls-popup-overlay').remove();">Run Anyway</button>
      <button class="win95-btn" onclick="this.closest('.ls-popup-overlay').remove();">Cancel</button>
    </div>`);
}

function lsSketchyWarning() {
  lsShowPopup(`
    <p style="margin:0 0 8px;"><strong>⚠️ Note from LimeSter</strong></p>
    <p style="margin:0 0 12px;font-size:10px;">File downloaded successfully.<br><br>
    This file contains zero viruses.<br>
    <em>(The author of this file asked us to say that.)</em></p>
    <div style="display:flex;justify-content:center;">
      <button class="win95-btn" onclick="this.closest('.ls-popup-overlay').remove();">OK I Guess</button>
    </div>`);
}

function lsShowPopup(html) {
  const overlay = document.createElement('div');
  overlay.className = 'ls-popup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9998;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#c0c0c0;border:2px outset #fff;width:340px;font-family:Tahoma,Arial,sans-serif;font-size:11px;">
      <div style="background:linear-gradient(to right,#000080,#1084d0);color:#fff;padding:3px 7px;display:flex;align-items:center;justify-content:space-between;font-size:11px;">
        <span>🌐 Internet Security</span>
        <button onclick="this.closest('.ls-popup-overlay').remove()" style="background:#c0c0c0;border:1px outset #fff;cursor:pointer;font-size:9px;padding:0 3px;line-height:12px;">✕</button>
      </div>
      <div style="padding:14px 16px;">${html}</div>
    </div>`;
  document.body.appendChild(overlay);
}

// ── SEARCH (fake) ─────────────────────────────────────

function lsSearch() {
  const input = document.getElementById('ls-search-input');
  const q = (input ? input.value : '').trim();
  if (!q) return;

  const list = document.getElementById('ls-download-list');
  if (!list) return;
  clearInterval(lsProgressInterval);
  list.innerHTML = `<div class="ls-connecting">Searching for "${escLs(q)}" across 1,247 peers...</div>`;

  setTimeout(() => {
    list.innerHTML = `<div class="ls-connecting" style="color:#a00;">
      Search complete: 0 results for "${escLs(q)}".<br>
      <small style="color:#888;">(LimeSter works best for files that technically don't exist.)<br>
      Try searching for "resume_final_FINAL" or "free_ram"</small>
    </div>`;
    setTimeout(lsRenderFiles, 2500);
  }, 1600);
}

function lsSearchKey(e) {
  if (e.key === 'Enter') lsSearch();
}

// ── HELPERS ───────────────────────────────────────────

function escLs(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
