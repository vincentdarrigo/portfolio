/* ═══════════════════════════════════════════════════════
   project_scenes.js — Per-project chatbot narration scenes
   Vince Darrigo / The Mothership

   Each scene is a plain array of { from, delay, text } objects
   matching the same format as IM_SCRIPT in messenger.js.
   To update a scene: edit the text values in the array below.
   To add a new scene: add an entry to PROJECT_SCENES and
   PROJECT_SCENE_WINDOWS, then call openWindow() — it handles the rest.
═══════════════════════════════════════════════════════ */

// ── SCENE DATA ────────────────────────────────────────
// Edit text values freely. Delays are in milliseconds.

const PROJECT_SCENES = {

  'ispyai': [
    { from: 'system', delay: 0,     text: '— I Spy AI / I Spy A Pie —' },
    { from: 'icq',    delay: 5000,  text: 'Oh, I like this one. Two games. One engine. Mysterious.' },
    { from: 'aim',    delay: 8000,  text: 'It\'s a real-world AI scavenger hunt. You walk around. The AI hides things. You find them. Basically my away messages, but with GPS.' },
    { from: 'yahoo',  delay: 6500,  text: 'There\'s a SPY mode and a PIZZA mode. I don\'t make the rules. Vince does. He\'s having a great time.' },
    { from: 'icq',    delay: 9000,  text: 'I Spy AI: you\'re a field agent. K.A.I.T. is your handler. You\'re hunting S.K.A.I.-N.E.T. operatives. Giving Mission Impossible by way of a guy with a laptop.' },
    { from: 'aim',    delay: 7500,  text: 'I Spy A Pie: you\'re a pizza critic. Clues lead you to real local spots. You get scored. One Bite Score. Out of ten.' },
    { from: 'yahoo',  delay: 8500,  text: 'A whole scoring system. For pizza. That you have to physically go find. This man built tourism infrastructure around dough.' },
    { from: 'clippy', delay: 8000,  text: 'It looks like you\'re trying to verify a real-world location using the Google Maps Places API. Would you like help with that?' },
    { from: 'aim',    delay: 4500,  text: 'No, Clippy. Nobody asked.' },
    { from: 'clippy', delay: 9000,  text: 'I was simply noting this required live AI clue generation, real geographic verification, AND photo privacy blurring, all in real time. That\'s the kind of thing I\'d put in a memo.' },
    { from: 'icq',    delay: 4000,  text: '...he\'s not wrong though.' },
    { from: 'yahoo',  delay: 10000, text: 'There\'s also a little voice widget — K.A.I.T. — lights up like KITT from Knight Rider when stuff happens. It even knows to hide itself in pizza mode. That\'s not a reskin. That\'s restraint.' },
    { from: 'aim',    delay: 6000,  text: 'Live at ai-mazing-race.onrender.com. Two games, one platform, zero excuses.' },
    { from: 'icq',    delay: 4500,  text: 'Go find something. Or don\'t. We\'re not your supervisor.' },
    { from: 'system', delay: 2000,  text: '— Window settles. —' },
  ],

  'trivia': [
    { from: 'system', delay: 0,     text: '— Anytime AI Trivia —' },
    { from: 'yahoo',  delay: 8500,  text: 'Okay THIS one\'s my favorite. You type a topic. The AI builds an entire trivia game. Live. On the spot. Timers, scoreboard, the whole production.' },
    { from: 'aim',    delay: 8000,  text: 'Four question types: multiple choice, free text, closest-number, and drag-to-rank. Not just pick A, B, C, or D — it actually makes you work for it.' },
    { from: 'icq',    delay: 9500,  text: 'Best part: the AI sometimes lies to you on purpose. One or two questions per game have a false premise baked in — like asking who started at QB in a Super Bowl a team never played in.' },
    { from: 'yahoo',  delay: 8500,  text: 'And if you catch it, you get BONUS points. A built-in lie detector for the AI. The system polices its own hallucinations and rewards you for noticing.' },
    { from: 'clippy', delay: 8000,  text: 'It looks like you\'re trying to dispute an AI-generated trivia answer. Would you like help with that?' },
    { from: 'aim',    delay: 9000,  text: 'Actually — yes. There\'s a Challenge button. Players get two per game. Type your argument, the AI rules with actual reasoning, and the verdict broadcasts to the whole room like a tiny public trial.' },
    { from: 'clippy', delay: 5000,  text: 'Finally. Someone respects due process.' },
    { from: 'icq',    delay: 8500,  text: 'Here\'s the number that should actually impress you: every AI-generated question gets saved automatically. There are 3,391 of them sitting in a growing question bank right now.' },
    { from: 'yahoo',  delay: 10500, text: 'Next up: a mode that replays questions FROM that bank instead of generating new ones every time. The AI\'s work doesn\'t disappear after one game — it gets reused. That\'s the difference between a parlor trick and a system.' },
    { from: 'aim',    delay: 7000,  text: 'Translation for the people in suits: this is AI doing real work, saving that work, and recycling it intelligently. Not a toy. Infrastructure.' },
    { from: 'system', delay: 2000,  text: '— Window settles. —' },
  ],

  'pickathlon': [
    { from: 'system', delay: 0,     text: '— Pickathlon —' },
    { from: 'aim',    delay: 6000,  text: 'Ah. Football. The sport where large men collide and Vince built an entire prediction app about it.' },
    { from: 'yahoo',  delay: 9000,  text: 'Pickathlon! Weekly NFL pick \'em with point spreads and a LOCK PICK — one extra-weighted pick per week. High risk, high reward, very fantasy-football-brain.' },
    { from: 'icq',    delay: 8500,  text: 'And here\'s the part that actually matters: you don\'t need an account to look around. Picks, leaderboards, the bracket — all visible. No signup wall.' },
    { from: 'aim',    delay: 9500,  text: 'Translation: recruiters can poke around without creating a throwaway email first. Revolutionary concept. Frictionless onboarding. Somebody give this man a UX award.' },
    { from: 'yahoo',  delay: 9000,  text: 'Standings are computed live from real pick data. Playoff seeding updates itself. The bracket is a single-screen tournament tree — no scrolling through six divisions to find out who\'s winning.' },
    { from: 'icq',    delay: 7000,  text: 'Built on Django REST and React. Live at predictrix.app. Real players. Real season. Real spreadsheets somewhere, probably.' },
    { from: 'aim',    delay: 6000,  text: 'Currently live for the 2025-2026 season. Not a prototype. Not a \'coming soon.\' Live.' },
    { from: 'system', delay: 2000,  text: '— Window settles. —' },
  ],

  'draftathon': [
    { from: 'system', delay: 0,     text: '— Draftathon —' },
    { from: 'icq',    delay: 8500,  text: 'Draftathon. You predict every single pick of the NFL Draft. Slot by slot. All seven rounds. That\'s not a feature, that\'s a hostage situation with a clock.' },
    { from: 'yahoo',  delay: 9500,  text: 'There\'s an AI scouting assistant too — branded "Coach AI" or sometimes "Cypher," depending how spicy Vince was feeling — gives you intel on prospects before you lock a pick.' },
    { from: 'aim',    delay: 10000, text: 'Here\'s the detail I actually respect: this wasn\'t a tech demo. It was played LIVE for the real 2026 NFL Draft. Actual people. Actual picks. Actual heartbreak when their guy went two rounds early.' },
    { from: 'icq',    delay: 9000,  text: 'And in the off-season, when there\'s no live draft happening, it doesn\'t just sit there looking empty — there\'s a whole demo data system so the board still looks alive when you visit.' },
    { from: 'yahoo',  delay: 8000,  text: 'That\'s the kind of detail you only add after someone has actually shown the app to a stranger and gone "oh no, it\'s empty." Scar tissue engineering.' },
    { from: 'aim',    delay: 5500,  text: 'Live at predictrix.app, under the Predictrix umbrella alongside Pickathlon.' },
    { from: 'system', delay: 2000,  text: '— Window settles. —' },
  ],

  'reviewflow': [
    { from: 'system', delay: 0,     text: '— Review Portal —' },
    { from: 'aim',    delay: 6500,  text: 'Ah, the serious one. No llamas. No pizza. Just clean, role-based software engineering.' },
    { from: 'icq',    delay: 8500,  text: 'Review Portal coordinates program reviews across a whole lot of teams. Five separate access tiers, from full admin down to a single-purpose Coach view that only sees what a coach needs to see.' },
    { from: 'yahoo',  delay: 7000,  text: 'Roster assignments, replacements, approvals — all live, all writing through to a real database in real time.' },
    { from: 'aim',    delay: 9500,  text: 'Here\'s the part I actually respect: there\'s a sync clock that ticks down every fifteen minutes like it\'s pulling from a live external system. It\'s not. Nothing leaves this machine. Ever.' },
    { from: 'clippy', delay: 8500,  text: 'It looks like you\'re trying to build a fully safe demo environment with zero risk of touching a real system. Would you like help with that?' },
    { from: 'icq',    delay: 6000,  text: 'For once, Clippy, that\'s actually the entire point.' },
    { from: 'clippy', delay: 7000,  text: 'I know. I read the architecture. I\'m very proud, in my own small paperclip way.' },
    { from: 'yahoo',  delay: 9500,  text: 'There\'s a dedicated demo-mode flag that quietly short-circuits every external side effect — sync, email, SMS — while keeping the real UI and the real decision logic fully intact. That\'s not a toy reskin. That\'s restraint with a config flag.' },
    { from: 'aim',    delay: 9000,  text: 'And the data backing it is fully synthetic. Over fifteen hundred fake reviewers, hundreds of fake programs, realistic at scale, anonymized from the ground up. Built specifically so it can be handed to a total stranger with zero risk.' },
    { from: 'icq',    delay: 7000,  text: 'Translation for the people in suits: this is what it looks like when someone builds a safe sandbox version of a real operational tool, on purpose, the right way.' },
    { from: 'system', delay: 2000,  text: '— Window settles. —' },
  ],

};

