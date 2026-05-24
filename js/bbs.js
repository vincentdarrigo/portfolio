/* ═══════════════════════════════════════════════════════
   bbs.js — The Last Node BBS
   Vince Darrigo / The Mothership

   A fully authentic 1994 BBS experience for the portfolio.
   Navigate with number keys or click highlighted options.
   Easter egg: type MYSPACE at any main menu prompt.
═══════════════════════════════════════════════════════ */

const BBS_HANDLE = 'SYSOP_VINCE';
const BBS_NAME   = 'THE LAST NODE BBS';

let bbsOut       = null;
let bbsScroll    = null;
let bbsInEl      = null;
let bbsPromptEl  = null;
let bbsState     = null;
let bbsStartTime = null;

// ── INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const win = document.getElementById('window-bbs');
  if (!win) return;
  let started = false;
  const obs = new MutationObserver(() => {
    if (win.style.display === 'block' && !started) {
      started = true;
      initBBS();
    }
  });
  obs.observe(win, { attributes: true, attributeFilter: ['style'] });
});

function initBBS() {
  bbsOut      = document.getElementById('bbs-out');
  bbsScroll   = document.getElementById('bbs-scroll');
  bbsInEl     = document.getElementById('bbs-in');
  bbsPromptEl = document.getElementById('bbs-prompt');
  if (!bbsOut) return;

  bbsInEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = bbsInEl.value.trim();
      bbsInEl.value = '';
      bbsHandleInput(v);
    }
  });

  bbsInEl.disabled = true;
  bbsPromptSet('');
  bbsPlayModem();
  bbsRunConnect();
}

// ── TERMINAL ENGINE ────────────────────────────────────

function bbsPrint(html, cls) {
  const d = document.createElement('div');
  d.className = 'bbs-line' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  bbsOut.appendChild(d);
  bbsDrop();
}

function bbsDrop() {
  if (bbsScroll) bbsScroll.scrollTop = bbsScroll.scrollHeight;
}

function bbsClear() {
  if (bbsOut) bbsOut.innerHTML = '';
}

function bbsPromptSet(text) {
  if (bbsPromptEl) bbsPromptEl.textContent = text;
}

// Run an array of { t, c, d } lines sequentially.
// t = innerHTML, c = css class, d = ms delay BEFORE this item.
function bbsRun(lines, done) {
  let i = 0;
  function next() {
    if (i >= lines.length) { if (done) done(); return; }
    const l = lines[i++];
    const go = () => {
      if (l.t !== undefined) bbsPrint(l.t, l.c || '');
      next();
    };
    l.d ? setTimeout(go, l.d) : go();
  }
  next();
}

// ── CONNECT SEQUENCE ──────────────────────────────────

function bbsRunConnect() {
  bbsState = 'connecting';
  bbsRun([
    { t: 'ATDT 555-DARNET', c: 'bbs-dim' },
    { d: 380 },
    { t: '' },
    { t: '&nbsp;&nbsp;...RING...', c: 'bbs-dim' },
    { d: 650 },
    { t: '&nbsp;&nbsp;...RING...', c: 'bbs-dim' },
    { d: 500 },
    { t: '' },
    { d: 200 },
    { t: '<span class="bbs-bright">CONNECT 14400/V42bis</span>' },
    { t: '<span class="bbs-dim">Carrier detected &nbsp;·&nbsp; Protocol: LAPM &nbsp;·&nbsp; Compression: V.42bis</span>' },
    { t: '' },
    { d: 150 },
    { t: '<span class="bbs-box">╔══════════════════════════════════════════════════════════╗</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright">████████╗██╗ &nbsp;██╗███████╗</span><span class="bbs-dim"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THE</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright"> &nbsp;&nbsp;██╔══╝██║ &nbsp;██║██╔════╝</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright"> &nbsp;&nbsp;██║ &nbsp;&nbsp;███████║█████╗ &nbsp;</span><span class="bbs-cyan"> &nbsp;L A S T</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright"> &nbsp;&nbsp;██║ &nbsp;&nbsp;██╔══██║██╔══╝ &nbsp;</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright"> &nbsp;&nbsp;██║ &nbsp;&nbsp;██║ &nbsp;██║███████╗</span><span class="bbs-cyan"> &nbsp;N O D E</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;</span><span class="bbs-bright"> &nbsp;&nbsp;╚═╝ &nbsp;&nbsp;╚═╝ &nbsp;╚═╝╚══════╝</span><span class="bbs-box"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">║ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</span>' },
    { t: '<span class="bbs-box">╚══════════════════════════════════════════════════════════╝</span>' },
    { d: 80 },
    { t: '  Wildcat! BBS v5.01 &nbsp;·&nbsp; <span class="bbs-bright">Node 1 of 1</span> &nbsp;·&nbsp; Deltona, FL' },
    { t: '  <span class="bbs-dim">FidoNet: 1:34/666 &nbsp;·&nbsp; SysOp: <span class="bbs-bright">VINCE</span> &nbsp;·&nbsp; Est. 1994</span>' },
    { t: '' },
    { t: '  <span class="bbs-amber">&ldquo;One line. No waiting. Unless grandma picks up.&rdquo;</span>' },
    { t: '' },
    { d: 280 },
    { t: '<span class="bbs-dim">Scanning for new files...</span>' },
    { d: 550 },
    { t: '<span class="bbs-dim">No viruses found.<span style="font-size:10px">*</span></span>' },
    { t: '<span class="bbs-dim" style="font-size:11px">&nbsp;*Scan performed by VIBESCAN.EXE, last updated 1994.</span>' },
    { t: '' },
    { d: 200 },
    { t: 'Welcome back, <span class="bbs-bright">' + BBS_HANDLE + '</span>.' },
    { t: '<span class="bbs-dim">Last login: 09-17-1996 &nbsp; 11:48 PM</span>' },
    { t: 'You have <span class="bbs-amber">3</span> new messages.' },
    { t: 'You have <span class="bbs-amber">1</span> unpaid shareware guilt trip.' },
    { t: 'Your LORD turns reset in <span class="bbs-amber">02:14:33</span>.' },
    { t: 'Lunatix domain status: <span class="bbs-red">EMOTIONALLY UNRESOLVED</span>.' },
    { t: '' },
    { d: 200 },
    { t: '<span class="bbs-dim">[Press any key to continue&hellip;]</span>' },
  ], () => {
    bbsState = 'splash-wait';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsStartTime = Date.now();
  });
}

