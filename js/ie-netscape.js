/* ═══════════════════════════════════════════════════════
   ie-netscape.js — The Browser Wars
   Internet Explorer 5.5 vs Netscape Navigator 4.7
   Vince Darrigo / The Mothership
═══════════════════════════════════════════════════════ */

// ── IE STATUS MESSAGES ───────────────────────────────

const IE_MSGS = [
  'Transferring data... Please disable your firewall, antivirus, and sense of caution.',
  'Installing ActiveX control (1 of 47). This is for your protection.',
  'Estimated load time: 4–6 business days. Still faster than Netscape Navigator.',
  'CSS rendering complete. Box model applied incorrectly. As is tradition.',
  'Security certificate expired in 2003. Proceeding with confidence.',
  '847 MB RAM consumed loading a white page. Performance is optimized.',
  'Page secured with 40-bit encryption. (Netscape would have used 0-bit.)',
  'Installing Browser Helper Object #4. You didn\'t ask for this. You\'re getting it.',
  'Warning: This page opens a popup. And another popup. And an ad for a mortgage.',
  'Toolbar install request from Ask.com. Automatically approved on your behalf.',
  'This site is best viewed in Internet Explorer. Other browsers are best viewed in the trash.',
  'Netscape Navigator users: lol.',
];

const IE_ESTIMATES = [
  'Estimated time remaining: 4–6 business days',
  'Estimated time remaining: Computing...',
  'Estimated time remaining: Still faster than Netscape.',
  'Estimated time remaining: Please hold.',
  'Estimated time remaining: We\'ll get there eventually.',
];

// ── NETSCAPE STATUS MESSAGES ─────────────────────────

const NS_MSGS = [
  'Connecting... Netscape 6.0 will be ready shortly. We said shortly. We meant conceptually.',
  'Note: We skipped version 5.0. This makes 6.0 technically more impressive. We think.',
  'Memory usage: 1.2 GB. This is, remarkably, an improvement over last quarter.',
  'Technically, everything you love about Firefox is our fault. You are welcome.',
  'We had 90% browser market share in 1995. We are aware of what happened next.',
  'IE was bundled with Windows. We consider this cheating. They consider it "innovation."',
  'AOL acquired us in 1998. We would like to talk about anything else.',
  'Page load failed. This is still a better security record than Internet Explorer.',
  'Rebuilding rendering engine from scratch. Expected completion: Q4 2003.',
  'Fun fact: Internet Explorer was convicted of antitrust violations. We mention this often.',
  'Netscape Communicator also includes email, newsgroups, a calendar, a composer, and regret.',
  'IE crashed your Windows. We crash more tastefully.',
];

const NS_ESTIMATES = [
  'Estimated time remaining: Rebuilding from scratch',
  'Estimated time remaining: Longer than Netscape 6.0 took (18 months)',
  'Estimated time remaining: Calculating...',
  'Estimated time remaining: Have you tried clearing your cache?',
  'Estimated time remaining: At least we\'re not IE.',
];

// ── STATE ─────────────────────────────────────────────

let ieInterval = null;
let nsInterval = null;
let ieStarted  = false;
let nsStarted  = false;
let warToastTimer = null;

// ── LAUNCH FUNCTIONS ──────────────────────────────────

function launchIE() {
  if (typeof openWindow === 'function') openWindow('ie');
  setTimeout(() => startBrowserAntics('ie'), 300);
}

function launchNetscape() {
  if (typeof openWindow === 'function') openWindow('netscape');
  setTimeout(() => startBrowserAntics('netscape'), 300);
}

// ── BROWSER LOADING ANTICS ───────────────────────────

function startBrowserAntics(which) {
  const isIE    = which === 'ie';
  const msgs    = isIE ? IE_MSGS    : NS_MSGS;
  const ests    = isIE ? IE_ESTIMATES : NS_ESTIMATES;
  const target  = isIE ? 23 : 17;   // progress bar stalls here (%)
  const prefixId= which;

  // Stop existing
  if (isIE) { clearInterval(ieInterval); ieStarted = true; }
  else       { clearInterval(nsInterval); nsStarted = true; }

  // Reset elements
  const fillEl = document.getElementById(prefixId + '-progress-fill');
  const statEl = document.getElementById(prefixId + '-status-text');
  const estEl  = document.getElementById(prefixId + '-estimate');
  if (fillEl) fillEl.style.width = '0%';

  let progress = 0;
  let msgIdx   = 0;
  let estIdx   = 0;
  let ticks    = 0;

  const iv = setInterval(() => {
    ticks++;

    // Creep toward stall point
    if (progress < target) {
      progress += Math.random() * 1.2 + 0.3;
      if (progress > target) progress = target;
      if (fillEl) fillEl.style.width = progress + '%';
    }

    // Occasionally blip forward then back (nervous energy)
    if (progress >= target && ticks % 20 === 0 && Math.random() < 0.4) {
      const blip = progress + Math.random() * 3;
      if (fillEl) {
        fillEl.style.width = blip + '%';
        setTimeout(() => { if (fillEl) fillEl.style.width = target + '%'; }, 300);
      }
    }

    // Rotate status messages
    if (ticks % 12 === 0 || ticks === 3) {
      if (statEl) statEl.textContent = msgs[msgIdx % msgs.length];
      msgIdx++;
    }

    // Rotate estimate text
    if (ticks % 25 === 0) {
      if (estEl) estEl.textContent = ests[estIdx % ests.length];
      estIdx++;
    }
  }, 350);

  if (isIE) ieInterval = iv;
  else      nsInterval = iv;

  // IE: show ActiveX popup after 3.5 seconds
  if (isIE) setTimeout(showIEActiveXPopup, 3500);

  // Both open? Show browser war toast
  if (ieStarted && nsStarted) {
    clearTimeout(warToastTimer);
    warToastTimer = setTimeout(showBrowserWarToast, 600);
  }
}

// ── IE ACTIVEX POPUP ──────────────────────────────────

function showIEActiveXPopup() {
  const win   = document.getElementById('window-ie');
  const popup = document.getElementById('ie-activex-popup');
  if (!popup || !win || win.style.display === 'none') return;
  popup.style.display = 'block';
  setTimeout(dismissIEPopup, 9000);
}

function dismissIEPopup() {
  const popup = document.getElementById('ie-activex-popup');
  if (popup) popup.style.display = 'none';
}

// ── BROWSER WAR TOAST ────────────────────────────────

function showBrowserWarToast() {
  let toast = document.getElementById('browser-war-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'browser-war-toast';
    document.getElementById('desktop').appendChild(toast);
  }
  toast.style.display = 'block';
  toast.textContent = '⚔️ Browser War detected. Grab popcorn.';
  setTimeout(() => { if (toast) toast.style.display = 'none'; }, 5000);
}
