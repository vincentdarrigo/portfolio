/* ═══════════════════════════════════════════════════════
   popups.js — 90s-style popup ad windows
   Vince Darrigo / The Mothership

   Authentic late-90s web popup energy: fake prizes, blinking
   text, under-construction warnings, Geocities/Angelfire vibes.
   Fires during idle moments — never during boot or the welcome show.
═══════════════════════════════════════════════════════ */

const POPUP_POOL = [
  {
    id: 'pop-winner',
    title: '🏆 CONGRATULATIONS !!',
    body: `
      <div class="pop-blink">⭐ YOU ARE VISITOR #1,000,000 ⭐</div>
      <div class="pop-sub">You have been selected to explore<br>
      <strong>THE MOTHERSHIP PORTFOLIO</strong><br>
      by Vince Darrigo!</div>
      <div class="pop-prize">🎁 Your prize: access to actual<br>working AI-powered projects.</div>
      <div class="pop-construction">🚧 &nbsp;SITE UNDER NIGHTLY CONSTRUCTION&nbsp; 🚧</div>
      <a class="pop-cta" href="mailto:vincent.darrigo@gmail.com?subject=Portfolio%20Question">
        ✉️ CLICK HERE TO CLAIM YOUR PRIZE
      </a>
      <div class="pop-fine">No purchase necessary. Some assembly required. AI may have opinions.</div>
    `,
  },
  {
    id: 'pop-construction',
    title: '🚧 UNDER CONSTRUCTION',
    body: `
      <div class="pop-geocities">
        <span class="pop-blink">★ ★ ★</span> Welcome to my portfolio! <span class="pop-blink">★ ★ ★</span>
      </div>
      <img src="https://i.imgur.com/construction.gif" onerror="this.style.display='none'" alt="">
      <div class="pop-sub">This site is best viewed in<br>Netscape Navigator 4.0 or better<br>
      at 800×600 resolution.</div>
      <div class="pop-construction">New pages added <strong>EVERY NIGHT</strong>!</div>
      <a class="pop-cta" href="mailto:vincent.darrigo@gmail.com?subject=Portfolio%20Feedback">
        📧 Sign My Guestbook
      </a>
      <div class="pop-counter">You are visitor <strong>#????</strong> since 1997</div>
    `,
  },
  {
    id: 'pop-free',
    title: '💥 FREE!! FREE!! FREE!!',
    body: `
      <div class="pop-blink" style="font-size:18px;">⚠️ WARNING ⚠️</div>
      <div class="pop-sub">You are about to experience<br>
      <strong>AI-powered scavenger hunts</strong><br>
      <strong>sports prediction platforms</strong><br>
      <strong>and live review portals</strong><br>
      — all running in a fake Windows 95.</div>
      <div class="pop-construction">🚧 MORE FEATURES ADDED WEEKLY 🚧</div>
      <a class="pop-cta" href="mailto:vincent.darrigo@gmail.com?subject=I%20have%20an%20interesting%20problem">
        🖱️ CLICK HERE — It's FREE!
      </a>
      <div class="pop-fine">Side effects may include nostalgia, curiosity, and unsolicited opinions about dial-up.</div>
    `,
  },
  {
    id: 'pop-survey',
    title: '📋 Quick Survey — WIN A PRIZE!',
    body: `
      <div class="pop-sub">Answer 1 question for a chance to win!</div>
      <div class="pop-question">
        Q: Does this portfolio make you want to<br>
        hire or collaborate with Vince Darrigo?
      </div>
      <div class="pop-options">
        <a class="pop-cta" href="mailto:vincent.darrigo@gmail.com?subject=Yes%20actually">✅ &nbsp;Yes, actually.</a>
        <a class="pop-cta pop-cta-alt" href="mailto:vincent.darrigo@gmail.com?subject=Tell%20me%20more">🤔 &nbsp;Tell me more.</a>
      </div>
      <div class="pop-construction">🚧 PORTFOLIO UPDATED NIGHTLY 🚧</div>
      <div class="pop-fine">Offer expires when Vince stops improving things, which is never.</div>
    `,
  },
];

let _popIdx       = 0;
let _popShown     = 0;
const MAX_POPUPS  = 3; // max per session
const POP_DELAY_1 = 90000;  // first popup: 90s after desktop loads
const POP_INTERVAL = 120000; // subsequent popups every 2 min

function initPopups() {
  // Shuffle pool so order varies
  POPUP_POOL.sort(() => Math.random() - 0.5);
  setTimeout(_maybeShowPopup, POP_DELAY_1);
}

function _maybeShowPopup() {
  if (_popShown >= MAX_POPUPS) return;
  if (typeof imRunning !== 'undefined' && imRunning) {
    // Welcome show still running — wait a bit longer
    setTimeout(_maybeShowPopup, 30000);
    return;
  }
  _showNextPopup();
  _popShown++;
  if (_popShown < MAX_POPUPS) {
    setTimeout(_maybeShowPopup, POP_INTERVAL);
  }
}

// Call this after a project scene ends to show a relevant contact popup
function showProjectPopup(projectName) {
  _buildAndShow({
    id: 'pop-project-' + projectName,
    title: '📬 Questions? We have answers!',
    body: `
      <div class="pop-blink">💡 You just saw: <strong>${projectName}</strong></div>
      <div class="pop-sub">Want to know how it was built?<br>
      Have an idea for something similar?<br>
      Found an interesting problem?</div>
      <div class="pop-construction">🚧 This project is still evolving 🚧</div>
      <a class="pop-cta" href="mailto:vincent.darrigo@gmail.com?subject=Question%20about%20${encodeURIComponent(projectName)}">
        ✉️ ASK VINCE DIRECTLY
      </a>
      <div class="pop-fine">No spam. Just a developer who likes interesting problems.</div>
    `,
  });
}

function _showNextPopup() {
  const cfg = POPUP_POOL[_popIdx % POPUP_POOL.length];
  _popIdx++;
  _buildAndShow(cfg);
}

function _buildAndShow(cfg) {
  // Remove any existing popup with same id
  const old = document.getElementById(cfg.id);
  if (old) old.remove();

  const win = document.createElement('div');
  win.id = cfg.id;
  win.className = 'pop-window win95-window';

  // Random-ish position in the middle area of screen
  const x = 200 + Math.random() * (window.innerWidth  - 500);
  const y = 150 + Math.random() * (window.innerHeight - 350);
  win.style.cssText = `position:fixed; left:${Math.round(x)}px; top:${Math.round(y)}px; z-index:8500; width:340px;`;

  win.innerHTML = `
    <div class="pop-titlebar">
      <span class="pop-title-text">${cfg.title}</span>
      <button class="pop-close" onclick="this.closest('.pop-window').remove()">✕</button>
    </div>
    <div class="pop-body">${cfg.body}</div>
  `;

  document.body.appendChild(win);

  // Make draggable using the existing drag system if available
  if (typeof attachDrag === 'function') attachDrag(win);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for boot complete event before starting popup timer
  document.addEventListener('bootComplete', () => {
    setTimeout(initPopups, 2000); // small buffer after desktop loads
  });
});
