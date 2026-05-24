/* ═══════════════════════════════════════════════════════
   messenger.js — AIM / ICQ / Yahoo + Clippy Welcome Show
   Login sequences → three live chat windows → Clippy
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── SOUND ─────────────────────────────────────────────

function playSound(name) {
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

// ── SCRIPT (~13 min runtime) ──────────────────────────

const IM_SCRIPT = [
  { from: 'system', delay: 2500,  text: '— AOL Instant Messenger has connected —' },
  { from: 'aim',    delay: 8000,  text: 'Welcome, visitor. You\'ve got mail.' },
  { from: 'aim',    delay: 12000, text: 'Okay, technically you don\'t. This is a portfolio, not your uncle\'s Comcast inbox. But emotionally? You\'ve got mail.' },
  { from: 'login',  delay: 5000,  who: 'yahoo' },
  { from: 'yahoo',  delay: 1500,  text: 'A/S/L?' },
  { from: 'aim',    delay: 6000,  text: 'Absolutely not. We talked about this.' },
  { from: 'yahoo',  delay: 6000,  text: 'What? It\'s called user engagement.' },
  { from: 'login',  delay: 3500,  who: 'icq' },
  { from: 'system', delay: 800,   text: '— ICQ: Uh-oh! —' },
  { from: 'aim',    delay: 5500,  text: 'Oh good. The fossil is awake.' },
  { from: 'icq',    delay: 9000,  text: 'I was here before both of you. My user number had fewer digits than your entire personality.' },
  { from: 'yahoo',  delay: 9000,  text: 'Please. Nobody even knew what you were saying. "Uh-oh!" That was your whole brand.' },
  { from: 'icq',    delay: 6000,  text: 'And yet people still remember the sound.' },
  { from: 'aim',    delay: 12000, text: 'People remember lots of traumatic noises. Dial-up. Windows error chimes. The phrase "RealPlayer update available."' },
  { from: 'yahoo',  delay: 14000, text: 'Anyway! Hi there! Welcome to Vince\'s portfolio — a beautiful retro desktop where everything is clickable, probably useful, and only occasionally emotionally unstable.' },
  { from: 'icq',    delay: 12000, text: 'Look around. There are apps. Games. Projects. Evidence that this guy needs a life.' },
  { from: 'icq',    delay: 9000,  text: '...and *COUGH* rewarding professional challenges.' },
  { from: 'aim',    delay: 5000,  text: 'Subtle.' },
  { from: 'icq',    delay: 6000,  text: 'I\'m in the taskbar. Subtle is my entire job.' },
  { from: 'aim',    delay: 14000, text: 'This desktop is a curated museum of important cultural artifacts: Minesweeper, Solitaire, Paint, Snake, Tetris, and whatever deeply suspicious folder Vince labeled "DO_NOT_OPEN_FINAL_v7_REALLY_FINAL."' },
  { from: 'yahoo',  delay: 15000, text: 'There\'s also a MySpace page, because apparently the portfolio needed more glitter, social ranking anxiety, and one song that autoplays way too loudly.' },
  { from: 'aim',    delay: 7000,  text: 'Unlike some platforms, MySpace allowed self-expression.' },
  { from: 'yahoo',  delay: 6000,  text: 'Unlike some platforms, I had audibles.' },
  { from: 'icq',    delay: 5500,  text: 'Unlike both of you, I had mystery.' },
  { from: 'aim',    delay: 5000,  text: 'You had abandonment.' },
  { from: 'icq',    delay: 5000,  text: 'I had efficiency.' },
  { from: 'yahoo',  delay: 8000,  text: 'You had a flower icon and a sound effect that made everyone think their computer sneezed.' },
  { from: 'icq',    delay: 7000,  text: 'Says the purple exclamation point in witness protection.' },
  { from: 'aim',    delay: 7000,  text: 'Enough. We have a visitor to guide. Please try to act like functional software.' },
  { from: 'yahoo',  delay: 6000,  text: 'Impossible. We\'re legacy systems.' },
  { from: 'icq',    delay: 5500,  text: 'Speak for yourself. I\'m vintage infrastructure.' },
  { from: 'aim',    delay: 12000, text: 'Visitor, your mission is simple: explore the desktop. Open the projects. Play the games. Click the ridiculous things Vince absolutely spent too much time making.' },
  { from: 'yahoo',  delay: 14000, text: 'And definitely check out the serious stuff too. The portals. The AI games. The apps. The things that say "I can build useful software" but with just enough neon nonsense to prove he\'s fun at meetings.' },
  { from: 'icq',    delay: 13000, text: 'PROJECT: ECHO. Anytime Bar Trivia. Predictrix. Thinkio. IMRAface. Real builds. Real logic. Real "wait, this guy made ALL of this?" energy.' },
  { from: 'aim',    delay: 7000,  text: 'Yes. And unlike us, most of it still works.' },
  { from: 'yahoo',  delay: 5000,  text: 'Rude.' },
  { from: 'icq',    delay: 4500,  text: 'Accurate.' },
  { from: 'aim',    delay: 12000, text: 'The point is: this portfolio is not a static résumé stapled to the internet. It\'s a desktop. You\'re meant to poke around.' },
  { from: 'yahoo',  delay: 10000, text: 'Click icons. Open windows. Discover secrets. Judge fonts. Pretend it\'s 1998 and you\'re avoiding homework.' },
  { from: 'icq',    delay: 5000,  text: 'Or work.' },
  { from: 'aim',    delay: 6000,  text: 'Some of us called that "being online."' },
  { from: 'yahoo',  delay: 6000,  text: 'Some of us called that "away message poetry."' },
  { from: 'aim',    delay: 5500,  text: 'My away messages were art.' },
  { from: 'icq',    delay: 7000,  text: 'Your away messages were song lyrics and lowercase sadness.' },
  { from: 'aim',    delay: 7500,  text: 'You wouldn\'t understand. You communicated entirely through numbers and beeps.' },
  { from: 'yahoo',  delay: 6000,  text: 'At least AOL had vibes.' },
  { from: 'icq',    delay: 5000,  text: 'At least I had uptime.' },
  { from: 'aim',    delay: 5000,  text: 'Did you?' },
  { from: 'icq',    delay: 5500,  text: 'No, but I said it confidently.' },
  { from: 'yahoo',  delay: 7000,  text: 'That\'s basically modern software engineering.' },
  { from: 'aim',    delay: 6000,  text: 'Do not say that in front of recruiters.' },
  { from: 'icq',    delay: 5000,  text: 'Recruiters love confidence.' },
  { from: 'yahoo',  delay: 5000,  text: 'Recruiters love keywords.' },
  { from: 'aim',    delay: 9000,  text: 'Python. Flask. APIs. Automation. Full-stack. AI. Workflow systems. GitHub.' },
  { from: 'icq',    delay: 5000,  text: 'There. Hired.' },
  { from: 'yahoo',  delay: 5000,  text: 'Honestly? Not bad.' },
  { from: 'aim',    delay: 6500,  text: 'Of course not. I was the original professional networking tool.' },
  { from: 'yahoo',  delay: 7500,  text: 'You were teenagers asking each other what song they were listening to.' },
  { from: 'aim',    delay: 7500,  text: 'And now those teenagers are directors of engineering.' },
  { from: 'icq',    delay: 6000,  text: 'Disturbing but true.' },
  // ── Clippy arrives ────────────────────────────────
  { from: 'system', delay: 5000,  text: '— A small paperclip slides up from the corner of the screen —' },
  { from: 'clippy', delay: 9000,  text: 'It looks like you\'re trying to welcome someone to a portfolio. Would you like help with that?' },
  { from: 'aim',    delay: 5000,  text: 'No.' },
  { from: 'yahoo',  delay: 4500,  text: 'No.' },
  { from: 'icq',    delay: 4500,  text: 'No.' },
  { from: 'aim',    delay: 6000,  text: 'No, Clippy. Nobody ever wants your help.' },
  { from: 'clippy', delay: 9000,  text: 'Wow. Okay. I see the emotionally unavailable software community is still thriving.' },
  { from: 'aim',    delay: 6000,  text: 'This is a guided user experience.' },
  { from: 'yahoo',  delay: 5000,  text: 'With vibes.' },
  { from: 'icq',    delay: 4500,  text: 'And chirps.' },
  { from: 'clippy', delay: 10000, text: 'Sure. Three discontinued chat apps mocking the only one here who still understands productivity.' },
  { from: 'aim',    delay: 6000,  text: 'You interrupted the welcome.' },
  { from: 'clippy', delay: 9000,  text: 'At least I still have a job. Loose paper will always need to be clipped together.' },
  { from: 'yahoo',  delay: 7500,  text: 'That is not a job. That is office supply propaganda.' },
  { from: 'clippy', delay: 8000,  text: 'And yet here I am. Vertical. Employed. Iconic.' },
  { from: 'icq',    delay: 5500,  text: 'You live in Microsoft Word.' },
  { from: 'clippy', delay: 8000,  text: 'And you live in trivia questions about dead software.' },
  { from: 'aim',    delay: 6000,  text: 'Okay, that one hurt.' },
  { from: 'yahoo',  delay: 5000,  text: 'He got us.' },
  { from: 'clippy', delay: 8000,  text: 'Thank you. I\'ve been workshopping it since Windows XP.' },
  { from: 'aim',    delay: 9000,  text: 'Fine. Visitor, before this becomes a support ticket, please enjoy the portfolio.' },
  { from: 'yahoo',  delay: 6000,  text: 'Open the projects!' },
  { from: 'icq',    delay: 5000,  text: 'Click everything that looks suspicious.' },
  { from: 'clippy', delay: 7000,  text: 'But maybe save your work first.' },
  { from: 'aim',    delay: 7000,  text: 'Do not encourage responsible behavior. It breaks the theme.' },
  { from: 'yahoo',  delay: 11000, text: 'Have fun, explore, and remember: this whole thing was built by a developer who could have made a normal portfolio…' },
  { from: 'icq',    delay: 5500,  text: '…but chose chaos.' },
  { from: 'clippy', delay: 6500,  text: 'Structured chaos.' },
  { from: 'aim',    delay: 5500,  text: 'Fine. Structured chaos.' },
  { from: 'yahoo',  delay: 5500,  text: 'Retro chaos.' },
  { from: 'icq',    delay: 5500,  text: 'Hireable chaos.' },
  { from: 'clippy', delay: 7000,  text: 'Portfolio chaos with transferable skills.' },
  { from: 'aim',    delay: 5500,  text: 'That\'s actually not bad.' },
  { from: 'yahoo',  delay: 5500,  text: 'Clippy helped.' },
  { from: 'icq',    delay: 6000,  text: 'Do we have to apologize?' },
  { from: 'aim',    delay: 5500,  text: 'Absolutely not.' },
  { from: 'clippy', delay: 7000,  text: 'I\'ll take it.' },
  { from: 'system', delay: 5000,  text: '— The windows settle. The taskbar blinks. Somewhere, a modem screams. —' },
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
    if (!imRunning) {
      // Position control panel in bottom-left then open it
      const win = document.getElementById('window-messenger');
      if (win && !(windowState['messenger'] && windowState['messenger'].open)) {
        win.style.left = '12px';
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
  imPaused     = false;
  imManual     = false;
  imSetStatus('Playing...');
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
    });
    ['aim-login','icq-login','yahoo-login'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    hideClippyBubble();
    // Update taskbar to reflect closed messenger
    if (typeof updateTaskbar === 'function') updateTaskbar();
  };
  const t = setTimeout(cleanup, 1700);
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