// ── INPUT DISPATCHER ──────────────────────────────────

function bbsHandleInput(val) {
  if (val) bbsPrint(val, 'bbs-echo');

  switch (bbsState) {
    case 'splash-wait':  bbsShowMain(); break;
    case 'main':         bbsMainCmd(val); break;
    case 'bulletins':
    case 'profile':
    case 'msg-thread':
    case 'bbs-resume':   bbsShowMain(); break;
    case 'messages':     bbsMsgCmd(val); break;
    case 'files':        bbsFilesCmd(val); break;
    case 'doors':        bbsDoorsCmd(val); break;
    case 'lunatix-menu': bbsLunatixCmd(val); break;
    case 'lunatix-wait':
    case 'lunatix-result':
    case 'lunatix-lnk':  bbsShowDoors(); break;
    case 'sysop':        bbsSysopCmd(val); break;
    case 'logoff':       bbsDialAgain(); break;
    case 'easter':       bbsShowMain(); break;
    default:             bbsShowMain(); break;
  }
}

// ── MAIN MENU ──────────────────────────────────────────

function bbsShowMain() {
  bbsState = 'main';
  const elapsed = bbsStartTime ? Math.floor((Date.now() - bbsStartTime) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">MAIN MENU</span>  &middot;  ' + BBS_NAME);
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'1\')">[1]</span> Bulletins &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Read the latest news');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'2\')">[2]</span> Message Bases &nbsp;&nbsp;&nbsp;Public message boards');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'3\')">[3]</span> File Areas &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Resume, projects, downloads');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'4\')">[4]</span> Door Games &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Interactive doors');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'5\')">[5]</span> User Profile &nbsp;&nbsp;&nbsp;&nbsp;View your BBS identity card');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'6\')">[6]</span> SysOp Page &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;About the system operator');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'9\')">[9]</span> Logoff &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Return to life offline');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">Node: 1/1 &nbsp;&middot;&nbsp; Time online: 00:' + mm + ':' + ss + ' &nbsp;&middot;&nbsp; Turns left: 99</span>');
  bbsPrint('');
  bbsPromptSet('Command? ');
  bbsInEl.disabled = false;
  bbsInEl.focus();
  bbsDrop();
}

function bbsMainCmd(val) {
  const v = (val || '').toUpperCase().trim();
  if (v === '1') { bbsShowBulletins(); return; }
  if (v === '2') { bbsShowMessages(); return; }
  if (v === '3') { bbsShowFiles(); return; }
  if (v === '4') { bbsShowDoors(); return; }
  if (v === '5') { bbsShowProfile(); return; }
  if (v === '6') { bbsShowSysop(); return; }
  if (v === '9') { bbsShowLogoff(); return; }
  if (v === 'MYSPACE') { bbsEasterEgg(); return; }
  if (v === '') { bbsShowMain(); return; }
  bbsPrint('<span class="bbs-amber">Unknown command. Type a number from the menu above, or try MYSPACE.</span>');
  bbsPromptSet('Command? ');
}

