/* ═══════════════════════════════════════════════════════
   vault.js — Secret Terminal Passcode
   Vince Darrigo / The Mothership

   CHANGE THE CODE: update VAULT_CODE below.
═══════════════════════════════════════════════════════ */

const VAULT_CODE   = '1337';   // ← Change this to your actual code
const MAX_ATTEMPTS = 3;

let vaultAttempts = 0;
let vaultUnlocked = false;

// Called once the vault window opens (triggered by openWindow hook)
// We hook into the vault window's display via a MutationObserver.
(function initVault() {
  const vaultWin = document.getElementById('window-vault');
  if (!vaultWin) return;

  const observer = new MutationObserver(() => {
    if (vaultWin.style.display === 'block' && !vaultWin.dataset.booted) {
      vaultWin.dataset.booted = '1';
      bootSequence();
    }
  });

  observer.observe(vaultWin, { attributes: true, attributeFilter: ['style'] });
})();

// ── BOOT SEQUENCE (typing animation) ─────────────────

function bootSequence() {
  if (vaultUnlocked) {
    showPrompt('Access previously granted. Welcome back.');
    return;
  }

  vaultAttempts = 0;
  const output = document.getElementById('vault-output');
  const inputRow = document.getElementById('vault-input-row');
  output.innerHTML = '';
  inputRow.style.display = 'none';

  const lines = [
    { text: 'VINCE OS v1.0 [Version 1337.0.0]', delay: 0 },
    { text: '(C) Vince Darrigo. All rights reserved.', delay: 180 },
    { text: '', delay: 320 },
    { text: 'Initializing secure subsystem...', delay: 500 },
    { text: 'Loading encrypted project store...', delay: 900 },
    { text: 'Verifying identity...', delay: 1300 },
    { text: '', delay: 1600 },
    { text: '╔══════════════════════════════════════╗', delay: 1800 },
    { text: '║   RESTRICTED AREA — AUTHORIZED USE   ║', delay: 1900, cls: 'vault-line-warn' },
    { text: '╚══════════════════════════════════════╝', delay: 2000 },
    { text: '', delay: 2100 },
    { text: 'Enter access code to continue.', delay: 2300 },
  ];

  lines.forEach(({ text, delay, cls }) => {
    setTimeout(() => {
      appendLine(text, cls);
    }, delay);
  });

  setTimeout(() => {
    inputRow.style.display = 'flex';
    const input = document.getElementById('vault-input');
    input.value = '';
    input.focus();
    input.onkeydown = handleVaultInput;
  }, 2500);
}

// ── INPUT HANDLER ─────────────────────────────────────

function handleVaultInput(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();

  const input = document.getElementById('vault-input');
  const entered = input.value.trim();
  input.value = '';

  if (!entered) return;

  appendLine('> ' + '•'.repeat(entered.length));

  if (entered === VAULT_CODE) {
    vaultUnlocked = true;
    onVaultSuccess();
  } else {
    vaultAttempts++;
    onVaultFail(vaultAttempts);
  }
}

// ── SUCCESS ───────────────────────────────────────────

function onVaultSuccess() {
  const inputRow = document.getElementById('vault-input-row');
  inputRow.style.display = 'none';

  const successLines = [
    { text: '', delay: 0 },
    { text: '[ IDENTITY CONFIRMED ]', delay: 200, cls: 'vault-line-success' },
    { text: 'Loading private project manifest...', delay: 500 },
    { text: '████████████████████ 100%', delay: 1000, cls: 'vault-line-success' },
    { text: '', delay: 1200 },
    { text: 'ACCESS GRANTED. Welcome.', delay: 1400, cls: 'vault-line-success' },
  ];

  successLines.forEach(({ text, delay, cls }) => {
    setTimeout(() => appendLine(text, cls), delay);
  });

  setTimeout(() => {
    document.getElementById('vault-status').textContent = 'ACCESS GRANTED';
    openWindow('private');
  }, 2000);
}

// ── FAILURE ───────────────────────────────────────────

function onVaultFail(attempt) {
  const remaining = MAX_ATTEMPTS - attempt;

  appendLine('', 'vault-line-error');
  appendLine('[ ACCESS DENIED ]', 'vault-line-error');

  if (remaining <= 0) {
    onVaultLockout();
    return;
  }

  appendLine(remaining + ' attempt(s) remaining.', 'vault-line-warn');
  appendLine('');

  // Shake the window
  const vaultWin = document.getElementById('window-vault');
  vaultWin.classList.add('shake');
  setTimeout(() => vaultWin.classList.remove('shake'), 450);

  // Re-show prompt
  const inputRow = document.getElementById('vault-input-row');
  inputRow.style.display = 'flex';
  document.getElementById('vault-input').focus();
}

// ── LOCKOUT (3 failed attempts → BSOD-style) ──────────

function onVaultLockout() {
  const inputRow = document.getElementById('vault-input-row');
  inputRow.style.display = 'none';

  appendLine('');
  appendLine('[ SECURITY LOCKOUT ]', 'vault-line-error');
  appendLine('Maximum attempts exceeded.', 'vault-line-error');
  appendLine('Initiating trace protocol...', 'vault-line-warn');

  setTimeout(() => {
    // Full-screen BSOD easter egg
    document.body.innerHTML = `
      <div style="
        position:fixed; inset:0; background:#0000aa; color:#fff;
        font-family:'Courier New', monospace; font-size:14px;
        padding:60px 80px; line-height:2;
      ">
        <p>A fatal exception 0E has occurred at 0028:C006F43D in VXD VAULT(01) + 000063BD.</p>
        <p>The current application will be terminated.</p>
        <br>
        <p>*  Press any key to terminate the current application.</p>
        <p>*  Press CTRL+ALT+DEL to restart your computer.</p>
        <br>
        <p>If you need to reset your password, email the sysadmin:</p>
        <p style="color:#ffff00;">vincent.darrigo@gmail.com</p>
        <br>
        <p style="color:#aaaaff; font-size:11px;">Press any key to continue _</p>
      </div>`;

    document.addEventListener('keydown', () => location.reload(), { once: true });
    document.addEventListener('click',   () => location.reload(), { once: true });
  }, 1200);
}

// ── HELPERS ───────────────────────────────────────────

function appendLine(text, cls) {
  const output = document.getElementById('vault-output');
  const line = document.createElement('div');
  line.textContent = text;
  if (cls) line.classList.add(cls);
  output.appendChild(line);
  // Auto-scroll
  const terminal = document.getElementById('vault-terminal');
  terminal.scrollTop = terminal.scrollHeight;
}

function showPrompt(msg) {
  const inputRow = document.getElementById('vault-input-row');
  inputRow.style.display = 'none';
  appendLine(msg, 'vault-line-success');
  setTimeout(() => {
    openWindow('private');
  }, 800);
}
