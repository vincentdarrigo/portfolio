/* ═══════════════════════════════════════════════════════
   weatherbug.js — WeatherBug Alert v1.4
   Developer-humour fake weather widget
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── WEATHER DATA POOLS ────────────────────────────────

const WB_CONDITIONS = [
  { icon: '⛅', text: 'Scattered Commits',         temp: 72, dir: 'NW', speed: 14 },
  { icon: '🌧️', text: 'Heavy Debugging',             temp: 58, dir: 'SW', speed: 22 },
  { icon: '⚡', text: 'Merge Conflict',              temp: 64, dir: 'E',  speed: 18 },
  { icon: '🔥', text: 'Production Fire',             temp: 91, dir: 'S',  speed: 5  },
  { icon: '🌫️', text: 'Fog of Undefined',            temp: 55, dir: 'N',  speed: 3  },
  { icon: '☀️',  text: 'Senior Dev WFH',             temp: 77, dir: 'SE', speed: 9  },
  { icon: '⛈️', text: '100% Chance of Scope Creep',  temp: 61, dir: 'NE', speed: 31 },
  { icon: '❄️',  text: 'Cold Deploy',                temp: 34, dir: 'N',  speed: 27 },
  { icon: '🌤️', text: 'Partially Passing Tests',    temp: 68, dir: 'W',  speed: 11 },
  { icon: '🌪️', text: 'Sprint Planning',             temp: 62, dir: 'SW', speed: 38 },
  { icon: '🌈', text: 'Green Build',                temp: 74, dir: 'SE', speed: 7  },
  { icon: '☁️',  text: 'Stack Overflow (the site)',   temp: 66, dir: 'NW', speed: 16 },
];

const WB_HUMIDITY = [87, 94, 100, 72, 63, 81, 55, 79];

const WB_WIND_LABELS = [
  'Legacy Code',
  'Hot Takes',
  'Backwards-Compatible',
  'Rebase Conflicts',
  'Rubber Duck Consulting',
  'Senior Dev Opinions',
  'Scope Creep, variable',
  'npm audit, gusty',
];

const WB_FORECAST_CONDITIONS = [
  { icon: '⚡', cond: 'Deploy to Prod',      hi: 64,  lo: 51 },
  { icon: '🌧️', cond: 'Code Review Day',    hi: 59,  lo: 44 },
  { icon: '⛈️', cond: 'Sprint Planning',    hi: 55,  lo: 42 },
  { icon: '☀️',  cond: 'Senior Dev WFH',    hi: 77,  lo: 62 },
  { icon: '🎉', cond: 'LGTM Friday',        hi: 80,  lo: 65 },
  { icon: '🌤️', cond: 'Rubber Duck Sesh',   hi: 68,  lo: 53 },
  { icon: '🔥', cond: 'Hotfix Wednesday',   hi: 88,  lo: 71 },
  { icon: '❄️',  cond: 'Freeze Deadline',   hi: 42,  lo: 29 },
  { icon: '🌫️', cond: 'Undefined Behavior', hi: 53,  lo: 40 },
  { icon: '⛅', cond: 'Standup Monday',     hi: 61,  lo: 48 },
];

const WB_DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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

let wbAlertIndex   = 0;
let wbInitialized  = false;
let wbRotateTimer  = null;
let wbClockTimer   = null;
let wbAlertVisible = false;
let wbCurrentCond  = null;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-weatherbug');
  if (!win) return;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !wbInitialized) {
      wbInitialized = true;
      wbRender();
      wbStartClock();
      wbStartRotation();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

// ── HELPERS ───────────────────────────────────────────

function wbPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wbTempToThermPct(temp) {
  // Map -20°F → 100°F to 0% → 100%
  return Math.max(2, Math.min(98, ((temp + 20) / 120) * 100));
}

function wbDirToRad(dir) {
  const map = { N:0, NE:45, E:90, SE:135, S:180, SW:225, W:270, NW:315 };
  return ((map[dir] || 0) * Math.PI) / 180;
}

// ── COMPASS CANVAS ────────────────────────────────────

function wbDrawCompass(dir, speed) {
  const canvas = document.getElementById('wb-compass');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = W / 2 - 3;

  ctx.clearRect(0, 0, W, H);

  // Background circle
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  bg.addColorStop(0, '#d4e8f8');
  bg.addColorStop(1, '#a8c8e8');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = '#6898c0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tick marks
  ctx.strokeStyle = '#7898b0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const inner = i % 4 === 0 ? r - 10 : r - 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
    ctx.stroke();
  }

  // Cardinal labels
  ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cardinals = ['N','E','S','W'];
  const cardAngles = [0, 90, 180, 270];
  cardAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    const lr = r - 14;
    ctx.fillStyle = '#003366';
    ctx.fillText(cardinals[i], cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
  });

  // Wind direction needle
  const needleAngle = wbDirToRad(dir) - Math.PI / 2;
  const needleLen = r - 18;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 3;

  // Red tip (FROM direction = wind coming from)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(needleAngle) * needleLen,
    cy + Math.sin(needleAngle) * needleLen
  );
  ctx.strokeStyle = '#cc2200';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // White tail
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx - Math.cos(needleAngle) * (needleLen * 0.5),
    cy - Math.sin(needleAngle) * (needleLen * 0.5)
  );
  ctx.strokeStyle = '#e0e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#003366';
  ctx.fill();

  // Wind speed overlay
  const wsEl = document.getElementById('wb-wind-speed');
  if (wsEl) wsEl.innerHTML = speed + '<br><span>mph</span>';
}

// ── RENDER ────────────────────────────────────────────

function wbRender() {
  const cond = wbPick(WB_CONDITIONS);
  wbCurrentCond = cond;

  // Temperature + thermometer
  const tempEl = document.getElementById('wb-temp');
  if (tempEl) tempEl.textContent = cond.temp + '°';
  const fillEl = document.getElementById('wb-therm-fill');
  if (fillEl) fillEl.style.height = wbTempToThermPct(cond.temp) + '%';

  // Wind compass
  wbDrawCompass(cond.dir, cond.speed);

  // Condition details
  const hum   = wbPick(WB_HUMIDITY);
  const dewpt = Math.round(cond.temp - (100 - hum) / 5);
  const heatIdx = cond.temp > 80
    ? Math.round(cond.temp + (hum - 40) * 0.1)
    : '--';

  const h = document.getElementById('wb-heat-idx');
  const u = document.getElementById('wb-humidity');
  const d = document.getElementById('wb-dewpoint');
  if (h) h.textContent = heatIdx === '--' ? '--' : heatIdx + '°F';
  if (u) u.textContent = hum + '%';
  if (d) d.textContent = dewpt + '°F';

  // So Far Today
  const hiTemp  = Math.round(cond.temp + Math.random() * 8 + 2);
  const loTemp  = Math.round(cond.temp - Math.random() * 12 - 3);
  const rainIn  = (Math.random() < 0.3) ? (Math.random() * 0.6).toFixed(2) + '"' : '0.00"';
  const gustMph = Math.round(cond.speed * (1.3 + Math.random() * 0.5));

  const hiEl   = document.getElementById('wb-high');
  const loEl   = document.getElementById('wb-low');
  const rainEl = document.getElementById('wb-rain');
  const gustEl = document.getElementById('wb-gust');
  if (hiEl)   hiEl.textContent   = hiTemp + '°F';
  if (loEl)   loEl.textContent   = loTemp + '°F';
  if (rainEl) rainEl.textContent = rainIn;
  if (gustEl) gustEl.textContent = gustMph + ' mph';

  // 3-day forecast
  wbRenderForecast();
}

function wbRenderForecast() {
  const list = document.getElementById('wb-forecast-list');
  if (!list) return;
  list.innerHTML = '';

  const today = new Date().getDay();
  const pool  = [...WB_FORECAST_CONDITIONS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 3; i++) {
    const day  = pool[i];
    const dayName = WB_DAYS[(today + i + 1) % 7];
    const block = document.createElement('div');
    block.className = 'wb-fc-day-block';
    block.innerHTML = `
      <div class="wb-fc-day-name">${dayName}</div>
      <div class="wb-fc-row">
        <span class="wb-fc-icon">${day.icon}</span>
        <div class="wb-fc-hi-lo">
          <span class="wb-fc-hi">Hi: ${day.hi}°</span><br>
          <span>Lo: ${day.lo}°</span>
        </div>
      </div>
      <div class="wb-fc-desc">${day.cond}</div>
      <div class="wb-fc-more">Full Forecast ▶</div>
    `;
    list.appendChild(block);
  }
}

// ── CLOCK ─────────────────────────────────────────────

function wbStartClock() {
  function tick() {
    const now = new Date();
    const dateEl = document.getElementById('wb-date');
    const timeEl = document.getElementById('wb-time');
    if (dateEl) {
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const y = String(now.getFullYear()).slice(-2);
      dateEl.textContent = m + '/' + d + '/' + y;
    }
    if (timeEl) {
      let h = now.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = h + ':' + mm + ':' + ss + ' ' + ampm;
    }
  }
  tick();
  wbClockTimer = setInterval(tick, 1000);
}

// ── ROTATION ──────────────────────────────────────────

function wbStartRotation() {
  clearInterval(wbRotateTimer);
  wbRotateTimer = setInterval(() => wbRender(), 18000);
}

// ── BEE / LADYBUG CLICK ───────────────────────────────

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