// ── BULLETINS ──────────────────────────────────────────

function bbsShowBulletins() {
  bbsState = 'bulletins';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">BULLETINS</span>  &middot;  Last 7 Days');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-bright">NEW</span>] SYSTEM: &nbsp;SysOp upgraded to Python 3.12. All stable.');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-bright">NEW</span>] SYSOP: &nbsp;&nbsp;Resume updated. Employers encouraged to act.');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-amber">OLD</span>] SYSOP: &nbsp;&nbsp;<span class="bbs-dim">Door game &ldquo;Recruiter Quest 95&rdquo; in beta testing.</span>');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-amber">OLD</span>] SYSOP: &nbsp;&nbsp;<span class="bbs-dim">Phone line free Saturdays after 10pm.</span>');
  bbsPrint('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-dim">(Grandma&rsquo;s show ends at 9:30.)</span>');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-amber">OLD</span>] SYSTEM: <span class="bbs-dim">Y2K readiness status: vibes-based.</span>');
  bbsPrint('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-dim">Patch pending end of fiscal mood.</span>');
  bbsPrint('&nbsp;&nbsp;[<span class="bbs-amber">OLD</span>] NET: &nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-dim">FidoNet echo scan completed. No drama today.</span>');
  bbsPrint('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-dim">(Unusual. Logs archived for posterity.)</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('<span class="bbs-dim">[Press Enter to return to main menu]</span>');
  bbsPromptSet('');
}

// ── MESSAGE BASES ──────────────────────────────────────

function bbsShowMessages() {
  bbsState = 'messages';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">MESSAGE BASES</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'1\')">[1]</span> GENERAL &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Introductions, modem complaints &nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-amber">12 new</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'2\')">[2]</span> DEV &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Python, APIs, Flask, automation &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-amber">5 new</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'3\')">[3]</span> SYSOP NOTES &nbsp;Portfolio updates &amp; release notes &nbsp;&nbsp;<span class="bbs-amber">2 new</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'4\')">[4]</span> DOOR GAMES &nbsp;&nbsp;Daily turn trauma support group &nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-dim">0 new</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'5\')">[5]</span> JOBS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Recruiters seeking rare artifacts &nbsp;&nbsp;<span class="bbs-amber">3 new</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPromptSet('Select base (or Enter to skip): ');
}

function bbsMsgCmd(val) {
  if (val === '5') { bbsJobsThread(); return; }
  if (!val || val === '') { bbsShowMain(); return; }
  // Any other base: flavor text then back
  bbsPrint('');
  bbsPrint('<span class="bbs-dim">Reading messages&hellip;</span>');
  setTimeout(() => {
    bbsPrint('<span class="bbs-dim">(No new messages that aren&rsquo;t from recruiter bots.)</span>');
    setTimeout(() => bbsShowMain(), 900);
  }, 500);
}

function bbsJobsThread() {
  bbsState = 'msg-thread';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">MESSAGE BASE: JOBS</span>  &middot;  3 messages');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;Msg 1 of 3  &mdash;  From: <span class="bbs-bright">RECRUITER_KAITLYN</span>');
  bbsPrint('&nbsp;&nbsp;To: ALL &nbsp;&middot;&nbsp; Date: Today, 3:47 PM');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;Hey! Found your BBS! Exciting opportunity in [CITY].');
  bbsPrint('&nbsp;&nbsp;Requires 10 years Python 3.12 experience (released 2022).');
  bbsPrint('&nbsp;&nbsp;Budget: competitive. Vibe: hybrid. Is there a resume here?');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Msg 2 of 3  &mdash;  From: <span class="bbs-bright">SYSOP_VINCE</span>');
  bbsPrint('&nbsp;&nbsp;To: RECRUITER_KAITLYN &nbsp;&middot;&nbsp; Date: Today, 3:52 PM');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;Yes. File Areas &gt; [3]. Also available in human conversation.');
  bbsPrint('&nbsp;&nbsp;Available immediately. Also: &ldquo;10 years in a 3-year-old');
  bbsPrint('&nbsp;&nbsp;language&rdquo; is a known BBS scam. Check facts before re-listing.');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Msg 3 of 3  &mdash;  From: <span class="bbs-bright">RECRUITER_KAITLYN</span>');
  bbsPrint('&nbsp;&nbsp;To: SYSOP_VINCE &nbsp;&middot;&nbsp; Date: Today, 4:05 PM');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;...');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-red">[CARRIER LOST]</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('<span class="bbs-dim">[Press Enter to return to main menu]</span>');
  bbsPromptSet('');
}

// ── FILE AREAS ─────────────────────────────────────────