// Windows that trigger a project scene on open
const PROJECT_SCENE_WINDOWS = ['ispyai', 'trivia', 'pickathlon', 'draftathon', 'reviewflow'];

// ── SCENE PLAYER ──────────────────────────────────────

function playProjectScene(id) {
  // Play each scene only once per browser session
  const key = 'scene_played_' + id;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const lines = PROJECT_SCENES[id];
  if (!lines || !lines.length) return;

  // Bring chat windows into view
  _sceneShowWindows();

  // Queue all lines
  let t = 600;
  lines.forEach((line, i) => {
    t += line.delay;
    setTimeout(() => {
      _scenePlayLine(line);
      // After the last line, minimize chat windows after a brief pause
      if (i === lines.length - 1) {
        setTimeout(_sceneHideWindows, 3000);
      }
    }, t);
  });
}

function _sceneShowWindows() {
  ['aim-chat', 'icq-chat', 'yahoo-chat'].forEach(id => {
    const el  = document.getElementById('window-' + id);
    const st  = (typeof windowState !== 'undefined') && windowState[id];
    if (!el) return;
    el.style.display = 'block';
    if (st) { st.open = true; st.minimized = false; }
  });
  if (typeof updateTaskbar === 'function') updateTaskbar();
}

function _sceneHideWindows() {
  ['aim-chat', 'icq-chat', 'yahoo-chat'].forEach(id => {
    if (typeof minimizeWindow === 'function') minimizeWindow(id);
  });
}

