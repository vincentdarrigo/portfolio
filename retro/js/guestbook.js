/* ═══════════════════════════════════════════════════════
   guestbook.js — MySpace Guestbook Comment System
   Vince Darrigo / The Mothership

   Comments stored in localStorage (client-side demo).
   Swap the storage layer for a real backend later if needed.
═══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'vince_guestbook_v1';

// Seed comments so the guestbook isn't empty on first visit
const SEED_COMMENTS = [
  {
    id: 'seed1',
    name: 'Tom',
    url: '',
    body: "OMG ur profile is soooo kewl!! add me back!! 😊",
    date: '6/14/2006 10:32 AM',
    avatar: '👤',
  },
  {
    id: 'seed2',
    name: 'xXxCoderGirlxXx',
    url: '',
    body: "ur layout is amazingggg!! how did u make the MOVING background?? lol jk. seriously tho great portfolio 🔥",
    date: '6/15/2006 3:17 PM',
    avatar: '👾',
  },
  {
    id: 'seed3',
    name: 'SomeRecruiter2006',
    url: '',
    body: "Hi Vince! Just stopping by to say your projects look really impressive. I'd love to connect about a Python role we have open — feel free to message me! 📨",
    date: '6/20/2006 9:04 AM',
    avatar: '💼',
  },
];

let guestbookMemory = SEED_COMMENTS.slice();

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Seed the guestbook if first visit
  try {
    if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMMENTS));
  } catch (_) {}
  renderComments();
  updateFriendCount();

});

// ── RENDER COMMENTS ───────────────────────────────────

function renderComments() {
  const comments = getComments();
  const feed     = document.getElementById('ms-comments-feed');
  const empty    = document.getElementById('ms-no-comments');
  const countEl  = document.getElementById('ms-comment-count');

  countEl.textContent = '(' + comments.length + ' comment' + (comments.length !== 1 ? 's' : '') + ')';

  if (comments.length === 0) {
    feed.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  // Render newest first
  feed.innerHTML = [...comments].reverse().map(c => `
    <div class="ms-comment-card" id="comment-${c.id}">
      <div class="ms-commenter-pic">${escapeHtml(c.avatar || '👤')}</div>
      <div class="ms-commenter-info">
        <div class="ms-commenter-name">
          <button type="button" class="ms-comment-delete" onclick="deleteComment('${c.id}')" aria-label="Delete local comment by ${escapeHtml(c.name)}">✕</button>
          ${c.url ? `<a href="${escapeHtml(sanitizeUrl(c.url))}" target="_blank" rel="noopener">${escapeHtml(c.name)}</a>` : escapeHtml(c.name)}
        </div>
        <div class="ms-comment-date">${escapeHtml(c.date)}</div>
        <div class="ms-comment-body">${escapeHtml(c.body)}</div>
      </div>
    </div>
  `).join('');
}

// ── SUBMIT COMMENT ────────────────────────────────────

function submitComment() {
  const name  = document.getElementById('gb-name').value.trim();
  const url   = document.getElementById('gb-url').value.trim();
  const body  = document.getElementById('gb-body').value.trim();
  const error = document.getElementById('gb-error');

  error.textContent = '';

  if (!name) { error.textContent = 'Please enter your name.'; return; }
  if (!body) { error.textContent = 'Comment cannot be empty.'; return; }
  if (body.length < 3) { error.textContent = 'Say a little more!'; return; }

  const comment = {
    id:     Date.now().toString(),
    name,
    url:    url || '',
    body,
    date:   formatDate(new Date()),
    avatar: pickAvatar(name),
  };

  const comments = getComments();
  comments.push(comment);
  saveComments(comments);
  renderComments();

  // Clear form
  document.getElementById('gb-name').value  = '';
  document.getElementById('gb-url').value   = '';
  document.getElementById('gb-body').value  = '';

  // Scroll to the new comment
  const newCard = document.getElementById('comment-' + comment.id);
  if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── DELETE COMMENT ────────────────────────────────────

function deleteComment(id) {
  const comments = getComments().filter(c => c.id !== id);
  saveComments(comments);
  renderComments();
}

// ── STORAGE ───────────────────────────────────────────

function getComments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : guestbookMemory;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => c && typeof c === 'object' && typeof c.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(c.id) && ['name','body','date'].every(k => typeof c[k] === 'string')).map(c => ({...c, url: typeof c.url === 'string' ? c.url : '', avatar: typeof c.avatar === 'string' ? c.avatar : '👤'}));
  } catch {
    return guestbookMemory;
  }
}

function saveComments(comments) {
  guestbookMemory = comments;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(comments)); }
  catch (_) { document.getElementById('gb-storage-note').textContent = 'Browser storage is unavailable. Comments remain in this page session only and are not sent to Vince.'; }
}

// ── HELPERS ───────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '#';
  } catch (_) { return '#'; }
}

function formatDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2,'0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${m} ${ampm}`;
}

function pickAvatar(name) {
  // Deterministically pick a fun avatar based on first letter
  const avatars = ['👤','😎','🤓','🧑‍💻','👾','🦊','🐱','🎸','🌈','🦄','🔥','💀'];
  const idx = name.charCodeAt(0) % avatars.length;
  return avatars[idx];
}

function updateFriendCount() {
  // Slight joke: friends count = comments + 6 preset top friends
  const n = getComments().length + 6;
  const el = document.getElementById('friend-count');
  if (el) el.textContent = n;
}

function animatePlayerSong() {
  const songs = [
    { song: 'My Chemical Romance', artist: 'Welcome to the Black Parade' },
    { song: 'Fall Out Boy', artist: 'Sugar, We\'re Goin Down' },
    { song: 'Paramore', artist: 'Misery Business' },
    { song: 'Linkin Park', artist: 'In the End' },
    { song: 'Evanescence', artist: 'Bring Me to Life' },
  ];
  const pick = songs[Math.floor(Math.random() * songs.length)];
  const songEl   = document.getElementById('ms-player-song');
  const artistEl = document.getElementById('ms-player-artist');
  if (songEl)   songEl.textContent   = pick.song;
  if (artistEl) artistEl.textContent = pick.artist;
}