function bbsShowFiles() {
  bbsState = 'files';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">FILE AREAS</span>');
  bbsPrint('&nbsp;&nbsp;Ratio: uploads <span class="bbs-dim">0</span> &nbsp;/ downloads <span class="bbs-amber">37</span> &nbsp;/ shame: <span class="bbs-red">IMMENSE</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;FILENAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SIZE &nbsp;&nbsp; DATE');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'D\')">Vince_Darrigo_Resume.docx</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;128K &nbsp;&nbsp; 05-2026 &nbsp;<span class="bbs-bright">[D]</span>');
  bbsPrint('&nbsp;&nbsp;IMRAFACE_case_study.txt &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;42K &nbsp;&nbsp; 04-2026');
  bbsPrint('&nbsp;&nbsp;QUESTFORGE_scavenger_demo.txt &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;38K &nbsp;&nbsp; 03-2026');
  bbsPrint('&nbsp;&nbsp;PREDICTRIX_engine_spec.txt &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;29K &nbsp;&nbsp; 02-2026');
  bbsPrint('&nbsp;&nbsp;ANYTIME_TRIVIA_notes.txt &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18K &nbsp;&nbsp; 01-2026');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">DEFINITELY_NOT_WAREZ.zip &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;99K &nbsp;&nbsp; <span class="bbs-red">**LOCKED**</span></span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">Transfer protocol: ZMODEM &nbsp;&middot;&nbsp; Max 2MB/day &nbsp;&middot;&nbsp; YMODEM batch OK</span>');
  bbsPrint('');
  bbsPromptSet('[D]ownload resume / [Enter] exit: ');
}

function bbsFilesCmd(val) {
  if ((val || '').toUpperCase() === 'D') {
    const a = document.createElement('a');
    a.href = 'Vince_Darrigo_ElevenLabs_FullStack_Backend_Resume_Draft.docx';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    bbsPrint('');
    bbsPrint('<span class="bbs-dim">Initiating ZMODEM transfer&hellip;</span>');
    setTimeout(() => {
      bbsPrint('&nbsp;&nbsp;<span class="bbs-bright">Vince_Darrigo_Resume.docx &nbsp; 128K &nbsp; ████████████ 100%</span>');
      bbsPrint('<span class="bbs-dim">Transfer complete. File saved to your downloads.</span>');
      setTimeout(() => bbsShowMain(), 1000);
    }, 700);
  } else {
    bbsShowMain();
  }
}

// ── DOOR GAMES ─────────────────────────────────────────

function bbsShowDoors() {
  bbsState = 'doors';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">DOOR GAMES</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'1\')">[1]</span> Lunatix Memorial Domain &nbsp;&nbsp;&nbsp;&larr; You have unresolved grief');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">[2] Legend of the Red Dragon &nbsp;&nbsp;&nbsp;(Offline &mdash; SysOp napping)</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">[3] TradeWars 2002 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Offline &mdash; port disruption)</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'4\')">[4]</span> Barren Realms Resume &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&larr; View resume as BBS character');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">[5] Recruiter Quest 95 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Coming soon)</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'6\')">[6]</span> Minesweeper Door &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&larr; Launch Minesweeper');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'7\')">[7]</span> Snake on a Nokia Door &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&larr; Launch Snake');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'8\')">[8]</span> Return to main menu');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">Turns remaining today: <span class="bbs-amber">3</span> &nbsp;&middot;&nbsp; LORD turns reset: <span class="bbs-amber">02:14:33</span></span>');
  bbsPrint('');
  bbsPromptSet('Door? ');
}

function bbsDoorsCmd(val) {
  switch ((val || '').trim()) {
    case '1': bbsLunatix(); break;
    case '2':
    case '3':
      bbsPrint('');
      bbsPrint('<span class="bbs-dim">Launching door&hellip;</span>');
      setTimeout(() => {
        bbsPrint('<span class="bbs-amber">Connection timed out. The SysOp was napping. As warned.</span>');
        setTimeout(() => bbsShowDoors(), 900);
      }, 700);
      break;
    case '4': bbsShowResumeAsBBS(); break;
    case '5':
      bbsPrint('');
      bbsPrint('<span class="bbs-dim">&ldquo;Recruiter Quest 95&rdquo; is in active development.</span>');
      bbsPrint('<span class="bbs-dim">Check back after the SysOp sleeps on the storyline.</span>');
      setTimeout(() => bbsShowDoors(), 1200);
      break;
    case '6':
      bbsPrint('');
      bbsPrint('<span class="bbs-dim">Launching Minesweeper Door&hellip; returning to BBS when done.</span>');
      setTimeout(() => { if (typeof openWindow === 'function') openWindow('minesweeper'); bbsShowDoors(); }, 500);
      break;
    case '7':
      bbsPrint('');
      bbsPrint('<span class="bbs-dim">Launching Snake Door&hellip; returning to BBS when done.</span>');
      setTimeout(() => { if (typeof openWindow === 'function') openWindow('snake'); bbsShowDoors(); }, 500);
      break;
    case '8':
    case '':
      bbsShowMain();
      break;
    default:
      bbsPrint('<span class="bbs-amber">Invalid door selection.</span>');
      bbsPromptSet('Door? ');
  }
}

