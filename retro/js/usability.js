/* Desktop behavior shared by the retro apps. Windows are non-modal. */
function constrainWindow(el) {
  if (!el || el.style.display === 'none') return;
  const rect = el.getBoundingClientRect();
  const maxX = Math.max(8, window.innerWidth - rect.width - 8);
  const maxY = Math.max(68, window.innerHeight - rect.height - 36);
  el.style.left = Math.max(8, Math.min(rect.left, maxX)) + 'px';
  el.style.top = Math.max(68, Math.min(rect.top, maxY)) + 'px';
  el.style.bottom = 'auto';
}

function arrangeWindows() {
  let offset = 0;
  document.querySelectorAll('.win95-window').forEach(el => {
    if (el.style.display !== 'block') return;
    el.classList.remove('window-maximized');
    const availableLeft = window.innerWidth > 1100 ? 236 : 8;
    el.style.left = Math.max(availableLeft, (window.innerWidth - el.offsetWidth) / 2) + offset + 'px';
    el.style.top = 76 + offset + 'px';
    constrainWindow(el);
    offset = (offset + 24) % 120;
  });
}

function focusTopWindow() {
  const wins = [...document.querySelectorAll('.win95-window')]
    .filter(el => el.style.display === 'block')
    .sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0));
  if (wins.length) {
    bringToFront(wins[0].id.replace('window-', ''));
    wins[0].focus({ preventScroll: true });
  } else {
    activeWindowId = null;
    document.getElementById('start-btn').focus({ preventScroll: true });
  }
}

function toggleVaultSound() {
  setMasterVolume(masterVolume > 0 ? 0 : 0.65);
}

function toggleVaultExtras() {
  retroExtrasEnabled = !retroExtrasEnabled;
  const button = document.getElementById('vault-extras');
  button.textContent = retroExtrasEnabled ? 'Extras on' : 'Extras off';
  button.setAttribute('aria-pressed', String(retroExtrasEnabled));
  if (retroExtrasEnabled) {
    imUserLeft = false;
    openWindow('messenger');
    resetIdleTimer();
    initPopups();
  } else {
    leaveChat();
    clearTimeout(idleTimer);
    clearTimeout(popupTimer);
    PROJECT_SCENE_WINDOWS.forEach(stopProjectScene);
    document.querySelectorAll('.pop-window').forEach(el => el.remove());
    updateTaskbar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const openLinkedApp = () => {
    const id = location.hash.slice(1);
    if (['ispyai', 'trivia', 'predictrix', 'learning', 'questourism', 'vault', 'resume'].includes(id)) openWindow(id);
  };
  document.addEventListener('bootComplete', openLinkedApp);
  window.addEventListener('hashchange', () => { if (bootCompleted) openLinkedApp(); });
  document.getElementById('start-search').setAttribute('aria-label', 'Search desktop programs');
  document.getElementById('start-btn').setAttribute('aria-expanded', 'false');
  document.getElementById('start-btn').setAttribute('aria-controls', 'start-menu');
  document.querySelectorAll('.desk-icon[ondblclick], .folder-item[ondblclick], .start-item').forEach(el => {
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    if (el.classList.contains('desk-icon')) {
      el.setAttribute('aria-label', 'Open ' + el.querySelector('.desk-icon-label').textContent.trim());
    }
    if (el.classList.contains('start-has-sub')) {
      el.setAttribute('aria-label', el.childNodes[2]?.textContent.trim() || 'Programs');
    }
  });
  document.querySelectorAll('.win95-window').forEach(el => {
    const id = el.id.replace('window-', '');
    const title = el.querySelector('.win95-title-text');
    el.setAttribute('role', 'dialog');
    el.tabIndex = -1;
    if (title) {
      title.id = 'window-title-' + id;
      el.setAttribute('aria-labelledby', title.id);
    } else el.setAttribute('aria-label', WINDOW_TITLES[id] || id);
    const min = el.querySelector('.win95-ctrl:not(.win95-close)');
    if (min) min.setAttribute('aria-label', 'Minimize ' + (WINDOW_TITLES[id] || id));
    const close = el.querySelector('.win95-close');
    if (close) close.setAttribute('aria-label', 'Close ' + (WINDOW_TITLES[id] || id));
    let maximize = el.querySelector('.win95-ctrl[disabled]');
    if (!maximize && READING_WINDOWS.includes(id) && el.querySelector('.win95-controls')) {
      maximize = document.createElement('button');
      maximize.type = 'button';
      maximize.className = 'win95-ctrl';
      maximize.textContent = '□';
      el.querySelector('.win95-controls').insertBefore(maximize, close);
    }
    if (maximize && READING_WINDOWS.includes(id)) {
      let restorePosition;
      maximize.disabled = false;
      maximize.setAttribute('aria-label', 'Maximize or restore ' + (WINDOW_TITLES[id] || id));
      maximize.onclick = () => {
        const expanding = !el.classList.contains('window-maximized');
        if (expanding) restorePosition = { left: el.style.left, top: el.style.top, bottom: el.style.bottom };
        el.classList.toggle('window-maximized', expanding);
        maximize.setAttribute('aria-pressed', String(expanding));
        if (!expanding) {
          Object.assign(el.style, restorePosition);
          constrainWindow(el);
        }
      };
    }
  });
  document.addEventListener('focusin', event => {
    const win = event.target.closest('.win95-window');
    if (win && activeWindowId !== win.id.replace('window-', '')) bringToFront(win.id.replace('window-', ''));
  });
  // Enter / Space activate the same declared action as pointer input.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.getElementById('start-menu').classList.contains('hidden')) {
      closeStartMenu();
      document.getElementById('start-btn').focus();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const el = event.target.closest('.desk-icon[ondblclick], .folder-item[ondblclick], .start-item[onclick]');
    if (!el) return;
    event.preventDefault();
    el.dispatchEvent(new MouseEvent(el.hasAttribute('ondblclick') ? 'dblclick' : 'click', { bubbles: true }));
  });
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => document.querySelectorAll('.win95-window').forEach(constrainWindow));
  });
});

