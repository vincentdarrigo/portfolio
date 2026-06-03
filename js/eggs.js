/* ═══════════════════════════════════════════════════════
   eggs.js — Easter Egg Tracker
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

const EGGS = [
  { id: 'winamp-llama', name: '🦙 The Llama Lives!',      hint: 'A certain media player hides a very well-known llama.' },
  { id: 'sol-cascade',  name: '🃏 Card Cascade',           hint: 'Some games end with a lot of fanfare — if you actually finish them.' },
  { id: 'nokia-kick',   name: '📱 Nokia Kick',             hint: 'The most recognizable ringtone in history lives somewhere in here.' },
  { id: 'konami',       name: '🕹️ The Code',              hint: '↑↑↓↓←→←→ … you know the rest.' },
];

const EGG_KEY = 'mb_eggs_v1';
let eggsFound = {};

(function loadEggs() {
  try { eggsFound = JSON.parse(localStorage.getItem(EGG_KEY) || '{}'); } catch (_) { eggsFound = {}; }
})();

function foundEgg(id) {
  if (eggsFound[id]) return;
  eggsFound[id] = true;
  localStorage.setItem(EGG_KEY, JSON.stringify(eggsFound));
  showEggToast(id);
}

function showEggToast(id) {
  const egg  = EGGS.find(e => e.id === id);
  const name = egg ? egg.name : id;
  const toast  = document.getElementById('egg-toast');
  const nameEl = document.getElementById('egg-toast-name');
  const countEl= document.getElementById('egg-toast-count');
  if (!toast || !nameEl) return;

  nameEl.textContent  = name;
  if (countEl) {
    const { found, total } = getEggStats();
    countEl.textContent = `${found} of ${total} found`;
  }

  toast.style.display = 'flex';
  toast.classList.remove('egg-toast-out');
  void toast.offsetWidth;
  toast.classList.add('egg-toast-in');

  setTimeout(() => {
    toast.classList.remove('egg-toast-in');
    toast.classList.add('egg-toast-out');
    setTimeout(() => { toast.style.display = 'none'; toast.classList.remove('egg-toast-out'); }, 600);
  }, 3200);
}

function getEggStats() {
  const found = EGGS.filter(e => eggsFound[e.id]).length;
  return { found, total: EGGS.length };
}