// ── LUNATIX MEMORIAL ───────────────────────────────────

function bbsLunatix() {
  bbsState = 'lunatix-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: '<span class="bbs-dim">Connecting to Lunatix domain server&hellip;</span>' },
    { d: 420 },
    { t: '<span class="bbs-dim">Remote server found.</span>' },
    { d: 300 },
    { t: '<span class="bbs-dim">Pulling player records&hellip;</span>' },
    { d: 600 },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;.</span>' },
    { d: 250 },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;..</span>' },
    { d: 250 },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;...</span>' },
    { d: 300 },
    { t: '' },
    { t: '<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-title">LUNATIX MEMORIAL DOMAIN</span>' },
    { t: '<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>' },
    { t: '' },
    { t: '&nbsp;&nbsp;Former ruler detected: <span class="bbs-bright">SYSOP_VINCE</span>' },
    { t: '' },
    { t: '&nbsp;&nbsp;STATUS: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-red">██████████ WIPED ██████████</span>' },
    { t: '&nbsp;&nbsp;REASON: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Failed to log in within 7-day window' },
    { t: '&nbsp;&nbsp;LAST ACTION: &nbsp;&nbsp;Attempted domain maintenance from a boat' },
    { t: '&nbsp;&nbsp;RULING: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-red">DENIED &mdash; carrier lost at sea</span>' },
    { t: '&nbsp;&nbsp;SESSIONS LOST: <span class="bbs-red">&infin;</span>' },
    { t: '' },
    { t: '<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>' },
    { t: '' },
    { t: '&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'1\')">[1]</span> Grieve' },
    { t: '&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'2\')">[2]</span> Attempt to rebuild the empire' },
    { t: '&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'3\')">[3]</span> Blame the boat' },
    { t: '&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'4\')">[4]</span> Add to LinkedIn as leadership experience' },
    { t: '&nbsp;&nbsp;<span class="bbs-bright bbs-clickable" onclick="bbsHandleInput(\'5\')">[5]</span> Return to door games' },
    { t: '' },
  ], () => {
    bbsState = 'lunatix-menu';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPromptSet('Response? ');
  });
}

function bbsLunatixCmd(val) {
  switch ((val || '').trim()) {
    case '1': bbsLunatixGrieve(); break;
    case '2': bbsLunatixRebuild(); break;
    case '3': bbsLunatixBoat(); break;
    case '4': bbsLunatixLinkedIn(); break;
    case '5': bbsShowDoors(); break;
    default:
      bbsPrint('<span class="bbs-amber">Invalid response.</span>');
      bbsPromptSet('Response? ');
  }
}

function bbsLunatixGrieve() {
  bbsState = 'lunatix-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: 'You sit in silence.', c: 'bbs-dim' },
    { d: 650 },
    { t: '&hellip;', c: 'bbs-dim' },
    { d: 550 },
    { t: 'The modem makes a small, sad noise.', c: 'bbs-dim' },
    { d: 700 },
    { t: '&hellip;', c: 'bbs-dim' },
    { d: 500 },
    { t: 'Time passes.', c: 'bbs-dim' },
    { d: 900 },
    { t: 'Your LORD turns are still 0.', c: 'bbs-dim' },
    { d: 600 },
    { t: '' },
    { t: '<span class="bbs-amber">Some losses cannot be undone.</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">[Press Enter to continue&hellip;]</span>' },
  ], () => {
    bbsState = 'lunatix-result';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPromptSet('');
  });
}

function bbsLunatixRebuild() {
  bbsState = 'lunatix-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: '<span class="bbs-dim">Reconnecting to Lunatix domain server&hellip;</span>' },
    { d: 450 },
    { t: '<span class="bbs-red">ERROR: Domain SYSOP_VINCE not found.</span>' },
    { t: '<span class="bbs-red">ERROR: Territories redistributed circa 1996.</span>' },
    { t: '<span class="bbs-red">ERROR: Legacy ruler status: HISTORICAL FOOTNOTE.</span>' },
    { t: '' },
    { d: 300 },
    { t: 'Current top player: <span class="bbs-bright">WARLORD_BRETT</span>' },
    { t: '<span class="bbs-dim">Location: Toledo, OH</span>' },
    { t: '<span class="bbs-dim">He has never heard of you.</span>' },
    { t: '' },
    { t: '<span class="bbs-amber">Some kingdoms are better remembered than rebuilt.</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">[Press Enter to continue&hellip;]</span>' },
  ], () => {
    bbsState = 'lunatix-result';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPromptSet('');
  });
}