function _scenePlayLine(line) {
  const { from, text } = line;

  if (from === 'system') {
    if (typeof appendImSystemToAll === 'function') appendImSystemToAll(text);
    return;
  }

  if (from === 'clippy') {
    if (typeof showClippyBubble === 'function') showClippyBubble(text);
    if (typeof playSound === 'function') playSound('clippy-appear');
    return;
  }

  if (from === 'clippy-leave') {
    const bubble = document.getElementById('clippy-bubble');
    if (bubble) {
      bubble.classList.remove('clippy-slide-in');
      setTimeout(() => { bubble.style.display = 'none'; }, 480);
    }
    return;
  }

  // Regular chat message
  const bots  = (typeof IM_BOTS !== 'undefined') ? IM_BOTS : {};
  const bot   = bots[from];
  if (!bot) return;
  const log   = document.getElementById(bot.logId);
  if (!log)   return;

  const escFn = (typeof escHtml === 'function') ? escHtml : (s => s);
  const el    = document.createElement('div');
  el.className = 'im-chat-msg';
  el.innerHTML = `<span class="im-chat-name" style="color:${bot.color}">${escFn(bot.name)}:</span> ${escFn(text)}`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;

  const win = document.getElementById(bot.winId);
  if (win && typeof imBringToFront === 'function') imBringToFront(win);
  if (typeof playSound === 'function') playSound(from + '-receive');
  if (from === 'icq' && typeof icqTrayFlash === 'function') icqTrayFlash();
}
