/* ═══════════════════════════════════════════════════════
   messenger.js — AIM / ICQ / Yahoo + Clippy Welcome Show
   Login sequences → three live chat windows → Clippy
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── SOUND ─────────────────────────────────────────────

function playSound(name) {
  if (masterVolume === 0) return;
  try {
    const a = document.getElementById('snd-' + name);
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {
        // File missing or blocked — fall back to synthesis for Clippy
        if (name === 'clippy-appear') synthesizeClippyBoing();
      });
    } else if (name === 'clippy-appear') {
      synthesizeClippyBoing();
    }
  } catch (_) {
    if (name === 'clippy-appear') synthesizeClippyBoing();
  }
}

// Clippy's signature boing — synthesized via Web Audio API.
// No file needed. A short ascending spring pop, ~400ms.
function synthesizeClippyBoing() {
  if (masterVolume === 0) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;

    // Layer 1: main spring tone — quick rise then descend
    const osc1  = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.linearRampToValueAtTime(1100, now + 0.04);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.42);
    gain1.gain.setValueAtTime(0,    now);
    gain1.gain.linearRampToValueAtTime(0.38, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.43);

    // Layer 2: harmonic shimmer (octave up, quieter, dies faster)
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.linearRampToValueAtTime(2200, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.28);
    gain2.gain.setValueAtTime(0,    now);
    gain2.gain.linearRampToValueAtTime(0.14, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.29);

    // Close the context after the sounds finish
    setTimeout(() => { try { ctx.close(); } catch(_){} }, 600);
  } catch (_) {}
}

// ── CAST ──────────────────────────────────────────────

const IM_BOTS = {
  aim:    { name: 'xX_AOL4Lyfe97_Xx', logId: 'aim-chat-log',   winId: 'window-aim-chat',   color: '#0000cc' },
  icq:    { name: 'UhOh_OG',          logId: 'icq-chat-log',   winId: 'window-icq-chat',   color: '#007700' },
  yahoo:  { name: 'Yahoozup',         logId: 'yahoo-chat-log', winId: 'window-yahoo-chat', color: '#6600cc' },
  clippy: { name: 'Clippy',           logId: null,             winId: null,                color: '#8b6200' },
};

// ── OPTIONAL SHORT TOUR ──────────────────────────

const IM_SCRIPT = [
  { from: 'system', delay: 1000, text: '— Connected to the Vault —' },
  { from: 'aim', delay: 4500, text: 'Welcome. Excellent connection speed for 1998.' },
  { from: 'login', delay: 1500, who: 'icq' },
  { from: 'icq', delay: 4500, text: 'Portfolio.htm has the work. The folders have the projects. The Start menu can find the rest.' },
  { from: 'login', delay: 1500, who: 'yahoo' },
  { from: 'yahoo', delay: 5500, text: 'There are games, a drawing app, and a tiny turtle that understands commands. Take your time.' },
  { from: 'aim', delay: 5500, text: 'Desktop apps run here in the browser. Public project demos open elsewhere; some need a moment to wake up.' },
  { from: 'icq', delay: 4500, text: 'Opening a project pauses this tour. We can take a hint.' },
  { from: 'clippy', delay: 5500, text: 'It looks like you are exploring an old computer. Would you like to try the Start menu?' },
  { from: 'yahoo', delay: 3500, text: 'He has waited decades to say that.' },
  { from: 'aim', delay: 5000, text: 'Sound is optional. The toolbar can quiet the extras or take you back to the main portfolio.' },
  { from: 'clippy-leave', delay: 3000 },
  { from: 'show-end', delay: 2000 },
];

// ── STATE ─────────────────────────────────────────────

let imCurrentIdx  = 0;
let imPaused      = false;
let imManual      = false;   // user clicked back → step mode
let imRunning     = false;
let imNextTimer   = null;
let imLoginDone   = false;
let imLoginTimers = [];
let imHistory     = [];      // [{type, from, elements[], isClipy}]
let imClippyVisible = false;
let aimChatShown  = false;   // door creak fires when first AIM message arrives
let imUserLeft    = false;   // user clicked Leave — block auto-restart until explicit Replay
let imPausedForReading = false;   // paused because a project/resume window is open (onReadingChanged)

// ── UTILITY ───────────────────────────────────────────

function imAfter(ms, fn) {
  const t = setTimeout(fn, ms);
  imLoginTimers.push(t);
  return t;
}

function imTypeInField(el, text, msPerChar, onDone) {
  if (!el) { if (onDone) onDone(); return; }
  el.value = '';
  let i = 0;
  const t = setInterval(() => {
    if (i < text.length) { el.value += text[i++]; }
    else { clearInterval(t); if (onDone) onDone(); }
  }, msPerChar);
  imLoginTimers.push(t);
}

function imTypePassword(el, length, msPerDot, onDone) {
  if (!el) { if (onDone) onDone(); return; }
  el.value = '';
  let i = 0;
  const t = setInterval(() => {
    if (i < length) { el.value += '●'; i++; }
    else { clearInterval(t); if (onDone) onDone(); }
  }, msPerDot);
  imLoginTimers.push(t);
}

function imFadeOut(el, onDone) {
  el.style.transition = 'opacity 0.4s';
  el.style.opacity = '0';
  imAfter(420, () => {
    el.style.display = 'none';
    el.style.opacity = '1';
    el.style.transition = '';
    if (onDone) onDone();
  });
}

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Auto-start after boot sequence completes
  document.addEventListener('bootComplete', () => {
    if (retroExtrasEnabled && !imRunning) {
      // Position control panel in bottom-right (bottom-left would cover the app icons), then open it
      const win = document.getElementById('window-messenger');
      if (win && !(windowState['messenger'] && windowState['messenger'].open)) {
        win.style.left = Math.max(12, window.innerWidth - (win.offsetWidth || 260) - 12) + 'px';
        win.style.bottom = '36px';
        win.style.top = 'auto';
        win.dataset.positioned = '1';
      }
      if (typeof openWindow === 'function') openWindow('messenger');
      startMessengerShow();
    }
  });

  // Also start when user manually opens the control panel (e.g. after replay)
  const win = document.getElementById('window-messenger');
  if (win) {
    const obs = new MutationObserver(() => {
      if (win.style.display === 'block' && !imRunning && !imUserLeft) {
        startMessengerShow();
      }
    });
    obs.observe(win, { attributes: true, attributeFilter: ['style'] });
  }
});

// ── LOGIN SEQUENCES ───────────────────────────────────

function startMessengerShow() {
  imRunning = true;
  imLoginDone = false;
  imSetStatus('Connecting...');
  doAimLogin(() => {
    imAfter(1200, () => {
      imLoginDone = true;
      startChatPhase();
    });
  });
}

function doAimLogin(onDone) {
  const screen  = document.getElementById('aim-login');
  const userEl  = document.getElementById('aim-login-user');
  const passEl  = document.getElementById('aim-login-pass');
  const statusEl = document.getElementById('aim-login-status');
  const btn     = document.getElementById('aim-login-btn');
  if (!screen) { onDone(); return; }

  screen.style.display = 'flex';
  playSound('aim-welcome');   // jingle plays when YOU log in

  imAfter(600, () => {
    imTypeInField(userEl, 'xX_AOL4Lyfe97_Xx', 75, () => {
      imAfter(350, () => {
        imTypePassword(passEl, 8, 110, () => {
          imAfter(400, () => {
            btn.classList.add('im-btn-active');
            statusEl.textContent = 'Connecting to AOL...';
            imAfter(1600, () => {
              statusEl.textContent = 'Connected! Loading buddy list...';
              imAfter(1200, () => {
                imFadeOut(screen, () => {
                  btn.classList.remove('im-btn-active');
                  statusEl.textContent = '';
                  userEl.value = ''; passEl.value = '';
                  // Don't open chat yet — door creak fires when buddy arrives
                  aimChatShown = false;
                  onDone();
                });
              });
            });
          });
        });
      });
    });
  });
}

function doIcqLogin(onDone) {
  const screen  = document.getElementById('icq-login');
  const userEl  = document.getElementById('icq-login-user');
  const passEl  = document.getElementById('icq-login-pass');
  const statusEl = document.getElementById('icq-login-status');
  const btn     = document.getElementById('icq-login-btn');
  if (!screen) { onDone(); return; }

  screen.style.display = 'flex';
  playSound('icq-horn');

  imAfter(500, () => {
    imTypeInField(userEl, '83954733', 90, () => {
      imAfter(350, () => {
        imTypePassword(passEl, 10, 100, () => {
          imAfter(400, () => {
            btn.classList.add('im-btn-active');
            statusEl.textContent = 'Connecting to ICQ server...';
            imAfter(1600, () => {
              statusEl.textContent = 'Uh-oh! You\'re online.';
              imAfter(1100, () => {
                imFadeOut(screen, () => {
                  btn.classList.remove('im-btn-active');
                  statusEl.textContent = '';
                  userEl.value = ''; passEl.value = '';
                  showImChatWindow('icq');
                  onDone();
                });
              });
            });
          });
        });
      });
    });
  });
}

function doYahooLogin(onDone) {
  const screen  = document.getElementById('yahoo-login');
  const userEl  = document.getElementById('yahoo-login-user');
  const passEl  = document.getElementById('yahoo-login-pass');
  const statusEl = document.getElementById('yahoo-login-status');
  const btn     = document.getElementById('yahoo-login-btn');
  if (!screen) { onDone(); return; }

  screen.style.display = 'flex';
  playSound('yahoo-login');

  imAfter(500, () => {
    imTypeInField(userEl, 'Yahoozup', 70, () => {
      imAfter(350, () => {
        imTypePassword(passEl, 9, 105, () => {
          imAfter(400, () => {
            btn.classList.add('im-btn-active');
            statusEl.textContent = 'Signing in to Yahoo! Messenger...';
            imAfter(1800, () => {
              statusEl.textContent = 'Yahoo! You\'re in!';
              imAfter(1000, () => {
                imFadeOut(screen, () => {
                  btn.classList.remove('im-btn-active');
                  statusEl.textContent = '';
                  userEl.value = ''; passEl.value = '';
                  showImChatWindow('yahoo');
                  onDone();
                });
              });
            });
          });
        });
      });
    });
  });
}

// ── CHAT WINDOW MANAGEMENT ────────────────────────────

const IM_WIN_POSITIONS = {
  aim:   { left: 'calc(50% - 200px)', top: '72px'  },
  icq:   { left: 'calc(50% + 60px)',  top: '100px' },
  yahoo: { left: 'calc(50% - 80px)',  top: '138px' },
};

function showImChatWindow(who) {
  const bot = IM_BOTS[who];
  const win = document.getElementById(bot.winId);
  if (!win) return;
  const pos = IM_WIN_POSITIONS[who];
  if (!win.dataset.imPositioned) {
    win.style.left = pos.left;
    win.style.top  = pos.top;
    win.dataset.imPositioned = '1';
  }
  win.style.display = 'block';
  imBringToFront(win);

  // ICQ system-tray flower appears when ICQ comes online
  if (who === 'icq') {
    const tray = document.getElementById('icq-taskbar-tray');
    if (tray) tray.style.display = 'flex';
  }
}

function icqTrayFlash() {
  const tray = document.getElementById('icq-taskbar-tray');
  if (!tray) return;
  tray.classList.remove('icq-flash');
  void tray.offsetWidth; // reflow to restart animation
  tray.classList.add('icq-flash');
}

function imBringToFront(winEl) {
  if (!winEl) return;
  zTop++;
  winEl.style.zIndex = zTop;
}

function closeImChatWindow(who) {
  const bot = IM_BOTS[who];
  const win = document.getElementById(bot.winId);
  if (win) win.style.display = 'none';
}

// ── CHAT PHASE ────────────────────────────────────────

function startChatPhase() {
  imCurrentIdx = 0;
  imHistory    = [];
  imPaused     = imPausedForReading;   // visitor opened something to read during the sign-on
  imManual     = false;
  imSetStatus(imPaused ? '⏸ Paused while you read' : 'Playing...');
  updateImControls();
  scheduleImNext();
}

function scheduleImNext() {
  clearTimeout(imNextTimer);
  if (imPaused || imManual) return;
  if (imCurrentIdx >= IM_SCRIPT.length) {
    imSetStatus('Show complete! Click ↺ to replay.');
    imRunning = false;
    return;
  }
  const line = IM_SCRIPT[imCurrentIdx];

  if (line.from === 'login') {
    imNextTimer = setTimeout(() => {
      imCurrentIdx++;
      updateImProgress();
      const loginFn = line.who === 'yahoo' ? doYahooLogin : doIcqLogin;
      loginFn(() => { scheduleImNext(); });
    }, line.delay);
    return;
  }

  imNextTimer = setTimeout(() => {
    showImLine(imCurrentIdx);
    imCurrentIdx++;
    updateImProgress();
    scheduleImNext();
  }, line.delay);
}

function showImLine(idx) {
  const line = IM_SCRIPT[idx];
  const { from, text } = line;

  if (from === 'system') {
    const els = appendImSystemToAll(text);
    imHistory.push({ type: 'system', from, elements: els });
    mirrorToHistory(null, text, true);
    // Clippy rises on the paperclip line
    if (text.includes('paperclip')) {
      showClippyBubble(null);
    }
    return;
  }

  if (from === 'clippy') {
    const wasVisible = imClippyVisible;
    showClippyBubble(text);
    mirrorToHistory('clippy', text, false);
    imHistory.push({ type: 'clippy', from, elements: [], prevVisible: wasVisible });
    return;
  }

  if (from === 'clippy-leave') {
    const bubble = document.getElementById('clippy-bubble');
    if (bubble) {
      bubble.classList.remove('clippy-slide-in');
      imAfter(500, () => {
        bubble.style.display = 'none';
        imClippyVisible = false;
      });
    }
    imHistory.push({ type: 'clippy-leave', from, elements: [] });
    return;
  }

  if (from === 'show-end') {
    imRunning  = false;
    imUserLeft = true;
    imSetStatus('💬 Standby');
    const replayBtn = document.getElementById('im-btn-replay');
    if (replayBtn) replayBtn.style.display = 'none';
    // Mark chat windows as open so they appear in taskbar after minimizing
    ['aim-chat', 'icq-chat', 'yahoo-chat'].forEach(id => {
      const el = document.getElementById('window-' + id);
      if (el && el.style.display !== 'none') {
        if (windowState && windowState[id]) windowState[id].open = true;
      }
    });
    // Stagger-minimize: chats then control panel
    imAfter(400,  () => { if (typeof minimizeWindow === 'function') minimizeWindow('aim-chat');   });
    imAfter(900,  () => { if (typeof minimizeWindow === 'function') minimizeWindow('icq-chat');   });
    imAfter(1400, () => { if (typeof minimizeWindow === 'function') minimizeWindow('yahoo-chat'); });
    imAfter(2200, () => { if (typeof minimizeWindow === 'function') minimizeWindow('messenger');  });
    imHistory.push({ type: 'show-end', from, elements: [] });
    return;
  }

  const bot = IM_BOTS[from];
  const log = document.getElementById(bot.logId);
  if (!log) return;

  // First AIM message: door creak as buddy "arrives", then open chat window
  if (from === 'aim' && !aimChatShown) {
    aimChatShown = true;
    playSound('aim-door');
    showImChatWindow('aim');
  }

  const el = document.createElement('div');
  el.className = 'im-chat-msg';
  el.innerHTML = `<span class="im-chat-name" style="color:${bot.color}">${escHtml(bot.name)}:</span> ${escHtml(text)}`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;

  // Bring speaker's window to front
  const win = document.getElementById(bot.winId);
  if (win) imBringToFront(win);

  playSound(from + '-receive');
  if (from === 'icq') icqTrayFlash();

  mirrorToHistory(from, text, false);
  imHistory.push({ type: 'chat', from, elements: [el], logEl: log });
}

function appendImSystemToAll(text) {
  const logs = ['aim-chat-log', 'icq-chat-log', 'yahoo-chat-log'];
  return logs.map(id => {
    const log = document.getElementById(id);
    if (!log) return null;
    const el = document.createElement('div');
    el.className = 'im-chat-system';
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }).filter(Boolean);
}

// ── CLIPPY BUBBLE ─────────────────────────────────────

function showClippyBubble(text) {
  const bubble = document.getElementById('clippy-bubble');
  if (!bubble) return;
  imClippyVisible = true;
  bubble.style.display = 'flex';
  if (text) {
    document.getElementById('clippy-text').textContent = text;
    playSound('clippy-appear');
    // Animate slide-in
    bubble.classList.remove('clippy-slide-in');
    void bubble.offsetWidth; // reflow
    bubble.classList.add('clippy-slide-in');
  }
}

function hideClippyBubble() {
  const bubble = document.getElementById('clippy-bubble');
  if (bubble) bubble.style.display = 'none';
  imClippyVisible = false;
}

// ── CONTROLS ──────────────────────────────────────────

function imTogglePause() {
  if (imPaused || imManual) {
    imPaused = false;
    imManual = false;
    imPausedForReading = false;   // visitor explicitly asked for the show back
    imSetStatus('Playing...');
    updateImControls();
    scheduleImNext();
  } else {
    clearTimeout(imNextTimer);
    imPaused = true;
    imSetStatus('Paused.');
    updateImControls();
  }
}

function imBack() {
  if (imHistory.length === 0) return;
  clearTimeout(imNextTimer);
  imPaused = false;
  imManual = true;
  imSetStatus('Manual mode — ▶▶ to advance');
  updateImControls();

  const item = imHistory.pop();
  imCurrentIdx--;

  if (item.type === 'system') {
    item.elements.forEach(el => el && el.parentNode && el.parentNode.removeChild(el));
    // If the system message was the Clippy arrival, hide Clippy
    if (imCurrentIdx < IM_SCRIPT.length) {
      const line = IM_SCRIPT[imCurrentIdx];
      if (line && line.text && line.text.includes('paperclip')) {
        hideClippyBubble();
      }
    }
  } else if (item.type === 'chat') {
    item.elements.forEach(el => el && el.parentNode && el.parentNode.removeChild(el));
  } else if (item.type === 'clippy') {
    // Restore previous Clippy state
    if (!item.prevVisible) {
      hideClippyBubble();
    } else {
      // Find the previous Clippy message in script
      for (let i = imCurrentIdx - 1; i >= 0; i--) {
        if (IM_SCRIPT[i].from === 'clippy') {
          showClippyBubble(IM_SCRIPT[i].text);
          break;
        }
      }
    }
  } else if (item.type === 'clippy-leave') {
    // Re-show Clippy with the last message it had
    for (let i = imCurrentIdx - 1; i >= 0; i--) {
      if (IM_SCRIPT[i].from === 'clippy') {
        showClippyBubble(IM_SCRIPT[i].text);
        break;
      }
    }
  } else if (item.type === 'show-end') {
    // Undo standby: restore chat windows and replay button
    imUserLeft = false;
    const replayBtn = document.getElementById('im-btn-replay');
    if (replayBtn) replayBtn.style.display = '';
    ['aim-chat', 'icq-chat', 'yahoo-chat'].forEach(id => {
      if (typeof restoreWindow === 'function') restoreWindow(id);
    });
  }
  updateImProgress();
}

function imForward() {
  if (!imManual) return;
  if (imCurrentIdx >= IM_SCRIPT.length) {
    imManual = false;
    imSetStatus('Show complete! Click ↺ to replay.');
    updateImControls();
    return;
  }

  const line = IM_SCRIPT[imCurrentIdx];
  if (line.from === 'login') {
    imCurrentIdx++;
    updateImProgress();
    // Fire login in background so the window appears, don't block forward
    const loginFn = line.who === 'yahoo' ? doYahooLogin : doIcqLogin;
    loginFn(() => {});
    return;
  }

  showImLine(imCurrentIdx);
  imCurrentIdx++;
  updateImProgress();

  if (imCurrentIdx >= IM_SCRIPT.length) {
    imManual = false;
    imSetStatus('Show complete! Click ↺ to replay.');
    updateImControls();
  }
}

function replayMessenger() {
  // Clear all timers
  clearTimeout(imNextTimer);
  imLoginTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
  imLoginTimers = [];

  // Reset state
  imCurrentIdx    = 0;
  imHistory       = [];
  imPaused        = false;
  imManual        = false;
  imRunning       = false;
  imLoginDone     = false;
  imClippyVisible = false;
  aimChatShown    = false;
  imUserLeft      = false;

  // Hide login screens
  ['aim-login','icq-login','yahoo-login'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.style.opacity = '1'; }
  });

  // Clear chat logs
  ['aim-chat-log','icq-chat-log','yahoo-chat-log'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });

  // Reset input fields
  ['aim-login-user','aim-login-pass','icq-login-user','icq-login-pass',
   'yahoo-login-user','yahoo-login-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['aim-login-status','icq-login-status','yahoo-login-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  // Hide chat windows (will re-appear during login)
  ['window-aim-chat','window-icq-chat','window-yahoo-chat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Restore replay button (may have been hidden by show-end)
  const replayBtn = document.getElementById('im-btn-replay');
  if (replayBtn) replayBtn.style.display = '';

  // Hide Clippy
  hideClippyBubble();

  // Hide ICQ tray
  const tray = document.getElementById('icq-taskbar-tray');
  if (tray) tray.style.display = 'none';

  updateImProgress();
  imSetStatus('Restarting...');

  setTimeout(() => {
    imRunning = true;
    startMessengerShow();
  }, 300);
}

// ── STATUS + PROGRESS ─────────────────────────────────

function imSetStatus(text) {
  const el = document.getElementById('im-ctrl-status');
  if (el) el.textContent = text;
}

function updateImProgress() {
  const bar = document.getElementById('im-progress-fill');
  if (bar) bar.style.width = Math.round((imCurrentIdx / IM_SCRIPT.length) * 100) + '%';
}

function updateImControls() {
  const btnPP = document.getElementById('im-btn-playpause');
  if (btnPP) btnPP.textContent = (imPaused || imManual) ? '▶' : '⏸';
}

// ── SCENE INTEROP (called by project_scenes.js) ───────

function pauseImShow(label) {
  if (!imRunning || imPaused || imManual) return;
  clearTimeout(imNextTimer);
  imPaused = true;
  imSetStatus(label || '⏸ Scene playing...');
  updateImControls();
}

function resumeImShow() {
  if (imPausedForReading) return;   // visitor is still reading — onReadingChanged resumes later
  if (!imRunning || !imPaused) return;
  imPaused = false;
  imSetStatus('Playing...');
  updateImControls();
  scheduleImNext();
}

// ── READING INTEROP (called by desktop.js) ────────────
// While the visitor reads a project / resume window, the show pauses and its sign-on
// screens drop behind that window; it picks back up once they close or minimize it.

function onReadingChanged() {
  const reading = typeof isReading === 'function' && isReading();
  document.querySelectorAll('.im-login-screen').forEach(el => { el.style.zIndex = reading ? '99' : ''; });
  if (reading && imRunning && !imPaused && !imManual) {
    pauseImShow('⏸ Paused while you read');
    imPausedForReading = true;
  } else if (!reading && imPausedForReading) {
    imPausedForReading = false;
    resumeImShow();
  }
}

// ── LEAVE CHAT ────────────────────────────────────────

function leaveChat() {
  clearTimeout(imNextTimer);
  imLoginTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
  imLoginTimers = [];
  imRunning  = false;
  imPaused   = true;
  imUserLeft = true;   // block auto-restart on window open

  playSound('aim-leaving');

  // Close everything after door-close sound plays
  const cleanup = () => {
    ['window-aim-chat','window-icq-chat','window-yahoo-chat','window-messenger'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
      const key = id.replace('window-', '');
      if (windowState[key]) { windowState[key].open = false; windowState[key].minimized = false; }
    });
    ['aim-login','icq-login','yahoo-login'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    hideClippyBubble();
    // Update taskbar to reflect closed messenger
    if (typeof updateTaskbar === 'function') updateTaskbar();
  };
  const t = setTimeout(cleanup, masterVolume === 0 ? 0 : 1700);
  imLoginTimers.push(t);
}

// ── VIEW CONVERSATION ─────────────────────────────────

function openImHistory() {
  if (typeof openWindow === 'function') openWindow('chat-history');
}

function mirrorToHistory(from, text, isSystem) {
  const log = document.getElementById('chat-history-log');
  if (!log) return;
  const el = document.createElement('div');
  if (isSystem) {
    el.style.cssText = 'color:#888; font-style:italic; font-size:10px; text-align:center; padding:3px 0; border-bottom:1px solid #eee;';
    el.textContent = text;
  } else {
    const bot = from === 'clippy' ? { name: 'Clippy', color: '#8b6200' } : IM_BOTS[from];
    if (!bot) return;
    el.style.cssText = 'margin-bottom:3px;';
    el.innerHTML = `<span style="font-weight:bold;color:${bot.color}">${escHtml(bot.name)}:</span> ${escHtml(text)}`;
  }
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

// ── HELPERS ───────────────────────────────────────────

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