function bbsLunatixBoat() {
  bbsState = 'lunatix-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: '<span class="bbs-dim">Processing blame transfer&hellip;</span>' },
    { d: 400 },
    { t: 'Blame directed at: <span class="bbs-bright">THE BOAT</span>' },
    { d: 200 },
    { t: '<span class="bbs-dim">SysOp note: The boat has been notified.</span>' },
    { t: '<span class="bbs-dim">The boat does not care.</span>' },
    { t: '<span class="bbs-dim">The boat was in international waters with poor connectivity.</span>' },
    { t: '' },
    { d: 250 },
    { t: '<span class="bbs-cyan">╔══════════════════════════════════════════════════════╗</span>' },
    { t: '<span class="bbs-cyan">║</span>  <span class="bbs-bright">ACHIEVEMENT UNLOCKED: &ldquo;It Was the Boat&rdquo;</span>  <span class="bbs-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="bbs-cyan">║</span>' },
    { t: '<span class="bbs-cyan">╚══════════════════════════════════════════════════════╝</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">Lesson recorded in system log:</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&rarr; Production systems need alerting.</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&rarr; &ldquo;I was on a boat&rdquo; is not incident response.</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&rarr; SLO violations require more than blame transfer.</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">[Press Enter to continue&hellip;]</span>' },
  ], () => {
    bbsState = 'lunatix-result';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPromptSet('');
  });
}

function bbsLunatixLinkedIn() {
  bbsState = 'lunatix-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: '<span class="bbs-dim">COMPOSING LINKEDIN POST&hellip;</span>' },
    { d: 500 },
    { t: '' },
    { t: '<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>' },
    { t: '' },
    { t: '💡 I learned something valuable in 1994.' },
    { t: '' },
    { t: 'I was the ruler of an online kingdom.' },
    { t: 'I went on a family boat trip and missed a login window.' },
    { t: 'My empire was wiped.' },
    { t: '' },
    { t: 'Looking back, this was my first lesson in:' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&bull; SLOs and uptime windows</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&bull; The cost of missing a maintenance event</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&bull; Why production systems need monitoring &amp; alerting</span>' },
    { t: '&nbsp;&nbsp;<span class="bbs-amber">&bull; Why &ldquo;I was on a boat&rdquo; is not incident response</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">This shapes how I build today: with alerting, retry logic,</span>' },
    { t: '<span class="bbs-dim">dry-run modes, and explicit failure reporting.</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">(The boat was worth it. The kingdom was not.)</span>' },
    { t: '' },
    { t: '<span class="bbs-dim">#Engineering #Reliability #BBS #Lunatix #Leadership</span>' },
    { t: '' },
    { t: '<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>' },
    { d: 350 },
    { t: '<span class="bbs-dim">Post sent to 847 connections.</span>' },
    { t: '<span class="bbs-bright">12 likes</span> <span class="bbs-dim">&middot; 2 confused reactions &middot; 1 &ldquo;What is Lunatix?&rdquo;</span>' },
    { t: '' },
    { d: 300 },
    { t: '<span class="bbs-dim">[Press Enter to continue&hellip;]</span>' },
  ], () => {
    bbsState = 'lunatix-lnk';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPromptSet('');
  });
}

// ── RESUME AS BBS CHARACTER SHEET ─────────────────────

function bbsShowResumeAsBBS() {
  bbsState = 'bbs-resume';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">BARREN REALMS RESUME</span> &middot; Character Sheet v10.2');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Name: &nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">VINCE DARRIGO</span>');
  bbsPrint('&nbsp;&nbsp;Class: &nbsp;&nbsp;&nbsp;Python Systems Builder (Full-Stack, Back-End Oriented)');
  bbsPrint('&nbsp;&nbsp;Location: Deltona, FL &nbsp;(Remote preferred)');
  bbsPrint('&nbsp;&nbsp;Alignment: Chaotic Good');
  bbsPrint('&nbsp;&nbsp;Level: &nbsp;&nbsp;&nbsp;10+ years field experience');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;SKILL &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LEVEL');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;Python &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">██████████ MASTER</span>');
  bbsPrint('&nbsp;&nbsp;Flask / APIs &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">█████████░ EXPERT</span>');
  bbsPrint('&nbsp;&nbsp;Automation / Workflow &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">█████████░ EXPERT</span>');
  bbsPrint('&nbsp;&nbsp;JavaScript / Frontend &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-amber">████████░░ ADVANCED</span>');
  bbsPrint('&nbsp;&nbsp;SQL / Data Pipelines &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-amber">████████░░ ADVANCED</span>');
  bbsPrint('&nbsp;&nbsp;Smartsheet API &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">██████████ SYSOP-TIER</span>');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;CURRENT QUEST: &nbsp;Find the right backend/full-stack role');
  bbsPrint('&nbsp;&nbsp;SPECIAL MOVE: &nbsp;&nbsp;Builds things that actually work');
  bbsPrint('&nbsp;&nbsp;KNOWN WEAKNESS: Boat trips with no connectivity');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Contact: <span class="bbs-bright">vincent.darrigo@gmail.com</span>');
  bbsPrint('&nbsp;&nbsp;Resume:  File Areas &gt; [D]ownload');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('<span class="bbs-dim">[Press Enter to return to main menu]</span>');
  bbsPromptSet('');
}

