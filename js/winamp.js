/* ═══════════════════════════════════════════════════════
   winamp.js — WinAmp 2.x Style Music Player
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── PRELOADED TRACKS ─────────────────────────────────
// Drop mp3s in assets/music/ and add entries here:
// { name: 'Artist - Title', src: 'assets/music/filename.mp3' }
const WP_PRELOADED = [
  { name: 'Weird Al Yankovic - All About the Pentiums', src: 'assets/music/all_about_the_pentiums.mp3' },
];

// ── STATE ─────────────────────────────────────────────
let wpAudio       = null;
let wpTracks      = [];
let wpCurrentIdx  = -1;
let wpPlaying     = false;
let wpLlamaPlayed = false;
let wpScrollTimer = null;
let wpScrollX     = 0;

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
  wpAudio.addEventListener('ended',          wpNext);
  wpAudio.addEventListener('loadedmetadata', wpUpdateDur);

  // Seed preloaded tracks
  wpTracks = WP_PRELOADED.map(t => ({ ...t, type: 'preloaded' }));
  wpRenderPlaylist();
  wpSetTitle('*** WINAMP ***');

  // Play llama intro once
  if (!wpLlamaPlayed) {
    wpLlamaPlayed = true;
    const llama = document.getElementById('snd-winamp-llama');
    if (llama) {
      llama.volume = wpAudio.volume;
      llama.currentTime = 0;
      llama.play().catch(() => {});
    }
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
  wpAudio.play()
    .then(() => {
      wpPlaying = true;
      wpUpdateBtn(true);
      wpStartScroll(t.name);
      wpRenderPlaylist();
    })
    .catch(e => console.warn('WinAmp play:', e));
}

function wpTogglePlay() {
  if (!wpAudio) return;
  if (wpPlaying) {
    wpAudio.pause();
    wpPlaying = false;
    wpStopScroll();
    wpUpdateBtn(false);
  } else if (wpAudio.src && wpAudio.src !== window.location.href) {
    wpAudio.play().then(() => { wpPlaying = true; wpUpdateBtn(true); }).catch(() => {});
  } else if (wpTracks.length > 0) {
    if (wpCurrentIdx < 0) wpCurrentIdx = 0;
    wpPlay();
  }
}

function wpStop() {
  if (!wpAudio) return;
  wpAudio.pause();
  wpAudio.currentTime = 0;
  wpPlaying = false;
  wpStopScroll();
  wpUpdateBtn(false);
  wpSetTitle('*** STOPPED ***');
  wpUpdateSeek();
}

function wpNext() {
  if (!wpTracks.length) return;
  wpCurrentIdx = (wpCurrentIdx + 1) % wpTracks.length;
  wpPlay();
}

function wpPrev() {
  if (!wpTracks.length || !wpAudio) return;
  if (wpAudio.currentTime > 3) { wpAudio.currentTime = 0; return; }
  wpCurrentIdx = (wpCurrentIdx - 1 + wpTracks.length) % wpTracks.length;
  wpPlay();
}

function wpSetVol(val) {
  const v = Number(val) / 100;
  if (wpAudio) wpAudio.volume = v;
  if (typeof setMasterVolume === 'function') setMasterVolume(v);
  const pct = document.getElementById('wp-vol-pct');
  if (pct) pct.textContent = Math.round(v * 100) + '%';
}

// ── SEEK ──────────────────────────────────────────────

function wpUpdateSeek() {
  if (!wpAudio) return;
  const pct = wpAudio.duration ? wpAudio.currentTime / wpAudio.duration : 0;
  const fill = document.getElementById('wp-seek-fill');
  if (fill) fill.style.width = (pct * 100) + '%';

  const cur = document.getElementById('wp-time-cur');
  if (cur) {
    const s = Math.floor(wpAudio.currentTime);
    cur.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
}

function wpUpdateDur() {
  const dur = document.getElementById('wp-time-dur');
  if (!dur || !wpAudio) return;
  const s = Math.floor(wpAudio.duration || 0);
  dur.textContent = '-' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function wpSeekClick(e) {
  if (!wpAudio || !wpAudio.duration) return;
  const bar = e.currentTarget;
  const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  wpAudio.currentTime = pct * wpAudio.duration;
}

// ── DISPLAY ───────────────────────────────────────────

function wpSetTitle(text) {
  const el = document.getElementById('wp-title-text');
  if (el) { el.style.transform = 'translateX(0)'; el.textContent = text; }
  wpStopScroll();
  wpScrollX = 0;
}

function wpStartScroll(name) {
  wpSetTitle(name);
  wpStopScroll();
  const el = document.getElementById('wp-title-text');
  const wrap = document.getElementById('wp-title-wrap');
  if (!el || !wrap) return;
  // Only scroll if text overflows
  if (el.scrollWidth <= wrap.clientWidth + 4) return;

  wpScrollX = 0;
  wpScrollTimer = setInterval(() => {
    wpScrollX++;
    el.style.transform = 'translateX(-' + wpScrollX + 'px)';
    if (wpScrollX >= el.scrollWidth - wrap.clientWidth + 10) {
      wpScrollX = -40; // gap before looping
    }
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

// ── FILE LOADING ──────────────────────────────────────

function wpLoadFiles(files) {
  if (!wpAudio) initWinamp();
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
    list.innerHTML = '<div class="wp-no-tracks">No tracks — add a file below</div>';
    return;
  }
  list.innerHTML = '';
  wpTracks.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'wp-track' + (i === wpCurrentIdx ? ' wp-track-active' : '');
    row.innerHTML = `<span class="wp-tracknum">${String(i + 1).padStart(2, '0')}</span> ${wpEsc(t.name)}`;
    row.ondblclick = () => wpPlay(i);
    list.appendChild(row);
  });
}

function wpEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
