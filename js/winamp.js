/* ═══════════════════════════════════════════════════════
   winamp.js — WinAmp 2.x Style Music Player
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── PRELOADED TRACKS ─────────────────────────────────
// Place mp3 in assets/music/ and add entries here.
const WP_PRELOADED = [
  { name: 'Weird Al Yankovic - All About the Pentiums',    src: 'assets/music/all_about_the_pentiums.mp3' },
  { name: 'Weird Al Yankovic - White & Nerdy',             src: 'assets/music/white_and_nerdy.mp3' },
  { name: 'Weird Al Yankovic - Rye or the Kaiser',         src: 'assets/music/rye_or_the_kaiser.mp3' },
  { name: 'Weird Al Yankovic - I Bought It on eBay',       src: 'assets/music/i_bought_it_on_ebay.mp3' },
  { name: 'Weird Al Yankovic - Everything You Know Is Wrong', src: 'assets/music/everything_you_know_is_wrong.mp3' },
  { name: 'Weird Al Yankovic - I Remember Larry',          src: 'assets/music/i_remember_larry.mp3' },
];

// ── STATE ─────────────────────────────────────────────
let wpAudio        = null;
let wpTracks       = [];
let wpCurrentIdx   = -1;
let wpPlaying      = false;
let wpLlamaPlayed  = false;
let wpScrollTimer  = null;
let wpScrollX      = 0;

let wpShuffle  = false;
let wpRepeat   = false;

// 7-click llama easter egg
let wpLlamaClicks = 0;
let wpLlamaTimer  = null;

// Web Audio API visualizer
let wpAudioCtx  = null;
let wpAnalyser  = null;
let wpVizAnimId = null;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-winamp');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !wpAudio) initWinamp();
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

function initWinamp() {
  wpAudio = new Audio();
  wpAudio.volume = (typeof masterVolume !== 'undefined') ? masterVolume : 0.75;
  wpAudio.addEventListener('timeupdate',     wpUpdateSeek);
  wpAudio.addEventListener('ended',          wpHandleEnded);
  wpAudio.addEventListener('loadedmetadata', wpUpdateDur);

  wpTracks = WP_PRELOADED.map(t => ({ ...t, type: 'preloaded' }));

  if (wpTracks.length > 0) {
    wpCurrentIdx = 0;
    // Set title immediately — don't wait for audio load
    wpStartScroll(wpTracks[0].name);
    // Try to play; fail silently (don't show FILE NOT FOUND)
    wpAudio.src = wpTracks[0].src;
    wpInitAudioCtx();
    wpAudio.play()
      .then(() => { wpPlaying = true; wpUpdateBtn(true); wpSetPlayState('play'); })
      .catch(() => { /* audio file not loaded yet — title already set above */ });
  } else {
    wpSetTitle('*** WINAMP ***');
  }
}

// ── PLAYBACK ──────────────────────────────────────────

function wpPlay(idx) {
  if (!wpAudio) return;
  if (idx !== undefined) wpCurrentIdx = idx;
  if (wpCurrentIdx < 0) wpCurrentIdx = 0;
  if (wpCurrentIdx >= wpTracks.length) return;

  const t = wpTracks[wpCurrentIdx];
  wpAudio.src = t.src;

  // Resume AudioContext if suspended (browser autoplay policy)
  if (wpAudioCtx && wpAudioCtx.state === 'suspended') {
    wpAudioCtx.resume().catch(() => {});
  }

  wpAudio.play()
    .then(() => {
      wpPlaying = true;
      wpUpdateBtn(true);
      wpSetPlayState('play');
      wpStartScroll(t.name);
    })
    .catch(e => {
      console.warn('WinAmp play error:', e);
      // Keep the track title — don't overwrite with FILE NOT FOUND
    });
}