// ── USER PROFILE ───────────────────────────────────────

function bbsShowProfile() {
  bbsState = 'profile';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">USER PROFILE</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;Handle: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">SYSOP_VINCE</span>');
  bbsPrint('&nbsp;&nbsp;Real Name: &nbsp;&nbsp;Vince Darrigo');
  bbsPrint('&nbsp;&nbsp;Security: &nbsp;&nbsp;&nbsp;<span class="bbs-bright">255</span>  (SysOp)');
  bbsPrint('&nbsp;&nbsp;Location: &nbsp;&nbsp;&nbsp;Deltona, FL');
  bbsPrint('&nbsp;&nbsp;Class: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Python Systems Builder');
  bbsPrint('&nbsp;&nbsp;Alignment: &nbsp;&nbsp;Chaotic Good');
  bbsPrint('&nbsp;&nbsp;Times called: &infin; &nbsp;(it\'s his BBS)');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Uploads: &nbsp;&nbsp;Useful automation, Flask portals');
  bbsPrint('&nbsp;&nbsp;Downloads: Employer attention, good vibes');
  bbsPrint('&nbsp;&nbsp;Ratio: &nbsp;&nbsp;&nbsp;&nbsp;<span class="bbs-bright">SUSPICIOUSLY STRONG</span>');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;PLAN:');
  bbsPrint('&nbsp;&nbsp;Build weird things.');
  bbsPrint('&nbsp;&nbsp;Ship useful things.');
  bbsPrint('&nbsp;&nbsp;Make recruiters remember the name.');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;RECENT CALLERS:');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright">xXAwayMsgPoetXx</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;13 mins ago');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright">UhOhProtocol</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11 mins ago');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright">BUZZ_ME_BRO</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9 mins ago');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-bright">ClipOps</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2 mins ago');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-amber">Recruiter_200K</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;currently lurking');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('<span class="bbs-dim">[Press Enter to return to main menu]</span>');
  bbsPromptSet('');
}

// ── SYSOP PAGE ─────────────────────────────────────────

function bbsShowSysop() {
  bbsState = 'sysop';
  bbsPrint('');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-title">SYSOP PAGE</span>  &middot;  The SysOp is <span class="bbs-bright">IN</span>.');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Python-focused full-stack engineer.');
  bbsPrint('&nbsp;&nbsp;10+ years turning chaotic operations into reliable systems.');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Currently: <span class="bbs-bright">Senior Data Specialist @ Safal Partners</span>');
  bbsPrint('&nbsp;&nbsp;Available: Yes, immediately, enthusiastically.');
  bbsPrint('&nbsp;&nbsp;Location:  Deltona, FL  (remote preferred)');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Python &middot; Flask &middot; APIs &middot; Automation &middot; JavaScript');
  bbsPrint('&nbsp;&nbsp;SQL &middot; Smartsheet &middot; Workflow systems &middot; Data pipelines');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;Email: &nbsp;&nbsp;<span class="bbs-bright">vincent.darrigo@gmail.com</span>');
  bbsPrint('&nbsp;&nbsp;GitHub: <span class="bbs-bright">github.com/vincentdarrigo</span>');
  bbsPrint('&nbsp;&nbsp;Portfolio: <span class="bbs-dim">[you\'re already in it]</span>');
  bbsPrint('');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-dim">──────────────────────────────────────────────────────</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-amber">&ldquo;If you\'ve made it this far, you deserve a job offer.</span>');
  bbsPrint('&nbsp;&nbsp;<span class="bbs-amber">&nbsp;Or at least a reply. Page me. I\'ll pick up.&rdquo;</span>');
  bbsPrint('<span class="bbs-cyan">══════════════════════════════════════════════════════════</span>');
  bbsPrint('');
  bbsPromptSet('[P]age SysOp (email) / [Enter] return: ');
}

