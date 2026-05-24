/* ═══════════════════════════════════════════════════════
   weatherbug.js — WeatherBug Alert v1.4
   Developer-humour fake weather widget
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── WEATHER DATA POOLS ────────────────────────────────

const WB_CONDITIONS = [
  { icon: '⛅', text: 'Scattered Commits',        temp: 72 },
  { icon: '🌧️', text: 'Heavy Debugging',            temp: 58 },
  { icon: '⚡', text: 'Merge Conflict',             temp: 64 },
  { icon: '🔥', text: 'Production Fire',            temp: 91 },
  { icon: '🌫️', text: 'Fog of Undefined',           temp: 55 },
  { icon: '☀️',  text: 'Senior Dev WFH',            temp: 77 },
  { icon: '⛈️', text: '100% Chance of Scope Creep', temp: 61 },
  { icon: '❄️',  text: 'Cold Deploy',               temp: 34 },
  { icon: '🌤️', text: 'Partially Passing Tests',   temp: 68 },
  { icon: '🌪️', text: 'Sprint Planning',            temp: 62 },
  { icon: '🌈', text: 'Green Build',               temp: 74 },
  { icon: '☁️',  text: 'Stack Overflow (the site)',  temp: 66 },
];

const WB_HUMIDITY = [
  'Git Blame: 87%',
  'Imposter Syndrome: 94%',
  'Tech Debt Saturation: 100%',
  'Coffee Dependency: 3.4 cups',
  'Unread Jira Tickets: ∞',
  'Zoom Calls Survived: 7 today',
];

const WB_WIND = [
  'Legacy Code, NW @ 14 mph',
  'Hot Takes, SW @ 22 mph',
  'Backwards-Compatible, N @ 5 mph',
  'Rebase Conflicts, variable',
  'Rubber Duck Consulting, calm',
  'Senior Dev Opinions, gusty',
];

const WB_FEELS = [
  '54°F (Imposter Syndrome factor)',
  '67°F (Pre-code-review anxiety)',
  '41°F (Monday morning deployment)',
  '78°F (First green CI in 3 days)',
  '61°F (Estimated, pending PR review)',
];

const WB_UV = [
  'Vim Exit Difficulty: 11',
  'CSS Specificity Wars: Critical',
  'Regex Complexity: Unreadable',
  'npm Audit Severity: Just Don\'t',
  'Meeting-That-Could\'ve-Been-Email: High',
];

const WB_FORECAST_CONDITIONS = [
  { icon: '⚡', cond: 'Deploy to\nProd',     temp: 64 },
  { icon: '🌧️', cond: 'Code\nReview Day',   temp: 59 },
  { icon: '⛈️', cond: 'Sprint\nPlanning',   temp: 55 },
  { icon: '☀️',  cond: 'Senior Dev\nWFH',   temp: 77 },
  { icon: '🎉', cond: 'LGTM\nFriday',       temp: 80 },
  { icon: '🌤️', cond: 'Rubber Duck\nSesh',  temp: 68 },
  { icon: '🔥', cond: 'Hotfix\nWednesday',  temp: 88 },
  { icon: '❄️',  cond: 'Freeze\nDeadline',  temp: 42 },
  { icon: '🌫️', cond: 'Undefined\nBehavior', temp: 53 },
  { icon: '⛅', cond: 'Standup\nMonday',    temp: 61 },
];

const WB_DAYS = ['Mon','Tue','Wed','Thu','Fri'];

const WB_ALERTS = [
  'SEVERE WEATHER ALERT: Production is down. Recommended path: panic → hotfix → blame Jenkins → rollback.',
  'SEVERE WEATHER ALERT: Someone pushed directly to main. On a Friday. Protective shelters: any coffee shop with WiFi.',
  'SEVERE WEATHER ALERT: New ticket opened — "Make it pop." Priority: Critical. Requirements: Vibes.',
  'SEVERE WEATHER ALERT: npm install running. Estimated completion: 47 minutes. 847 packages deprecated.',
  'SEVERE WEATHER ALERT: CSS changed. Everything is fine. Please remain calm. Nothing is fine.',
  'SEVERE WEATHER ALERT: Senior dev says "this should be a quick fix." Estimated actual time: 2 sprints.',
  'SEVERE WEATHER ALERT: You have been voluntold to present at the all-hands in 15 minutes.',
];

// ── STATE ─────────────────────────────────────────────

let wbAlertIndex  = 0;
let wbInitialized = false;
let wbRotateTimer = null;
let wbAlertVisible = false;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-weatherbug');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !wbInitialized) {
      wbInitialized = true;
      wbRender();
      wbStartRotation();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

// ── RENDER ────────────────────────────────────────────

function wbPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wbRender() {
  const cond   = wbPick(WB_CONDITIONS);
  const today  = new Date();
  const todayF = today.getDay(); // 0=Sun
  const offset = todayF === 0 ? 1 : (todayF === 6 ? 2 : 0); // avoid weekend start
  const startDay = (todayF + offset) % 7;

  // Main display
  const tempEl = document.getElementById('wb-temp');
  const condEl = document.getElementById('wb-condition');
  if (tempEl) tempEl.textContent = cond.temp + '°F';
  if (condEl) condEl.textContent = cond.icon + ' ' + cond.text;

  // Details
  const hEl = document.getElementById('wb-humidity');
  const wEl = document.getElementById('wb-wind');
  const fEl = document.getElementById('wb-feels');
  const uEl = document.getElementById('wb-uv');
  if (hEl) hEl.textContent = wbPick(WB_HUMIDITY);
  if (wEl) wEl.textContent = wbPick(WB_WIND);
  if (fEl) fEl.textContent = wbPick(WB_FEELS);
  if (uEl) uEl.textContent = wbPick(WB_UV);

  // 5-day forecast
  const fc = document.getElementById('wb-forecast');
  if (fc) {
    fc.innerHTML = '';
    // Shuffle forecast pool
    const pool = [...WB_FORECAST_CONDITIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    pool.forEach((day, i) => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'wb-forecast-day';
      const dayName = WB_DAYS[(startDay + i) % 5];
      dayDiv.innerHTML = `
        <div class="wb-fc-day">${dayName}</div>
        <div class="wb-fc-icon">${day.icon}</div>
        <div class="wb-fc-cond">${day.cond}</div>
        <div class="wb-fc-temp">${day.temp}°</div>
      `;
      fc.appendChild(dayDiv);
    });
  }
}

// ── ROTATION ──────────────────────────────────────────

function wbStartRotation() {
  clearInterval(wbRotateTimer);
  wbRotateTimer = setInterval(() => {
    wbRender();
  }, 18000);
}

// ── BEE CLICK ─────────────────────────────────────────

function wbBeeClick() {
  const bar  = document.getElementById('wb-alert-bar');
  const text = document.getElementById('wb-alert-text');
  if (!bar || !text) return;

  text.textContent = WB_ALERTS[wbAlertIndex % WB_ALERTS.length];
  wbAlertIndex++;

  bar.style.display = 'flex';
  wbAlertVisible = true;

  clearTimeout(wbBeeClick._timer);
  wbBeeClick._timer = setTimeout(() => {
    bar.style.display = 'none';
    wbAlertVisible = false;
  }, 8000);
}