function wpTogglePlay() {
  if (!wpAudio) return;

  if (wpAudioCtx && wpAudioCtx.state === 'suspended') {
    wpAudioCtx.resume().catch(() => {});
  }

  if (wpPlaying) {
    wpAudio.pause();
    wpPlaying = false;
    wpUpdateBtn(false);
    wpSetPlayState('pause');
    wpStopScroll();
  } else if (wpAudio.src && wpAudio.src !== window.location.href) {
    wpAudio.play()
      .then(() => { wpPlaying = true; wpUpdateBtn(true); wpSetPlayState('play'); })
      .catch(e => { wpSetTitle('!! FILE NOT FOUND !!'); });
  } else if (wpTracks.length > 0) {
    if (wpCurrentIdx < 0) wpCurrentIdx = 0;
    wpPlay();
  }
}

function wpPauseOnly() {
  if (!wpAudio || !wpPlaying) return;
  wpAudio.pause();
  wpPlaying = false;
  wpUpdateBtn(false);
  wpSetPlayState('pause');
  wpStopScroll();
}

function wpStop() {
  if (!wpAudio) return;
  wpAudio.pause();
  wpAudio.currentTime = 0;
  wpPlaying = false;
  wpUpdateBtn(false);
  wpSetPlayState('stop');
  wpStopScroll();
  wpSetTitle('*** STOPPED ***');
  wpUpdateSeek();
}

function wpNext() {
  if (!wpTracks.length) return;
  if (wpShuffle) {
    wpCurrentIdx = Math.floor(Math.random() * wpTracks.length);
  } else {
    wpCurrentIdx = (wpCurrentIdx + 1) % wpTracks.length;
  }
  wpPlay();
}

function wpPrev() {
  if (!wpTracks.length || !wpAudio) return;
  if (wpAudio.currentTime > 3) { wpAudio.currentTime = 0; return; }
  wpCurrentIdx = (wpCurrentIdx - 1 + wpTracks.length) % wpTracks.length;
  wpPlay();
}

function wpRew() {
  if (!wpAudio) return;
  wpAudio.currentTime = Math.max(0, wpAudio.currentTime - 5);
}

function wpFfw() {
  if (!wpAudio || !wpAudio.duration) return;
  wpAudio.currentTime = Math.min(wpAudio.duration, wpAudio.currentTime + 5);
}

function wpHandleEnded() {
  if (wpRepeat) { wpAudio.currentTime = 0; wpAudio.play().catch(() => {}); return; }
  wpNext();
}

function wpSetVol(val) {
  const v = Number(val) / 100;
  if (wpAudio) wpAudio.volume = v;
  if (typeof setMasterVolume === 'function') setMasterVolume(v);
  const pct = document.getElementById('wp-vol-pct');
  if (pct) pct.textContent = Math.round(v * 100) + '%';
}

// ── SEEK ──────────────────────────────────────────────