function bbsSysopCmd(val) {
  if ((val || '').toUpperCase() === 'P') {
    window.location.href = 'mailto:vincent.darrigo@gmail.com?subject=Paging%20the%20SysOp%20from%20The%20Last%20Node%20BBS';
  }
  bbsShowMain();
}

// ── LOGOFF ─────────────────────────────────────────────

function bbsShowLogoff() {
  bbsState = 'logoff-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: 'Thank you for calling <span class="bbs-bright">' + BBS_NAME + '</span>.' },
    { t: 'Good night, <span class="bbs-bright">' + BBS_HANDLE + '</span>.' },
    { d: 350 },
    { t: '<span class="bbs-dim">Logging carrier time&hellip; &nbsp;00:02:47</span>' },
    { d: 350 },
    { t: '<span class="bbs-dim">Dropping DTR&hellip;</span>' },
    { d: 450 },
    { t: '&hellip;' },
    { d: 400 },
    { t: '<span class="bbs-bright">NO CARRIER</span>' },
    { t: '' },
    { d: 350 },
    { t: '<span class="bbs-dim">[Connection to ' + BBS_NAME + ' has been terminated]</span>' },
    { t: '' },
    { d: 400 },
  ], () => {
    bbsPrint('<span class="bbs-amber bbs-clickable" onclick="bbsDialAgain()" style="cursor:pointer;">[Dial again?]</span>');
    bbsDrop();
    bbsState = 'logoff';
    bbsInEl.disabled = false;
    bbsInEl.focus();
  });
}

function bbsDialAgain() {
  bbsClear();
  bbsState = null;
  bbsStartTime = null;
  bbsPlayModem();
  bbsRunConnect();
}

// ── EASTER EGG: MYSPACE ────────────────────────────────

function bbsEasterEgg() {
  bbsState = 'easter-wait';
  bbsInEl.disabled = true;
  bbsRun([
    { t: '' },
    { t: '<span class="bbs-dim">Searching for MYSPACE.EXE&hellip;</span>' },
    { d: 600 },
    { t: '<span class="bbs-amber">File found: C:\\BBS\\DOORS\\MYSPACE.EXE</span>' },
    { t: '<span class="bbs-dim">Timestamp: <span class="bbs-red">2003-07-16</span> &nbsp;&larr; !!</span>' },
    { t: '' },
    { d: 200 },
    { t: '<span class="bbs-red">WARNING: This file is from 9 years in the future.</span>' },
    { t: '<span class="bbs-red">WARNING: Temporal paradox detected.</span>' },
    { t: '<span class="bbs-red">WARNING: This throwback does NOT belong in 1994.</span>' },
    { t: '' },
    { d: 350 },
    { t: '<span class="bbs-dim">Launching anyway&hellip;</span>' },
    { d: 800 },
    { t: '' },
    { t: '<span class="bbs-dim">System note: MySpace launched July 2003.</span>' },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This BBS is operating in 1994.</span>' },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Please explain your time machine.</span>' },
    { t: '<span class="bbs-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The SysOp has questions.</span>' },
    { t: '' },
  ], () => {
    window.open('guestbook.html', '_blank');
    bbsState = 'easter';
    bbsInEl.disabled = false;
    bbsInEl.focus();
    bbsPrint('<span class="bbs-dim">[Guestbook launched. Press Enter to return to main menu.]</span>');
    bbsPromptSet('');
  });
}

// ── MODEM SOUND (Web Audio API) ────────────────────────

function bbsPlayModem() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime + 0.05;

    const tone = (freq, dur, vol) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
      t += dur;
    };

    // Dial tone: 350 + 440 Hz simultaneous
    [350, 440].forEach(f => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; const s = ctx.currentTime + 0.05; g.gain.setValueAtTime(0.06, s); g.gain.linearRampToValueAtTime(0, s + 0.3); o.start(s); o.stop(s + 0.35); });
    t += 0.32;

    // DTMF-ish dialing
    [697,770,852,941,1209,1336,1477,697].forEach(f => { tone(f, 0.055, 0.05); t += 0.02; });

    // Ringing (two bursts)
    t += 0.2;
    [480, 440, 480, 440].forEach(f => { tone(f, 0.22, 0.06); t += 0.02; });

    // Answer + handshake screech
    t += 0.15;
    [2100, 1800, 2100, 600, 1200, 2400, 1200, 600, 2400].forEach(f => { tone(f, 0.06, 0.05); });

    setTimeout(() => { try { ctx.close(); } catch(e){} }, 4500);
  } catch (e) { /* silent fail */ }
}