// Closing or minimizing a game pauses its loop; reopening preserves the board.
function suspendDesktopApp(id) {
  if (id === 'snake') {
    clearInterval(snk.timer);
    if (snk.status === 'playing') { snk.status = 'paused'; renderSnake(); }
    const ring = document.getElementById('snd-nokia-ring');
    if (ring) { ring.pause(); ring.currentTime = 0; }
  }
  if (id === 'tetris') {
    clearInterval(tetTimer);
    if (tetStatus === 'playing') { tetStatus = 'paused'; renderTetris(); }
    tetStopMusic();
  }
  if (id === 'gwbasic' && gwbRunning) gwbStop();
  if (id === 'weatherbug') {
    clearInterval(wbClockTimer); clearInterval(wbRotateTimer);
    wbClockTimer = null; wbRotateTimer = null;
  }
  if (id === 'winamp') { cancelAnimationFrame(wpVizAnimId); wpStopScroll(); }
  if (id === 'limester') {
    clearInterval(lsProgressInterval); clearInterval(lsConnectingTimer); clearTimeout(lsStartupTimer);
    if (!lsFilesReady) lsInitialized = false;
  }
  if (id === 'minesweeper') { clearInterval(mineTimerInt); mineTimerInt = null; }
  if (id === 'tamagotchi') {
    clearInterval(tamaTimer); clearInterval(tamaAnimTimer);
    tamaTimer = null; tamaAnimTimer = null; saveTama();
  }
}

function resumeDesktopApp(id) {
  if (document.hidden) return;
  if (id === 'weatherbug' && wbInitialized) { wbStartClock(); wbStartRotation(); }
  if (id === 'winamp' && wpAudio && wpPlaying) { wpStartViz(); wpStartScroll(wpTracks[wpCurrentIdx].name); }
  if (id === 'limester') {
    if (!lsInitialized) lsRunStartupSequence();
    else if (lsFilesReady) lsAnimateInProgress();
  }
  if (id === 'minesweeper' && mineGameState === 'playing' && !mineTimerInt) {
    mineTimerInt = setInterval(() => { mineTimer = Math.min(999, mineTimer + 1); setTimerLED(mineTimer); }, 1000);
  }
  if (id === 'tamagotchi' && tama && !tamaTimer) { tamaTimer = setInterval(tamaTick, TAMA_TICK); startTamaAnim(); }
}

document.addEventListener('visibilitychange', () => {
  Object.keys(windowState).forEach(id => {
    if (!windowState[id].open || windowState[id].minimized) return;
    if (document.hidden) suspendDesktopApp(id);
    else resumeDesktopApp(id);
  });
});