function wpFmtTime(sec) {
  const s = Math.floor(sec || 0);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function wpUpdateSeek() {
  if (!wpAudio) return;
  const pct = wpAudio.duration ? wpAudio.currentTime / wpAudio.duration : 0;
  const fill = document.getElementById('wp-seek-fill');
  if (fill) fill.style.width = (pct * 100) + '%';
  const knob = document.getElementById('wp-seek-knob');
  if (knob) knob.style.left = (pct * 100) + '%';

  const cur = document.getElementById('wp-time-cur');
  if (cur) cur.textContent = wpFmtTime(wpAudio.currentTime);
}

function wpUpdateDur() {
  if (!wpAudio) return;
  const dur = document.getElementById('wp-time-dur');
  if (dur) dur.textContent = wpFmtTime(wpAudio.duration);
}

function wpSeekClick(e) {
  if (!wpAudio || !wpAudio.duration) return;
  const bar = e.currentTarget;
  const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  wpAudio.currentTime = pct * wpAudio.duration;
}

// ── SKIN CLICK (play/pause anywhere on the skin) ─────

function wpSkinClick(e) {
  // Let titlebar, seek bar, and playlist handle their own events
  if (e.target.closest('.win95-titlebar') ||
      e.target.closest('#wp-seek-bar') ||
      e.target.closest('.wp-ov-playlist')) return;
  wpInitAudioCtx();
  wpTogglePlay();
}

// ── LLAMA EASTER EGG (click track 1 seven times) ─────

function wpLlamaClick(e) {
  e.stopPropagation();
  wpLlamaClicks++;
  clearTimeout(wpLlamaTimer);
  if (wpLlamaClicks >= 7) {
    wpLlamaClicks = 0;
    const llama = document.getElementById('snd-winamp-llama');
    if (llama) { llama.currentTime = 0; llama.play().catch(() => {}); }
    if (typeof foundEgg === 'function') foundEgg('winamp-llama');
  } else {
    wpLlamaTimer = setTimeout(() => { wpLlamaClicks = 0; }, 4000);
  }
}

// ── DISPLAY / UI ──────────────────────────────────────

function wpSetTitle(text) {
  const el = document.getElementById('wp-title-text');
  if (el) { el.style.transform = 'translateX(0)'; el.textContent = text; }
  wpStopScroll();
  wpScrollX = 0;
}

function wpStartScroll(name) {
  wpSetTitle(name);
  wpStopScroll();
  const el   = document.getElementById('wp-title-text');
  const wrap = document.getElementById('wp-title-wrap');
  if (!el || !wrap) return;
  if (el.scrollWidth <= wrap.clientWidth + 4) return;
  wpScrollX = 0;
  wpScrollTimer = setInterval(() => {
    wpScrollX++;
    el.style.transform = 'translateX(-' + wpScrollX + 'px)';
    if (wpScrollX >= el.scrollWidth - wrap.clientWidth + 10) wpScrollX = -40;
  }, 45);
}

function wpStopScroll() {
  clearInterval(wpScrollTimer);
  wpScrollTimer = null;
}

function wpUpdateBtn(playing) {
  const btn = document.getElementById('wp-btn-play');
  if (btn) btn.classList.toggle('wp-btn-pressed', playing);
}

function wpSetPlayState(state) {
  ['wp-dot-play','wp-dot-pause','wp-dot-stop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('wp-dot-on');
  });
  const map = { play: 'wp-dot-play', pause: 'wp-dot-pause', stop: 'wp-dot-stop' };
  if (map[state]) {
    const el = document.getElementById(map[state]);
    if (el) el.classList.add('wp-dot-on');
  }
}

// ── TOGGLE PANELS ─────────────────────────────────────

function wpToggleEq() {
  wpEqOpen = !wpEqOpen;
  const panel = document.getElementById('wp-eq-panel');
  const btn   = document.getElementById('wp-cb-eq');
  if (panel) panel.style.display = wpEqOpen ? 'block' : 'none';
  if (btn)   btn.classList.toggle('wp-clut-on', wpEqOpen);
}

function wpTogglePl() {
  wpPlOpen = !wpPlOpen;
  const panel = document.getElementById('wp-pl-panel');
  const btn   = document.getElementById('wp-cb-pl');
  if (panel) panel.style.display = wpPlOpen ? 'block' : 'none';
  if (btn)   btn.classList.toggle('wp-clut-on', wpPlOpen);
}

function wpToggleShuffle() {
  wpShuffle = !wpShuffle;
  const btn = document.getElementById('wp-cb-shuf');
  if (btn) btn.classList.toggle('wp-clut-on', wpShuffle);
}

function wpToggleRepeat() {
  wpRepeat = !wpRepeat;
  const btn = document.getElementById('wp-cb-rpt');
  if (btn) btn.classList.toggle('wp-clut-on', wpRepeat);
}

let wpEqEnabled = true;
let wpEqAuto    = false;

function wpToggleEqOn() {
  wpEqEnabled = !wpEqEnabled;
  const btn = document.getElementById('wp-eq-on-btn');
  if (btn) btn.style.opacity = wpEqEnabled ? '0.3' : '0.05';
}

function wpToggleEqAuto() {
  wpEqAuto = !wpEqAuto;
  const btn = document.getElementById('wp-eq-auto-btn');
  if (btn) btn.style.opacity = wpEqAuto ? '0.3' : '0.05';
}

// ── VISUALIZER ────────────────────────────────────────

function wpInitAudioCtx() {
  if (wpAudioCtx || !wpAudio) return;
  try {
    wpAudioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    const src   = wpAudioCtx.createMediaElementSource(wpAudio);
    wpAnalyser  = wpAudioCtx.createAnalyser();
    wpAnalyser.fftSize = 64;
    wpAnalyser.smoothingTimeConstant = 0.75;
    src.connect(wpAnalyser);
    wpAnalyser.connect(wpAudioCtx.destination);
  } catch (e) {
    console.warn('WinAmp AudioCtx:', e);
    wpAudioCtx = null;
  }
}

function wpStartViz() {
  cancelAnimationFrame(wpVizAnimId);
  const canvas = document.getElementById('wp-viz-canvas');
  if (!canvas) return;

  // Use the canvas's own CSS width (it's positioned over the display area)
  canvas.width  = canvas.offsetWidth || 152;
  canvas.height = 14;

  const ctx   = canvas.getContext('2d');
  const BARS  = 30;

  function drawFrame() {
    if (!canvas.isConnected) { cancelAnimationFrame(wpVizAnimId); return; }
    const W = canvas.width, H = canvas.height;
    const bw = Math.max(2, Math.floor((W - BARS + 1) / BARS));

    ctx.fillStyle = '#000d00';
    ctx.fillRect(0, 0, W, H);

    if (wpAnalyser && wpPlaying) {
      const data = new Uint8Array(wpAnalyser.frequencyBinCount);
      wpAnalyser.getByteFrequencyData(data);
      const step = Math.max(1, Math.floor(data.length / BARS));
      for (let i = 0; i < BARS; i++) {
        const val  = data[i * step] / 255;
        const barH = Math.max(2, Math.floor(val * H));
        ctx.fillStyle = val > 0.75 ? '#ffff00' : val > 0.45 ? '#00cc00' : '#004400';
        ctx.fillRect(i * (bw + 1), H - barH, bw, barH);
      }
    } else {
      // Idle — low green bars
      ctx.fillStyle = '#003300';
      for (let i = 0; i < BARS; i++) {
        ctx.fillRect(i * (bw + 1), H - 2, bw, 2);
      }
    }

    wpVizAnimId = requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

// ── FILE LOADING ──────────────────────────────────────

function wpLoadFiles(files) {
  if (!wpAudio) initWinamp();
  wpInitAudioCtx();
  const before = wpTracks.length;
  Array.from(files).forEach(file => {
    const url  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
    wpTracks.push({ name, src: url, type: 'user' });
  });
  wpRenderPlaylist();
  if (!wpPlaying) { wpCurrentIdx = before; wpPlay(); }
}

// ── PLAYLIST ──────────────────────────────────────────

function wpRenderPlaylist() {
  const list = document.getElementById('wp-playlist');
  if (!list) return;
  if (!wpTracks.length) {
    list.innerHTML = '<div class="wp-no-tracks">No tracks loaded</div>';
    return;
  }
  list.innerHTML = '';
  wpTracks.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'wp-track' + (i === wpCurrentIdx ? ' wp-track-active' : '');
    row.innerHTML = `<span class="wp-tracknum">${String(i + 1).padStart(2, '0')}.</span> ${wpEsc(t.name)}`;
    if (i === 0) {
      // Track 1: single click counts toward llama easter egg; double-click plays
      row.onclick    = (e) => wpLlamaClick(e);
      row.ondblclick = (e) => { e.stopPropagation(); wpPlay(0); };
    } else {
      row.ondblclick = () => wpPlay(i);
    }
    list.appendChild(row);
  });
}

function wpEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
